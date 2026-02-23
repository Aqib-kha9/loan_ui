import { format, addMonths, addWeeks, addDays, isBefore, isAfter, isSameDay } from "date-fns";
import { getPeriodicInterestRate } from "./shared-loan-utils"; 

export interface LedgerEntry {
    date: string;
    particulars: string;
    type: "Disbursal" | "Interest" | "EMI" | "Penalty" | "Closing" | "Fee" | "Part Payment";
    debit: number;  
    credit: number; 
    balance: number;
    txnId?: string;
    refNo?: string;
    principalComponent?: number;
    interestComponent?: number;
    linkedId?: string;       
    linkedType?: "txn" | "schedule" | "meta"; 
    isPayment?: boolean;
    penalty?: number;
    amount?: number;
    principalBalance?: number;
    interestBalance?: number;
}

export function generateLedger(loan: any): LedgerEntry[] {
    // 1. Setup
    let entries: LedgerEntry[] = [];
    const loanAmount = loan.loanAmount || loan.totalLoanAmount; 
    // State managed in Replay loop
    
    // Disbursal
    const disbursalDate = loan.disbursementDate ? new Date(loan.disbursementDate) : (loan.disbursalDate ? new Date(loan.disbursalDate) : (loan.disbursedDate ? new Date(loan.disbursedDate) : new Date()));
    
    // Parse Dates helper
    const getDateObj = (d: any) => new Date(d);

    entries.push({
        date: disbursalDate.toISOString(),
        particulars: "Loan Amount Disbursed",
        type: "Disbursal",
        debit: loanAmount,
        credit: 0,
        balance: loanAmount,
        refNo: "-",
        linkedType: "meta"
    });

    // 2. Generate Timeline (Cycles & Transactions)
    const periodicRate = getPeriodicInterestRate(loan);
    const transactions = (loan.transactions || []).map((t: any) => ({ ...t, date: new Date(t.date) }));
    
    // Define Cycles
    let cycleDates: Date[] = [];
    let cycleCursor = new Date(disbursalDate);
    const today = new Date();
    
    // Generate Cycles
    // Logic: 
    // Standard (Post-Paid): Interest accrues at END of period. (M1, M2...)
    // Advance (Pre-Paid): Interest accrues at START of period. (M0, M1...)
    
    // Initial Move:
    // If Standard, we start at M1.
    // If Advance, we start at M0 (Disbursal Date).
    
    if (!loan.interestPaidInAdvance) {
        if (loan.repaymentFrequency === 'Monthly') cycleCursor = addMonths(cycleCursor, 1);
        else if (loan.repaymentFrequency === 'Weekly') cycleCursor = addWeeks(cycleCursor, 1);
        else cycleCursor = addDays(cycleCursor, 1);
    }
    // Else: Advance, so cycleCursor starts at DisbursalDate (already set)

    while (isBefore(cycleCursor, today) || isSameDay(cycleCursor, today)) {
        cycleDates.push(new Date(cycleCursor));
        
        if (loan.repaymentFrequency === 'Monthly') cycleCursor = addMonths(cycleCursor, 1);
        else if (loan.repaymentFrequency === 'Weekly') cycleCursor = addWeeks(cycleCursor, 1);
        else cycleCursor = addDays(cycleCursor, 1);
    }

    // Merge for strict chronological replay
    const allEvents = [
        ...cycleDates.map(d => ({ date: d, eventType: 'CYCLE' })),
        ...transactions.map((t: any) => ({ ...t, eventType: 'TXN', original: t }))
    ].sort((a: any, b: any) => {
        const tA = a.date.getTime();
        const tB = b.date.getTime();
        if (tA === tB) {
            if (a.eventType === 'CYCLE') return -1;
            return 1;
        }
        return tA - tB;
    });

    // 3. Replay State Machine
    let runningUnpaidInterest = 0;
    let currentPrincipal = loanAmount;
    let runningTotalBalance = loanAmount;

    for (const event of allEvents) {
        if (event.eventType === 'CYCLE') {
            // Determine if we should still accrue
            // In Fixed Tenure, we stop at tenure end? No, engine usually keeps accruing if balance remains.
            // But if Principal is 0 on Reducing, interest is 0.
            
            let interestAmount = 0;
            if (loan.interestType === 'Flat') {
                interestAmount = Math.round(loanAmount * periodicRate);
            } else {
                interestAmount = Math.round(Math.max(0, currentPrincipal) * periodicRate);
            }
            
            if (interestAmount > 0) {
                runningUnpaidInterest += interestAmount;
                runningTotalBalance += interestAmount;

                entries.push({
                    date: event.date.toISOString(),
                    particulars: "Interest Accrued",
                    type: "Interest",
                    debit: interestAmount,
                    credit: 0,
                    balance: runningTotalBalance, 
                    interestComponent: interestAmount,
                    principalComponent: 0,
                    principalBalance: currentPrincipal,
                    interestBalance: runningUnpaidInterest
                });
            }
        } else {
            // Transaction
            const txn = event.original || event;
            const amount = txn.amount;
            
            let interestPaid = 0;
            let principalPaid = 0;

            if (typeof txn.interestComponent === 'number' && typeof txn.principalComponent === 'number') {
                interestPaid = txn.interestComponent;
                principalPaid = txn.principalComponent;
            } else if (txn.type === 'Interest') {
                interestPaid = amount;
                principalPaid = 0;
            } else {
                // Waterfall Allocation
                interestPaid = Math.min(amount, runningUnpaidInterest);
                principalPaid = amount - interestPaid;
            }
            
            runningUnpaidInterest -= interestPaid;
            currentPrincipal -= principalPaid;
            runningTotalBalance -= amount;
            
            entries.push({
                date: new Date(txn.date).toISOString(),
                particulars: txn.description || `Payment Received`,
                type: "EMI",
                debit: 0,
                credit: amount,
                balance: runningTotalBalance,
                refNo: txn.reference || txn.refNo,
                interestComponent: interestPaid,
                principalComponent: principalPaid,
                principalBalance: currentPrincipal,
                interestBalance: runningUnpaidInterest,
                isPayment: true
            });
        }
    }
    
    // 4. Final Formatting (Remove redundant map if already correct)
    // The balance is already running correctly in the loop above.
    
    // Format Dates (Already handled in loop)
    return entries;
}
