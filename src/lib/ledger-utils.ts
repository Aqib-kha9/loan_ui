import { LoanAccount, Transaction, RepaymentScheduleItem } from "./mock-data";
import { parseISO, format } from "date-fns";

export interface LedgerEntry {
    date: string;
    particulars: string;
    type: "Disbursal" | "Interest" | "EMI" | "Penalty" | "Closing";
    debit: number;  // Out (Charges, Disbursal, Interest Due)
    credit: number; // In (Payments)
    balance: number;
    refNo?: string;
    principalComponent?: number;
    interestComponent?: number;
}

export function generateLedger(loan: LoanAccount): LedgerEntry[] {
    let entries: LedgerEntry[] = [];
    
    // 1. Collect Disbursal
    const loanAmount = loan.totalLoanAmount;
    const disbursalDate = loan.disbursedDate ? loan.disbursedDate : new Date().toISOString().split("T")[0];

    entries.push({
        date: disbursalDate,
        particulars: "Loan Amount Disbursed",
        type: "Disbursal",
        debit: loanAmount,
        credit: 0,
        balance: 0, // Placeholder
        refNo: "-"
    });

    // 2. Collect Interest Accruals (From Schedule)
    // If Indefinite Tenure, 'totalInterest' is 0, so 'Flat' logic skips. 
    // We must treat Indefinite as Periodic Accrual even if labeled Flat.
    const isIndefinite = loan.indefiniteTenure || (loan.tenureMonths === 0 && loan.loanScheme === 'InterestOnly');

    if (loan.repaymentSchedule && loan.repaymentSchedule.length > 0) {
        
        // SPECIAL HANDLING FOR FLAT RATE (Fixed Tenure):
        if (loan.interestType === 'Flat' && !isIndefinite) {
             const totalInterest = loan.repaymentSchedule.reduce((sum, item) => sum + (item.interestComponent || 0), 0);
             
             if (totalInterest > 0) {
                 entries.push({
                     date: disbursalDate,
                     particulars: "Total Interest (Deferred)",
                     type: "Interest",
                     debit: totalInterest,
                     credit: 0,
                     balance: 0, 
                     refNo: "-",
                     interestComponent: totalInterest
                 });
             }
        } else {
            // REDUCING BALANCE or INDEFINITE: Show Accruals as they happen
            loan.repaymentSchedule.forEach((item) => {
                const isDue = new Date(item.dueDate) <= new Date();
                const isPaid = item.paidAmount > 0 || item.status === 'paid';

                if ((isDue || isPaid) && item.interestComponent > 0) {
                    const entryDate = (isPaid && item.paidDate && new Date(item.paidDate) < new Date(item.dueDate)) 
                        ? item.paidDate 
                        : item.dueDate;

                    entries.push({
                        date: entryDate, 
                        particulars: `Interest Applied (Inst #${item.installmentNo})`,
                        type: "Interest",
                        debit: item.interestComponent,
                        credit: 0,
                        balance: 0, 
                        refNo: "-",
                        interestComponent: item.interestComponent
                    });
                }
            });
        }
    } else if (isIndefinite) {
        // No Schedule (Indefinite Tenure?) -> We must synth accruals?
        // Actually, Indefinite Loans usually don't have a schedule generated?
        // If NO schedule, we can't show accruals easily here without running the Engine.
        // Assuming Backend might generate 'mock' schedule for indefinite?
        // If not, we skip accruals for now, OR we rely on transactions.
    }

    // 2.5. Handle "Interest Paid In Advance" (Phantom Transaction)
    // If user paid interest upfront, Backend reduced Net Disbursal but didn't log a Transaction.
    // We must log the "Payment" of that interest to balance the books if we are debiting interest.
    // BUT: For Indefinite/InterestOnly, we likely didn't debit the interest yet above if schedule is empty.
    // If Schedule is Empty, we have NO debit. So we shouldn't Credit.
    // BUT user says "Calculations wrong".
    // If Flat/InterestOnly/Indefinite:
    // User expects to see: Principal 50k.
    // If Interest Paid Advance: He paid 417.
    // Maybe we should show:
    // 1. Disbursal 50k.
    // 2. Payment (Advance Int) 417.
    // 3. Balance 49583? (Net Disbursal).
    // The user's goal is usually to track "How much I gave".
    // If I gave 49583, I want to see balance 50k? No, that means I owe 50k.
    // So the Ledger Balance should be 50k.
    // If I show "Disbursal 50k", Balance is 50k.
    // If I show "Payment 417", Balance becomes 49583.
    // This implies I DEBTED 417 somewhere.
    // If I didn't debit 417, showing payment reduces principal, which is WRONG for Interest Payment.
    // So if I show "Payment 417", I MUST show "Interest Debit 417".
    // Since Indefinite Schedule is missing, I must synthesizing the DEBIT and CREDIT.
    
    if (loan.interestPaidInAdvance && loan.emiAmount > 0) {
        // Add "Interest Applied (Advance)"
        entries.push({
            date: disbursalDate,
            particulars: "Interest Charge (Advance)",
            type: "Interest",
            debit: loan.emiAmount,
            credit: 0,
            balance: 0,
            refNo: "-",
            interestComponent: loan.emiAmount
        });

        // Add "Interest Paid (Advance)"
        entries.push({
            date: disbursalDate,
            particulars: "Interest Paid (Advance)",
            type: "EMI", // or "Fee"
            debit: 0,
            credit: loan.emiAmount,
            balance: 0,
            refNo: "ADVANCE",
            interestComponent: loan.emiAmount
        });
    }


    // 3. Collect Transactions (From Real Log)
    if (loan.transactions && loan.transactions.length > 0) {
        loan.transactions.forEach((txn) => {
            entries.push({
                date: (txn.date as any) instanceof Date ? (txn.date as any).toISOString() : txn.date,
                particulars: txn.description || `Payment Received (${txn.type})`,
                type: "EMI",
                debit: 0,
                credit: txn.amount,
                balance: 0, // Placeholder
                refNo: txn.refNo || (txn.txnId ? txn.txnId.split('-')[1] : '-'),
                interestComponent: txn.interestComponent // Pass it through
            });
        });
    }

    // 4. Sort Chronologically
    // Priority: Disbursal -> Interest -> Penalty -> EMI -> Closing
    const typePriority: Record<string, number> = { "Disbursal": 0, "Interest": 1, "Penalty": 2, "EMI": 3, "Closing": 4, "Fee": 5, "Part Payment": 3 };
    
    entries.sort((a, b) => {
        // Normalize to YYYY-MM-DD to ignore time components precisely
        const dateStrA = new Date(a.date).toISOString().split('T')[0];
        const dateStrB = new Date(b.date).toISOString().split('T')[0];
        
        if (dateStrA < dateStrB) return -1;
        if (dateStrA > dateStrB) return 1;
        
        // Dates are exactly equal (Same Day)
        // Use strict Priority
        const priA = typePriority[a.type] ?? 99;
        const priB = typePriority[b.type] ?? 99;
        
        return priA - priB;
    });

    // 5. Calculate Running Balance
    // We calculate purely chronological now (Disbursal First -> Interest -> Payment)
    let runningBalance = 0;
    entries = entries.map(entry => {
        runningBalance = runningBalance + entry.debit - entry.credit;
        return {
            ...entry,
            balance: Number(runningBalance.toFixed(2)) 
        };
    });

    // 6. Return Sorted Descending for UI (Latest First)?
    // User complaint "1333" balance.
    // If we return Descending (Newest First):
    // List: Pay(3) -> Int(2) -> Disb(1).
    // Balances embedded: Pay(51k) -> Int(56k) -> Disb(50k).
    // Visual: 
    // Row 1 (Pay): Bal 51k.
    // Row 2 (Int): Bal 56k.
    // Row 3 (Disb): Bal 50k.
    
    // BUT the user wants to see "Ledger Style" usually Ascending?
    // "Date Particulars Credit Debit Balance"
    // Usually strict date order Top to Bottom.
    // 11/01 Disb 50k Bal 50k
    // 11/01 Int 6k Bal 56k
    // 11/01 Pay 4k Bal 51k
    
    // The user's screenshot had Disbursal at Summary Bottom (visually last row).
    // Top Row: Interest.
    // Logic suggests Descending Sort (Latest at Top?).
    // A standard bank statement is usually Ascending (Old at Top).
    // Let's stick to Ascending (Chronological).
    
    return entries;
}

