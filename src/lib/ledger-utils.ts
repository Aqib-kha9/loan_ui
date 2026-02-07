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
    amount?: number;
    principalBalance?: number;
    interestBalance?: number;
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

    // 3. Replay
    let runningUnpaidInterest = 0;

    for (const event of allEvents) {
        if (event.eventType === 'CYCLE') {
            if (outstandingPrincipal <= 0) continue;

            const interestAmount = Math.round(Math.max(0, outstandingPrincipal) * periodicRate);
            
            if (interestAmount > 0) {
                 // Regular Accrual
                 // For UI display, we assume simple interest tracking or compounding based on loan type?
                 // But simply: Add to Unpaid Interest. 
                 // We don't necessarily compound outstandingPrincipal unless it's a specific scheme.
                 // But sticking to existing logic:
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
                    principalComponent: 0 
                });
            }
        } else {
            // Transaction
            const txn = event.original || event;
            const amount = txn.amount;
            
            let interestPaid = 0;
            let principalPaid = 0;

            // USE STORED SPLITS IF AVAILABLE (Sync with Backend)
            if (typeof txn.interestComponent === 'number' && typeof txn.principalComponent === 'number') {
                interestPaid = txn.interestComponent;
                principalPaid = txn.principalComponent;
            } else if (txn.type === 'Interest') {
                // Explicit Interest Transaction (e.g. Advance Interest)
                interestPaid = amount;
                principalPaid = 0;
            } else {
                // Fallback Calculation
                interestPaid = Math.min(amount, runningUnpaidInterest);
                principalPaid = amount - interestPaid;
            }
            
            outstandingPrincipal -= (principalPaid + interestPaid); // Wait, logic above added Interest to Principal?
            // If line 105: outstandingPrincipal += interestAmount
            // Then Paying 500 (Interest) removes 500 from Principal.
            // YES. 
            // So: outstandingPrincipal -= amount; is correct IF amount = InterestPaid + PrincipalPaid.
            
            // Wait, if I Block Principal Reduction in backend?
            // Backend: Principal = 50k. Accrued = 500.
            // Txn: Pay 500 interest.
            // Backend State: Principal = 50k. Accrued = 0.
            
            // Frontend Logic Here:
            // Cycle: Principal += 500 -> 50,500.
            // Txn: Pay 500. Principal -= 500 -> 50,000.
            // Result: 50,000. Correct.
            
            // But verify `runningUnpaidInterest` update.
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
