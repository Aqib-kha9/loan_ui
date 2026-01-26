import { generateLedger, LedgerEntry } from "./ledger-utils";

export interface LoanState {
    balance: number;
    status: "Active" | "Closed" | "Overdue" | "Settled" | "Rejected";
    accruedInterest: number;
    nextDueAmount: number;
    nextDueDate: string | null;
    totalPaid: number;
    principalBalance: number;
}

export function calculateLoanState(loan: any): LoanState {
    const history = generateLedger(loan);
    const lastEntry = history.length > 0 ? history[history.length - 1] : null;
    
    const balance = lastEntry ? lastEntry.balance : (loan.totalLoanAmount || loan.loanAmount || 0);
    
    // Total Paid
    const totalPaid = history.reduce((sum, e) => sum + (e.credit || 0), 0);
    
    // Status Logic
    let status = (loan.status || "Active").charAt(0).toUpperCase() + (loan.status || "Active").slice(1);
    if (balance <= 0) status = "Closed";
    
    // Unpaid interest (sum of interest entries - sum of interest components in payments)
    const totalInterestAccrued = history.reduce((sum, e) => sum + (e.type === 'Interest' ? e.debit : 0), 0);
    const totalInterestPaid = history.reduce((sum, e) => sum + (e.interestComponent || 0), 0);
    const accruedInterest = Math.max(0, totalInterestAccrued - totalInterestPaid);
    
    // Principal Balance
    const principalBalance = Math.max(0, balance - accruedInterest);

    // Next Due Date & Amount
    // Find first interest cycle in future, or first pending installment if schedule exists
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextDueEntry = history.find(e => {
        if (e.type !== 'Interest') return false;
        const d = new Date(e.date);
        d.setHours(0, 0, 0, 0);
        return d >= today;
    });

    const nextDueDate = nextDueEntry ? nextDueEntry.date : null;
    
    // Next amount: If interest only, it's the interest. If EMI, it's the EMI.
    let nextDueAmount = loan.calculatedEMI || loan.emiAmount || 0;
    if (loan.loanScheme === 'InterestOnly') {
        nextDueAmount = nextDueEntry ? nextDueEntry.debit : (loan.calculatedEMI || 0);
    }
    
    // Overdue Check
    const pastUnpaidInterest = history.find(e => {
        if (e.type !== 'Interest') return false;
        const d = new Date(e.date);
        d.setHours(0,0,0,0);
        
        // If it's in the past...
        if (d < today) {
            // Find if there's a payment AFTER this interest but BEFORE the next cycle
            // Or simpler: is accruedInterest > 0?
            return true;
        }
        return false;
    });

    if (accruedInterest > 0 && status === "Active") {
        // Find if last interest date is past today
        const lastInt = history.slice().reverse().find(e => e.type === 'Interest');
        if (lastInt) {
            const d = new Date(lastInt.date);
            d.setHours(0,0,0,0);
            if (d < today) status = "Overdue";
        }
    }

    return {
        balance,
        status: status as any,
        accruedInterest,
        nextDueAmount,
        nextDueDate,
        totalPaid,
        principalBalance
    };
}
