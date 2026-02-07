import { 
    addMonths, 
    addWeeks, 
    addDays, 
    isBefore, 
    isSameDay, 
    differenceInDays 
} from 'date-fns';
import { 
    calculatePeriodicRate, 
    InterestRateUnit, 
    RepaymentFrequency 
} from './interest-calculator';

export interface StatementParams {
    loanAmount: number;
    interestRate: number;
    interestRateUnit: InterestRateUnit;
    repaymentFrequency: RepaymentFrequency;
    disbursalDate: Date;
    interestPaidInAdvance: boolean;
    transactions: Transaction[];
    loanScheme: 'EMI' | 'InterestOnly' | string;
}

export interface Transaction {
    id?: string;
    date: Date;
    amount: number;
    type: string; // 'EMI', 'Interest', 'Discount', 'Penalty'
    description?: string;
    reference?: string;
    // Pre-calculated splits if available from DB
    principalComponent?: number;
    interestComponent?: number;
}

export interface LedgerEntry {
    date: Date;
    particulars: string;
    type: "Disbursal" | "Interest" | "EMI" | "Penalty" | "Cycle";
    debit: number;
    credit: number;
    balance: number;
    principalBalance: number; // New Field
    interestBalance: number;  // New Field
    interestComponent?: number;
    principalComponent?: number;
    refNo?: string;
    isPayment?: boolean;
}

/**
 * Generates a chronological ledger of the loan.
 * Includes "Cycle" events where interest accrues.
 */
export function generateStatement(params: StatementParams): LedgerEntry[] {
    const {
        loanAmount,
        interestRate,
        interestRateUnit,
        repaymentFrequency,
        disbursalDate,
        interestPaidInAdvance,
        transactions,
        loanScheme
    } = params;

    let entries: LedgerEntry[] = [];
    let outstandingPrincipal = loanAmount;
    let unpaidInterest = 0; // Track interest bucket separately

    // 1. Initial Disbursal Entry (Always Gross 100k)
    entries.push({
        date: disbursalDate,
        particulars: "Loan Amount Disbursed",
        type: "Disbursal",
        debit: loanAmount,
        credit: 0,
        balance: loanAmount,
        principalBalance: loanAmount,
        interestBalance: 0,
        refNo: "-"
    });

    // 2. Identify Periodic Rate
    const periodicRate = calculatePeriodicRate(interestRate, interestRateUnit, repaymentFrequency);

    // 3. Generate Cycles (Interest Accrual Dates)
    const allEvents: { date: Date; type: 'CYCLE' | 'TXN'; data?: Transaction }[] = [];

    // --- Generate Cycles ---
    let cycleCursor = new Date(disbursalDate);
    const today = new Date(); 

    // Logic: 
    // Post-Paid: Interest starts accruing from Cursor + 1 Period.
    // Pre-Paid (Advance): Interest "technically" due at Start. 
    // BUT user wants Balance to drop to 90k (100k - 10k Payment).
    // If we accrue Interest at Start (Dr 10k), Balance goes 100k -> 110k.
    // Then Payment (Cr 10k), Balance -> 100k.
    // User wants Balance -> 90k.
    // This implies we SKIP the initial Interest Debit.
    // effectively treating the first period as "Interest Free" or "Already Settled"?
    // OR we just shift the schedule.
    
    // We will SKIP the cycle on Disbursal Date for Advance Interest.
    if(!interestPaidInAdvance) {
        cycleCursor = incrementDate(cycleCursor, repaymentFrequency);
    }

    // Generate up to Today
    while (isBefore(cycleCursor, today) || isSameDay(cycleCursor, today)) {
        allEvents.push({ date: new Date(cycleCursor), type: 'CYCLE' });
        cycleCursor = incrementDate(cycleCursor, repaymentFrequency);
    }

    // --- Add Transactions ---
    transactions.forEach(txn => {
        allEvents.push({ date: new Date(txn.date), type: 'TXN', data: txn });
    });

    // 4. Sort Chronologically
    allEvents.sort((a, b) => {
        const tA = a.date.getTime();
        const tB = b.date.getTime();
        if (tA === tB) {
            if (a.type === 'CYCLE') return -1;
            return 1;
        }
        return tA - tB;
    });

    // 5. Replay Events
    for (const event of allEvents) {
        if (event.type === 'CYCLE') {
            // -- Interest Cycle --
            if (outstandingPrincipal <= 0) continue; 

            let interestAmount = Math.round(outstandingPrincipal * periodicRate);
            
            if (interestAmount > 0) {
                // Determine Particulars
                const isAdvance = interestPaidInAdvance && isSameDay(event.date, disbursalDate);
                const desc = isAdvance ? "Interest Debited (Advance)" : "Interest Accrued";

                unpaidInterest += interestAmount;
                
                entries.push({
                    date: event.date,
                    particulars: desc,
                    type: "Interest",
                    debit: interestAmount,
                    credit: 0,
                    balance: outstandingPrincipal + unpaidInterest, 
                    principalBalance: outstandingPrincipal,
                    interestBalance: unpaidInterest,
                    interestComponent: interestAmount,
                    principalComponent: 0
                });
            }

        } else if (event.type === 'TXN' && event.data) {
            // -- Transaction --
            const txn = event.data;
            let amount = txn.amount;
            
            let intPaid = 0;
            let prinPaid = 0;

            if (txn.interestComponent !== undefined && txn.principalComponent !== undefined) {
                intPaid = txn.interestComponent;
                prinPaid = txn.principalComponent;
            } else {
                intPaid = Math.min(amount, Math.max(0, unpaidInterest));
                prinPaid = amount - intPaid;
            }

            // Update State
            unpaidInterest -= intPaid;
            outstandingPrincipal -= prinPaid; 

            entries.push({
                date: event.date,
                particulars: txn.description || `Payment Received (${txn.type})`,
                type: "EMI",
                debit: 0,
                credit: amount,
                balance: outstandingPrincipal + unpaidInterest,
                principalBalance: outstandingPrincipal,
                interestBalance: unpaidInterest,
                refNo: txn.reference || '-',
                interestComponent: intPaid,
                principalComponent: prinPaid,
                isPayment: true
            });
        }
    }

    return entries;
}

function incrementDate(date: Date, freq: RepaymentFrequency): Date {
    switch (freq) {
        case 'Monthly': return addMonths(date, 1);
        case 'Weekly': return addWeeks(date, 1);
        case 'Daily': return addDays(date, 1);
        default: return addMonths(date, 1);
    }
}
