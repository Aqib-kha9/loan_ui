import Loan from '@/lib/models/Loan';
import { differenceInDays, addDays, isBefore, isAfter, startOfDay, addMonths, getDate, addWeeks, subDays } from 'date-fns';

/**
 * Core Loan Engine for Lifecycle 2.0 (Periodic Update)
 */

// --- 1. Periodic Rate Conversion ---

import { getPeriodicInterestRate } from './shared-loan-utils';
export { getPeriodicInterestRate }; // Re-export if needed, or just let consumers import from shared.


// --- 2. Ledger Engine (Rollback & Replay) ---

interface LedgerState {
    date: Date;
    outstandingPrincipal: number;
    advanceWalletBalance: number;
    accruedInterest: number; // Interest that has been 'Applied'/Allocated but not paid? 
                             // No, in Periodic logic, we usually "Bill" it immediately if due.
                             // But if partial payment, it sits in 'accrued' or 'due'.
    totalPaidInterest: number;
    totalPaidPrincipal: number;
    status: 'Active' | 'Closed' | 'NPA' | 'Rejected';
    
    // New: Virtual Ledger for Statement
    virtualTransactions: any[]; 
}

export const recalculateLedger = async (loanId: string) => {
    const loan = await Loan.findOne({ loanId }).sort({ 'transactions.date': 1 }); 
    if (!loan) throw new Error("Loan not found");

    const transactions = loan.transactions.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let currentState: LedgerState = {
        date: new Date(loan.disbursementDate),
        outstandingPrincipal: loan.loanAmount,
        advanceWalletBalance: 0,
        accruedInterest: 0,
        totalPaidInterest: 0,
        totalPaidPrincipal: 0,
        status: 'Active',
        virtualTransactions: []
    };
    
    // Disbursement Entry
    currentState.virtualTransactions.push({
        date: currentState.date,
        type: 'Disbursal',
        credit: 0,
        debit: loan.loanAmount,
        balance: loan.loanAmount,
        particulars: 'Loan Disbursed'
    });

    const periodicRate = getPeriodicInterestRate(loan);

    // Timeline Construction
    // Events: 1. Cycle Dates (Interest Application) 2. Payments (Transactions)
    
    // Generate All Cycle Dates from Disbursal to Today
    let cycleDates: Date[] = [];
    let cycleCursor = new Date(loan.disbursementDate);
    const today = new Date();
    
    // Move to first cycle (e.g. 1 month after disbursal)
    // NOTE: Interest is usually "Post-Paid" (Accrues at end of cycle).
    // EXCEPT "Interest Paid in Advance".
    
    if (loan.interestPaidInAdvance) {
         // It's pre-deducted, so first cycle interest is already handled? 
         // Or just the first EMI?
         // Usually implies strict upfront. Logic remains same but they paid it.
    }
    
    // Generate Cycles
    while (isBefore(cycleCursor, today)) {
        if (loan.repaymentFrequency === 'Monthly') cycleCursor = addMonths(cycleCursor, 1);
        else if (loan.repaymentFrequency === 'Weekly') cycleCursor = addWeeks(cycleCursor, 1);
        else cycleCursor = addDays(cycleCursor, 1);
        
        if (isBefore(cycleCursor, today) || isSameDay(cycleCursor, today)) {
            cycleDates.push(new Date(cycleCursor));
        }
    }

    // Merge Events
    const allEvents = [
        ...cycleDates.map(d => ({ date: d, type: 'CYCLE_INTEREST' })),
        ...transactions.map((t: any) => ({ ...t, type: 'TRANSACTION', original: t }))
    ].sort((a: any, b: any) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        if (timeA === timeB) {
            // Priority: Interest First, Then Payment
            if (a.type === 'CYCLE_INTEREST') return -1; 
            return 1;
        }
        return timeA - timeB;
    });

    for (const event of allEvents) {
        // A. Interest Cycle Event
        if (event.type === 'CYCLE_INTEREST') {
            // Calculate Interest on Current Principal
            let principalBasis = currentState.outstandingPrincipal;
            
            // Interest Only handling? Same formula P * R.
            // Reducing? Same formula P * R.
            // Flat? Fixed Amount (P_Original * Limit / N). 
            // BUT here we are Reconciling Active Ledger, assume 'reducing' style logic usually for tracking.
            // If strictly 'Flat', the Interest is fixed per schedule. 
            // User script: "Interest Only / Reducing".
            
            let interestAmount = 0;
            
            if (loan.interestType === 'Flat') {
                 // Fallback for Flat: Use schedule? Or constant?
                 // Let's assume reducing logic for user correctness request "1.25% Monthly" on "Outstanding".
                 interestAmount = principalBasis * periodicRate;
            } else {
                 interestAmount = principalBasis * periodicRate;
            }
            
            interestAmount = Math.round(interestAmount);
            
            if (interestAmount > 0) {
                // CAPITALIZATION (Compounding): Add interest directly to Principal
                // This matches the client's spreadsheet where balance increases by interest amount.
                currentState.outstandingPrincipal += interestAmount;
                
                // Add to Virtual Ledger
                currentState.virtualTransactions.push({
                    date: event.date,
                    type: 'Interest',
                    debit: interestAmount,
                    credit: 0,
                    balance: currentState.outstandingPrincipal, 
                    particulars: `Interest Accrued`
                });
            }
        } 
        // B. Transaction Event
        else if (event.type === 'TRANSACTION') {
             const txn = event.original;
             let amountLeft = txn.amount;
             
             // Waterfall: 
             // 1. Accrued Interest
             let interestPaid = 0;
             if (amountLeft > 0 && currentState.accruedInterest > 0) {
                 const alloc = Math.min(amountLeft, currentState.accruedInterest);
                 currentState.accruedInterest -= alloc;
                 interestPaid += alloc;
                 currentState.totalPaidInterest += alloc;
                 amountLeft -= alloc;
             }
             
             // 2. Principal
             let principalPaid = 0;
             // Interest Only Logic: Excess Payment does NOT reduce Principal automatically.
             // It goes to Advance Wallet (Prepaid Interest).
             // Unless the Transaction Type is explicitly 'Closure' or 'Part Payment'.
             // Or if Scheme is NOT InterestOnly (i.e. EMI).
             
             let allowPrincipalReduction = true;
             if (loan.loanScheme === 'InterestOnly') {
                 // Only allow if Type is specifically 'Part Payment' or 'Closure' match
                 // If Type is 'EMI' or 'General', we DO NOT reduce Principal.
                 if (txn.type === 'EMI' || txn.type === 'Interest') {
                     allowPrincipalReduction = false;
                 }
             }
             
             if (amountLeft > 0 && allowPrincipalReduction) {
                 const alloc = Math.min(amountLeft, currentState.outstandingPrincipal);
                 currentState.outstandingPrincipal -= alloc;
                 principalPaid += alloc;
                 currentState.totalPaidPrincipal += alloc;
                 amountLeft -= alloc;
             }
             
             // 3. Excess -> Wallet
             if (amountLeft > 0) {
                 currentState.advanceWalletBalance += amountLeft;
             }
             
             // Update Real Txn Object in DB Memory (if needed)
             if (txn) {
                 txn.balanceAfter = currentState.outstandingPrincipal;
                 txn.interestComponent = interestPaid;
                 txn.principalComponent = principalPaid;
             }
             
             // Virtual Ledger
             currentState.virtualTransactions.push({
                 date: event.date,
                 type: 'Payment',
                 originalType: txn.type,
                 debit: 0,
                 credit: txn.amount,
                 balance: currentState.outstandingPrincipal + currentState.accruedInterest,
                 particulars: txn.description || `Payment Received`,
                 refNo: txn.reference
             });
        }
    }
    
    // Post-Loop: Update Loan Status
    if (currentState.outstandingPrincipal <= 0 && currentState.accruedInterest <= 0) {
        currentState.status = 'Closed';
    } else {
        currentState.status = 'Active';
    }

    // Save Changes
    loan.accumulatedInterest = currentState.accruedInterest;
    loan.currentPrincipal = currentState.outstandingPrincipal;
    if (loan.status !== 'written_off') loan.status = currentState.status;

    // Update Next Payment Amount for InterestOnly (Compounding)
    // For EMI, it stays at the fixed EMI amount unless we want to dynamically change it (not recommended for now).
    // For InterestOnly, the user owes the interest of the current capitalized balance.
    if (loan.loanScheme === 'InterestOnly') {
        const periodicRate = getPeriodicInterestRate(loan);
        loan.nextPaymentAmount = Math.round(loan.currentPrincipal * periodicRate);
    }
    
    // We do NOT save virtualTransactions to DB permanently in 'transactions' array to avoid clutter?
    // User wants to SEE it. 
    // Option A: Save valid "Interest" transactions to DB? 
    // No, that might duplicate if we re-run.
    // Better: Helper returns them, and Statement Logic merges them? 
    // `recalculateLedger` is usually void/update.
    // Let's attach them to a temporary field or rely on Client to generate them?
    // NO, Engine is solving the math. 
    // Let's UPDATE the loan with a new field `ledgerHistory`?
    
    // For now, save core fields.
    await loan.save();
    
    return currentState; // Return state so API can use it if needed
};

function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getDate() === d2.getDate();
}
