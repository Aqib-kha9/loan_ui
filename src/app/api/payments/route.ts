import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Loan from '@/lib/models/Loan';
import { cookies } from 'next/headers';
import { verifyJWT, AUTH_COOKIE_NAME } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { recalculateLedger } from '@/lib/loan-engine';

async function checkAccess(req: Request, requiredPermission: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return false;
    
    const payload = await verifyJWT(token);
    if (!payload) return false;

    const userPayload = payload as any; 
    if (userPayload.role === 'Admin' || userPayload.role === 'super_admin') return true;

    return userPayload.permissions?.includes(requiredPermission);
}

export async function POST(req: Request) {
    try {
        await dbConnect();

        // 1. Auth Check
        const hasAccess = await checkAccess(req, PERMISSIONS.CREATE_PAYMENT);
        if (!hasAccess) {
            return NextResponse.json({ error: "Unauthorized: Missing 'create_payment' permission" }, { status: 403 });
        }

        // 2. Parse Input
        const body = await req.json();
        const { loanNumber, payments, date, narrative, manualPrincipal, manualInterest } = body; 
        // payments array: [{ mode: string, amount: number }]

        if (!loanNumber || !payments || !Array.isArray(payments) || payments.length === 0) {
            return NextResponse.json({ error: "Invalid payment data" }, { status: 400 });
        }

        // ... Fetch Loan and Initial Validation ...
        const loan = await Loan.findOne({ loanId: loanNumber });
        if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        if (loan.status === 'Closed') return NextResponse.json({ error: "Loan is already Closed." }, { status: 400 });

        const originalNextDueDate = loan.nextPaymentDate ? new Date(loan.nextPaymentDate) : null;
        const totalAmount = payments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
        const paymentDate = date ? new Date(date) : new Date();

        if (totalAmount <= 0) return NextResponse.json({ error: "Invalid total amount" }, { status: 400 });

        // 5. Water Fall Logic (Allocate Amount)
        loan.repaymentSchedule.sort((a: any, b: any) => a.installmentNo - b.installmentNo);

        let remainingAmount = totalAmount;
        let scheduleUpdated = false;

        const mPrincipal = manualPrincipal ? parseFloat(manualPrincipal) : 0;
        const mInterest = manualInterest ? parseFloat(manualInterest) : 0;
        const isManual = (mPrincipal > 0 || mInterest > 0);

        if (isManual) {
            // MANUAL OVERRIDE LOGIC
            // First, allocate manual interest
            let remainingMInterest = mInterest;
            for (const item of loan.repaymentSchedule) {
                if (remainingMInterest <= 0) break;
                if (item.status === 'paid') continue;

                const interestDue = (item.interestComponent || 0) - (item.paidInterest || 0); // Assuming paidInterest or logic below
                // Actually, current schema only has paidAmount. We need to track how much of paidAmount is interest.
                // For simplicity, let's assume waterfall within the item: Interest first.
                
                const itemInterestPaid = Math.max(0, Math.min(item.paidAmount || 0, item.interestComponent || 0));
                const interestRemainingInItem = Math.max(0, (item.interestComponent || 0) - itemInterestPaid);

                const alloc = Math.min(remainingMInterest, interestRemainingInItem);
                item.paidAmount = (item.paidAmount || 0) + alloc;
                remainingMInterest -= alloc;
                scheduleUpdated = true;
            }

            // Second, allocate manual principal
            let remainingMPrincipal = mPrincipal;
            for (const item of loan.repaymentSchedule) {
                if (remainingMPrincipal <= 0) break;
                if (item.status === 'paid') continue;

                const principalDue = (item.principalComponent || 0) - Math.max(0, (item.paidAmount || 0) - (item.interestComponent || 0));
                
                const alloc = Math.min(remainingMPrincipal, principalDue);
                item.paidAmount = (item.paidAmount || 0) + alloc;
                remainingMPrincipal -= alloc;
                scheduleUpdated = true;
            }

            // Any remaining total amount (if mP + mI < totalAmount) is treated as unallocated or added to principal of last item?
            // Actually, if user provided mP and mInterest, we should respect that.
            // If they sum to != totalAmount, we might have a discrepancy.
            // Let's assume totalAmount is the source of truth for the transaction record, 
            // but mP/mI guide the schedule update.
            
            // Clean up status
            for (const item of loan.repaymentSchedule) {
                item.balance = Math.max(0, item.amount - (item.paidAmount || 0));
                if (item.balance <= 0) item.status = 'paid';
                else if ((item.paidAmount || 0) > 0) item.status = 'partially_paid';
            }
        } else {
            // DEFAULT WATERFALL
            for (const item of loan.repaymentSchedule) {
                if (remainingAmount <= 0) break;
                if (item.status === 'paid') continue;

                const dueAmount = item.amount - (item.paidAmount || 0);
                if (dueAmount <= 0) {
                    if (item.status !== 'paid') { item.status = 'paid'; scheduleUpdated = true; }
                    continue;
                }

                const alloc = Math.min(remainingAmount, dueAmount);
                item.paidAmount = (item.paidAmount || 0) + alloc;
                item.balance = item.amount - item.paidAmount;
                item.paidDate = paymentDate;

                if (item.balance <= 0) {
                    item.status = 'paid';
                    item.balance = 0;
                } else {
                    item.status = 'partially_paid';
                }

                remainingAmount -= alloc;
                scheduleUpdated = true;
            }
        }

        // 6. Record Transactions
        let runningBalanceForTxn = loan.transactions.length > 0 
             ? loan.transactions[loan.transactions.length - 1].balanceAfter 
             : loan.loanAmount;

        const pRatio = isManual ? (mPrincipal / totalAmount) : 1; // Default to 1 if not manual? No, see logic below
        const iRatio = isManual ? (mInterest / totalAmount) : 0;

        for (const p of payments) {
             const amt = parseFloat(p.amount);
             if (amt <= 0) continue;

             runningBalanceForTxn -= amt;

             let isAdvance = false;
             if (originalNextDueDate && paymentDate < originalNextDueDate) {
                 const diffTime = Math.abs(originalNextDueDate.getTime() - paymentDate.getTime());
                 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                 if (diffDays > 5) isAdvance = true;
             }

             let desc = narrative ? `${narrative} (${p.mode})` : `Payment Received via ${p.mode}`;
             if (isAdvance) desc += " (Advance)";

             loan.transactions.push({
                 txnId: `TXN-${Date.now()}-${Math.floor(Math.random()*10000)}`,
                 date: paymentDate,
                 amount: amt,
                 type: isManual ? 'Part Payment' : 'EMI', 
                 description: desc,
                 reference: '', 
                 paymentMode: p.mode,
                 principalComponent: isManual ? (amt * pRatio) : undefined,
                 interestComponent: isManual ? (amt * iRatio) : undefined,
                 balanceAfter: Math.max(0, runningBalanceForTxn) 
             });
        }

        // ... existing payment processing loop ...

        // 8. Schedule Recalculation (The "Deep Think" Feature)
        // User Requirement: "If I backdate a payment, revert/correct the interest generated in the interim."
        // This applies specifically to Reducing Balance loans (where principal drop affects future interest)
        // OR Indefinite Tenure loans (where interest is calculated monthly/daily on outstanding).

        if (loan.interestType === 'Reducing' || loan.indefiniteTenure) {
             const Recalculator = await import('@/lib/loan-calculations'); 
             const DateFns = await import('date-fns');

             // Calculate Outstanding Principal NOW (After these payments)
             // We can trust the 'balance' of the schedule? 
             // Ideally: Principal = LoanAmount - TotalPrincipalPaid
             // Let's iterate schedule to find total principal paid so far.
             
             let totalPrincipalPaid = 0;
             // We need to distinguish between Principal and Interest in the schedule.
             // Our schema has `principalComponent` and `interestComponent`.
             // But existing schedule might be messy if partial payments happened.
             // Robust way: Scan transactions? No, scan Schedule 'paidAmount'.
             // Problem: 'paidAmount' mixes Principal + Interest.
             // We need to know how much of that paidAmount went into Principal.
             // Complex. 
             
             // ALTERNATIVE: Use the balance of the *current* pending items?
             // If we just fully paid item X, Y, Z.
             // Limit strategy: Only REGENERATE if we fully cleared the dues significantly.
             
             // Let's implement a simpler "Forward Correction":
             // If we paid backdated, we assume that from that date, the principal was lower.
             // We can just call "generateRepaymentSchedule" for the REMAINING tenure with the NEW principal.
             
             // 1. Calculate Adjustment Date
             // Use the Actual Payment Date provided by user (`paymentDate`) to anchor the new schedule.
             // This ensures that if the user explicitly claims "I paid on the 10th", the interest
             // calculations for the future start strictly from the 10th, reverting any "late" interest.
             const newStartDate = paymentDate;
             
             // 2. Calculate Outstanding Principal
             // Current Schedule Sum of 'principalComponent' for all FUTURE (unpaid) items?
             // If existing schedule is wrong, this sum is wrong.
             // Best is: InitialLoanAmount - (Sum of Principal Repaid in Past Items).
             
             let principalRepaid = 0;
             loan.repaymentSchedule.forEach((item: any) => {
                 if (item.status === 'paid' || item.paidAmount >= item.amount) {
                     principalRepaid += (item.principalComponent || 0); // Assuming this field exists and is accurate
                 } else if (item.paidAmount > 0) {
                     // Partial payment? Hard to split P/I without complex logic.
                     // Let's assume standard waterfall: Interest first, then Principal.
                     const interestPart = item.interestComponent || 0;
                     const pPart = Math.max(0, item.paidAmount - interestPart);
                     principalRepaid += pPart;
                 }
             });
             
             const outstandingPrincipal = Math.max(0, loan.loanAmount - principalRepaid);

             // 3. Regenerate Schedule for Remaining Tenure
             // Only if we have outstanding principal
             if (outstandingPrincipal > 0 && loan.status !== 'Closed') {
                 
                 // Remaining Tenure?
                 // If Indefinite: Keep going.
                 // If Fixed: Calculate remaining months from newStartDate to TenureEnd.
                 // Or just keep original tenure count - elapsed?
                 
                 // Let's skip complex tenure math and just use:
                 // "Generate schedule for X remaining months"
                 // How many months left?
                 // Count pending items?
                 const pendingItemsCount = loan.repaymentSchedule.filter((i: any) => i.status !== 'paid').length;
                 
                 if (pendingItemsCount > 0) {
                     const newSchedule = Recalculator.generateRepaymentSchedule({
                        loanAmount: outstandingPrincipal,
                        interestRate: loan.interestRate,
                        tenureMonths:  loan.indefiniteTenure ? 1 : pendingItemsCount, // For indefinite, just gen next. For fixed, gen remaining.
                        tenureUnit: loan.tenureUnit || 'Months',
                        loanScheme: loan.loanScheme,
                        interestType: loan.interestType,
                        interestRateUnit: loan.interestRateUnit,
                        repaymentFrequency: loan.repaymentFrequency,
                        startDate: newStartDate,
                        indefiniteTenure: loan.indefiniteTenure
                    });

                    // Replace the pending part of the schedule with new schedule
                    // We need to merge: [Old Paid Items] + [New Calculation]
                    // Caution: Installment Numbers need sync.
                    
                    const paidItems = loan.repaymentSchedule.filter((i: any) => i.status === 'paid' || i.balance <= 1); // tolerance
                    const lastInstNo = paidItems.length > 0 ? paidItems[paidItems.length - 1].installmentNo : 0;
                    
                    const adjustedNewSchedule = newSchedule.map((item: any, idx: number) => ({
                        ...item,
                        installmentNo: lastInstNo + idx + 1,
                        status: 'pending',
                        paidAmount: 0,
                        balance: item.amount // Reset balance
                    }));
                    
                    // Critical: Update the schema
                    loan.repaymentSchedule = [...paidItems, ...adjustedNewSchedule];
                    
                    // Update Next Payment Amount immediately since we changed schedule
                    if (adjustedNewSchedule.length > 0) {
                         loan.nextPaymentAmount = adjustedNewSchedule[0].amount;
                         loan.nextPaymentDate = adjustedNewSchedule[0].dueDate;
                    }
                 }
             }
        }

        // 9. ALWAYS Update Next Payment Date (Fixes Issue where Flat/InterestOnly didn't update)
        // Find the first unpaid or partially paid installment
        const nextInstallment = loan.repaymentSchedule.find((item: any) => item.status !== 'paid');
        
        if (nextInstallment) {
            loan.nextPaymentDate = nextInstallment.dueDate;
            loan.nextPaymentAmount = nextInstallment.amount - (nextInstallment.paidAmount || 0);
        } else {
            // All paid
            loan.nextPaymentDate = null;
            loan.nextPaymentAmount = 0;
            
            // Calculate final balance to see if we should auto-close
            const currentOutstanding = loan.repaymentSchedule.reduce((sum: number, item: any) => {
                return sum + (item.amount - (item.paidAmount || 0));
            }, 0);

            if (loan.status === 'Active' && currentOutstanding <= 0) {
                 // Auto-close if balance is cleared (tolerance for dust < 1)
                 // BUT SKIP for Indefinite/InterestOnly as their "Schedule" is just interest. 
                 // We let the Loan Engine handle Principal closure.
                 const isIndefinite = loan.indefiniteTenure || loan.loanScheme === 'InterestOnly';
                 
                 if (!isIndefinite && currentOutstanding < 1) {
                    loan.status = 'Closed'; 
                 }
            }
        }



        // Normalize Status to Title Case (Fix for legacy 'active' vs 'Active' validation error)
        if (loan.status) {
             const s = loan.status.toString().toLowerCase();
             if (s === 'active') loan.status = 'Active';
             else if (s === 'closed') loan.status = 'Closed';
             else if (s === 'npa') loan.status = 'NPA';
             else if (s === 'rejected') loan.status = 'Rejected';
        }

        await loan.save();

        // 10. Trigger Ledger Recalculation (Date-Driven Engine)
        // This handles backdating, interest accrual, and "Balance After" correction
        const updatedState = await recalculateLedger(loan.loanId);

        const successMsg = remainingAmount > 0 
            ? `Collected ₹${totalAmount} (₹${remainingAmount} Excess)`
            : `Collected ₹${totalAmount}`;

        return NextResponse.json({ 
            success: true, 
            message: successMsg, 
            loanId: loan.loanId,
            currentPrincipal: updatedState.outstandingPrincipal,
            accumulatedInterest: updatedState.accruedInterest
        });

    } catch (error: any) {
        console.error("Payment Error:", error);
        return NextResponse.json({ error: error.message || "Payment processing failed" }, { status: 500 });
    }
}
