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

        // 1. Auth Check - Strict Revert Permission
        const hasAccess = await checkAccess(req, PERMISSIONS.REVERT_PAYMENT);
        if (!hasAccess) {
            return NextResponse.json({ error: "Unauthorized: Missing 'revert_payment' permission" }, { status: 403 });
        }

        const body = await req.json();
        const { loanNumber, txnId } = body;

        if (!loanNumber || !txnId) {
            return NextResponse.json({ error: "Missing required parameters: loanNumber, txnId" }, { status: 400 });
        }

        // 2. Fetch Loan
        const loan = await Loan.findOne({ loanId: loanNumber });
        if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        
        // Prevent reverting if the loan is fully closed, unless that's a business requirement
        // (If closed, reverting a payment should reopen the loan)

        // 3. Find Transaction
        const txnIndex = loan.transactions.findIndex((t: any) => t.txnId === txnId);
        if (txnIndex === -1) {
            return NextResponse.json({ error: "Transaction not found on this loan." }, { status: 404 });
        }

        const txn = loan.transactions[txnIndex];
        
        // Safety Check: Ideally only allow reverting the MOST RECENT payment to avoid extreme sequence chaos.
        // OR warn them. For now, we allow reverting any Payment, and the recalculation engine will handle the chronological mess up.
        if (txn.type !== 'EMI' && txn.type !== 'Part Payment') {
            return NextResponse.json({ error: "Only payment transactions can be reverted." }, { status: 400 });
        }

        const amountToRevert = txn.amount;
        let amountLeftToRevert = amountToRevert;

        // 4. Reverse Waterfall Allocation
        // Look at the repayment schedule in reverse order.
        // If an item has `paidAmount > 0`, we deduct from it until we've reverted the full amount.
        const schedule = loan.repaymentSchedule;
        
        // Sort explicitly by installmentNo descending to start from the most recently paid
        let sortedSchedule = [...schedule].sort((a: any, b: any) => b.installmentNo - a.installmentNo);

        for (let i = 0; i < sortedSchedule.length; i++) {
            const item = sortedSchedule[i];

            if (amountLeftToRevert <= 0) break;
            if (!item.paidAmount || item.paidAmount <= 0) continue;

            const reduction = Math.min(amountLeftToRevert, item.paidAmount);
            item.paidAmount -= reduction;
            item.balance = item.amount - item.paidAmount;
            
            // Adjust status
            if (item.paidAmount === 0) {
                item.status = 'pending';
                item.paidDate = null;
            } else if (item.paidAmount < item.amount) {
                item.status = 'partially_paid';
            }
            
            amountLeftToRevert -= reduction;
        }

        // If amountLeftToRevert > 0, it means the payment was pushed into the Advance Wallet.
        // The recalculateLedger function will automatically rebuild the wallet state from scratch,
        // so we don't need to manually deduct from advanceWalletBalance here.

        // 5. Remove the transaction
        loan.transactions.splice(txnIndex, 1);

        // 6. Fix Next Payment Tracking (Find first unpaid item starting from the top)
        const forwardSchedule = [...schedule].sort((a: any, b: any) => a.installmentNo - b.installmentNo);
        const nextUnpaid = forwardSchedule.find((item: any) => item.status !== 'paid');
        
        if (nextUnpaid) {
            loan.nextPaymentDate = nextUnpaid.dueDate;
            loan.nextPaymentAmount = nextUnpaid.amount - (nextUnpaid.paidAmount || 0);
            if (loan.status === 'Closed') {
                loan.status = 'Active'; // Reopen loan if we reverted the final payment
            }
        }

        // Re-assign the properly ordered schedule back to the loan
        loan.repaymentSchedule = forwardSchedule;

        await loan.save();

        // 7. Trigger Ledger Engine to recalculate Accruals and Wallet Balances based on the new timeline
        const updatedState = await recalculateLedger(loan.loanId);

        return NextResponse.json({ 
            success: true, 
            message: `Successfully reverted transaction ${txnId}. Accruals and balances recalculated.`,
            loanId: loan.loanId,
            currentPrincipal: updatedState.outstandingPrincipal,
            accumulatedInterest: updatedState.accruedInterest,
            newStatus: updatedState.status
        });

    } catch (error: any) {
        console.error("Revert Error:", error);
        return NextResponse.json({ error: error.message || "Failed to revert transaction." }, { status: 500 });
    }
}
