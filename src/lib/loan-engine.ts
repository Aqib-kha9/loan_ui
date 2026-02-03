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
    
    // Logic: 
    // Standard (Post-Paid): Interest accrues at END of period. (M1, M2...)
    // Advance (Pre-Paid): Interest accrues at START of period. (M0, M1...)
    
    if (loan.interestPaidInAdvance) {
        // Accrue immediately on Day 0
        if (isBefore(cycleCursor, today) || isSameDay(cycleCursor, today)) {
             cycleDates.push(new Date(cycleCursor));
        }
    }
    
    // Generate Cycles
    while (true) { // Loop control inside
        // Advance cursor
        if (loan.repaymentFrequency === 'Monthly') cycleCursor = addMonths(cycleCursor, 1);
        else if (loan.repaymentFrequency === 'Weekly') cycleCursor = addWeeks(cycleCursor, 1);
        else cycleCursor = addDays(cycleCursor, 1);
        
        // Break if future
        if (isAfter(cycleCursor, today)) break;
        
        // Add to list
        cycleDates.push(new Date(cycleCursor));
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
                // ACCRUAL: Add interest to Accrued Interest (Not Principal)
                // Defaulting to Simple Interest logic as per user requirement (Principal must stay same).
                // Capitalization (Compounding) is only for specific loan types (not implemented here as default).
                
                currentState.accruedInterest += interestAmount;

                // Auto-deduct from Advance Wallet if available (e.g. Prepaid Interest)
                if (currentState.advanceWalletBalance > 0) {
                    const offset = Math.min(currentState.advanceWalletBalance, currentState.accruedInterest);
                    if (offset > 0) {
                        currentState.advanceWalletBalance -= offset;
                        currentState.accruedInterest -= offset;
                        currentState.totalPaidInterest += offset;
                        
                        // Add to Virtual Ledger
                        currentState.virtualTransactions.push({
                            date: event.date,
                            type: 'Wallet Adjustment',
                            debit: 0,
                            credit: offset,
                            balance: currentState.outstandingPrincipal + currentState.accruedInterest, 
                            particulars: `Paid from Advance Wallet`
                        });
                    }
                }
                
                // Add to Virtual Ledger (Interest Application)
                currentState.virtualTransactions.push({
                    date: event.date,
                    type: 'Interest',
                    debit: interestAmount,
                    credit: 0,
                    // Balance View: Principal + Accrued? Or just Principal? 
                    // Usually Ledger shows Outstanding (P + I).
                    balance: currentState.outstandingPrincipal + currentState.accruedInterest, 
                    particulars: `Interest Accrued`
                });
            }
        } 
        // B. Transaction Event
        else if (event.type === 'TRANSACTION') {
             const txn = event.original;
             let amountLeft = txn.amount;
             
             let interestPaid = 0;
             let principalPaid = 0;

             // CHECK FOR MANUAL SPLIT OVERRIDE
             // If the transaction already has explicit components saved, we respect them.
             // We check if they are defined numbers (not undefined/null).
             // NOTE: We must check 'txn' object from the event.original
             const hasManualSplit = (typeof txn.principalComponent === 'number') && (typeof txn.interestComponent === 'number');

             if (hasManualSplit) {
                 // TRUST LEAF (Manual)
                 interestPaid = txn.interestComponent;
                 principalPaid = txn.principalComponent;
                 
                 // Deduct from Accruals/Principal
                 currentState.accruedInterest -= interestPaid;
                 currentState.outstandingPrincipal -= principalPaid;
                 
                 currentState.totalPaidInterest += interestPaid;
                 currentState.totalPaidPrincipal += principalPaid;
                 
                 // Calc remain for wallet (if any mismatch, though usually exact)
                 amountLeft = txn.amount - (interestPaid + principalPaid);

             } else {
                 // RUN WATERFALL (Auto-Allocation)
                 
                 // 1. Accrued Interest
                 if (amountLeft > 0 && currentState.accruedInterest > 0) {
                     const alloc = Math.min(amountLeft, currentState.accruedInterest);
                     currentState.accruedInterest -= alloc;
                     interestPaid += alloc;
                     currentState.totalPaidInterest += alloc;
                     amountLeft -= alloc;
                 }
                 
                 // 2. Principal
                 let allowPrincipalReduction = true;
                 if (loan.loanScheme === 'InterestOnly') {
                     if (txn.type === 'EMI' || txn.type === 'Interest') {
                         allowPrincipalReduction = false; // Only Part Payment reduces Principal
                     }
                 } else {
                     if (txn.type === 'Interest') {
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
                 
                 // Update Memory Object with Calculated Values (so it persists)
                 if (txn) {
                    txn.interestComponent = interestPaid;
                    txn.principalComponent = principalPaid;
                 }
             }
             
             // 3. Excess -> Wallet
             if (amountLeft > 0) {
                 currentState.advanceWalletBalance += amountLeft;
             }
             
             // Update Balance in Object
             if (txn) {
                 txn.balanceAfter = currentState.outstandingPrincipal;
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
                 refNo: txn.reference,
                 principalComponent: principalPaid,
                 interestComponent: interestPaid
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
