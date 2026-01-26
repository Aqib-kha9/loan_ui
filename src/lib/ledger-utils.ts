import { format, addMonths, addWeeks, addDays, isBefore, isAfter, isSameDay } from "date-fns";
import { getPeriodicInterestRate } from "./shared-loan-utils"; 

export interface LedgerEntry {
    date: string;
    particulars: string;
    type: "Disbursal" | "Interest" | "EMI" | "Penalty" | "Closing" | "Fee" | "Part Payment";
    debit: number;  
    credit: number; 
    balance: number;
    refNo?: string;
    principalComponent?: number;
    interestComponent?: number;
    linkedId?: string;       
    linkedType?: "txn" | "schedule" | "meta"; 
    isPayment?: boolean;
    penalty?: number;
}

export function generateLedger(loan: any): LedgerEntry[] {
    // 1. Setup
    let entries: LedgerEntry[] = [];
    const loanAmount = loan.loanAmount || loan.totalLoanAmount; // Handle mapper var
    let outstandingPrincipal = loanAmount;
    let accruedInterest = 0;
    
    // Disbursal
    const disbursalDate = loan.disbursalDate ? new Date(loan.disbursalDate) : (loan.disbursedDate ? new Date(loan.disbursedDate) : new Date());
    
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
    
    // Move to first cycle
    if (loan.repaymentFrequency === 'Monthly') cycleCursor = addMonths(cycleCursor, 1);
    else if (loan.repaymentFrequency === 'Weekly') cycleCursor = addWeeks(cycleCursor, 1);
    else cycleCursor = addDays(cycleCursor, 1); // Daily

    // If Int Paid in Advance, the first period is already covered.
    // So the first ACCRUAL should happen at the END of the SECOND period?
    // Or just skip the first scheduled cycle.
    if (loan.interestPaidInAdvance) {
        if (loan.repaymentFrequency === 'Monthly') cycleCursor = addMonths(cycleCursor, 1);
        else if (loan.repaymentFrequency === 'Weekly') cycleCursor = addWeeks(cycleCursor, 1);
        else cycleCursor = addDays(cycleCursor, 1);
    }

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
            // Priority: Interest Cycle applies BEFORE a Payment on the same day?
            // Usually Payment covers 'Due'. Due happens start of day or end of day?
            // If Interest Accrues Today, and I pay Today. 
            // If I pay, I expect to pay off Today's interest. So Interest must exist first.
            if (a.eventType === 'CYCLE') return -1;
            return 1;
        }
        return tA - tB;
    });

    // 3. Replay
    let runningUnpaidInterest = 0;

    for (const event of allEvents) {
        if (event.eventType === 'CYCLE') {
            if (outstandingPrincipal <= 0) continue;

            // Interest only on positive debt
            const interestAmount = Math.round(Math.max(0, outstandingPrincipal) * periodicRate);
            
            if (interestAmount > 0) {
                // COMPOUNDING: Interest is added to Principal
                outstandingPrincipal += interestAmount;
                runningUnpaidInterest += interestAmount;

                entries.push({
                    date: event.date.toISOString(),
                    particulars: "Interest Accrued",
                    type: "Interest",
                    debit: interestAmount,
                    credit: 0,
                    balance: outstandingPrincipal, 
                    interestComponent: interestAmount,
                    principalComponent: -interestAmount // Matches negative principal paid logic when payment is 0
                });
            }
        } else {
            // Transaction
            const txn = event.original || event;
            const amount = txn.amount;
            
            // Allocate payment: First retire accrued interest, then principal
            const interestPaid = Math.min(amount, runningUnpaidInterest);
            const principalPaid = amount - interestPaid;
            
            outstandingPrincipal -= amount;
            runningUnpaidInterest -= interestPaid;
            
            entries.push({
                date: new Date(txn.date).toISOString(),
                particulars: txn.description || `Payment Received`,
                type: "EMI",
                debit: 0,
                credit: amount,
                balance: outstandingPrincipal,
                refNo: txn.reference || txn.refNo,
                interestComponent: interestPaid,
                principalComponent: principalPaid,
                isPayment: true
            });
        }
    }
    
    // 4. Running Balance Calc
    let runningBal = 0;
    
    // Sort Again just to be safe if Replay order was internal
    // (Already sorted events, so push order is chronologic)
    
    // But we need to calculate 'Balance' field for each row.
    // Definition of 'Balance' column in Statement:
    // Is it 'Outstanding Principal'? Or 'Total Due'?
    // Usually 'Total Due' (Princ + Accrued Int).
    
    // Re-calc running trace
    let trackPrinc = loanAmount;
    let trackInt = 0;
    
    // Wait, entries has 'Disbursal' at top.
    // Disbursal: Debit 50k. Bal 50k.
    // Int: Debit 500. Bal 50.5k.
    // Pay: Credit 500. Bal 50k.
    
    entries = entries.map(e => {
        if (e.type === 'Disbursal') {
            runningBal = e.debit;
        } else {
            runningBal = runningBal + e.debit - e.credit;
        }
        return { ...e, balance: runningBal };
    });
    
    // Format Dates
    entries = entries.map(e => ({
        ...e,
        date: e.date // Keep ISO string for UI helpers
    }));

    return entries;
}
