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
    
    // New: Last Date Interest was Accrued (for Pro-Rata)
    lastInterestAccrualDate?: Date;
}

export const recalculateLedger = async (loanId: string, toDate?: Date, persist: boolean = true) => {
    const loan = await Loan.findOne({ loanId }).sort({ 'transactions.date': 1 }); 
    if (!loan) throw new Error("Loan not found");

    const transactions = (loan.transactions || [])
        .map((t: any) => t.toObject ? t.toObject() : t)
        .map((t: any) => ({ ...t, date: new Date(t.date) }))
        .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

    let currentState: LedgerState = {
        date: new Date(loan.disbursementDate),
        outstandingPrincipal: loan.loanAmount,
        advanceWalletBalance: 0,
        accruedInterest: 0,
        totalPaidInterest: 0,
        totalPaidPrincipal: 0,
        status: 'Active',
        virtualTransactions: [],
        lastInterestAccrualDate: new Date(loan.disbursementDate) // Default anchor
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
    
    // Generate All Cycle Dates from Disbursal to toDate (or Today)
    let cycleDates: Date[] = [];
    let cycleCursor = new Date(loan.disbursementDate);
    const targetDate = toDate ? new Date(toDate) : new Date();
    
    // Logic: 
    // Standard (Post-Paid): Interest accrues at END of period. (M1, M2...)
    // Advance (Pre-Paid): Interest accrues at START of period. (M0, M1...)
    
    if (loan.interestPaidInAdvance) {
        // Accrue immediately on Day 0
        if (isBefore(cycleCursor, targetDate) || isSameDay(cycleCursor, targetDate)) {
             cycleDates.push(new Date(cycleCursor));
        }
    }
    
    // Generate Cycles
    while (true) { // Loop control inside
        // Advance cursor
        if (loan.repaymentFrequency === 'Monthly') cycleCursor = addMonths(cycleCursor, 1);
        else if (loan.repaymentFrequency === 'Weekly') cycleCursor = addWeeks(cycleCursor, 1);
        else cycleCursor = addDays(cycleCursor, 1);
        
        // Break if future (beyond targetDate)
        if (isAfter(cycleCursor, targetDate)) break;
        
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
        // Ignore transactions after targetDate
        if (isAfter(new Date(event.date), targetDate)) continue;

        // A. Interest Cycle Event
        if (event.type === 'CYCLE_INTEREST') {
            // Update Last Accrual Date
            currentState.lastInterestAccrualDate = new Date(event.date);

            // Calculate Interest
            let interestAmount = 0;
            
            if (loan.interestType === 'Flat') {
                 // Flat Rate: Interest on Original Principal
                 // Configuration: "1% Monthly Flat" -> 50000 * 1% = 500 always.
                 interestAmount = loan.loanAmount * periodicRate;
            } else {
                 // Reducing Balance: Interest on Outstanding Principal
                 // Configuration: "1% Monthly Reducing" -> Outstanding * 1%
                 interestAmount = currentState.outstandingPrincipal * periodicRate;
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
                            particulars: `Paid from Advance Wallet`,
                            // NEW FIELDS
                            principalComponent: 0,
                            interestComponent: offset,
                            principalBalance: currentState.outstandingPrincipal,
                            interestBalance: currentState.accruedInterest,
                            isPayment: true // It is a payment (Internal Transfer)
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
                    particulars: `Interest Accrued`,
                    // NEW FIELDS for UI Transparency
                    principalComponent: 0,
                    interestComponent: interestAmount,
                    principalBalance: currentState.outstandingPrincipal,
                    interestBalance: currentState.accruedInterest,
                    isPayment: false
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

                 // 0. Advance Interest Settlement
                 // If we have negative accrued interest (Advance), and we still have outstanding principal,
                 // we "settle" them against each other to bring balances closer to zero.
                 if (currentState.accruedInterest < 0 && currentState.outstandingPrincipal > 0) {
                     const settlementSize = Math.min(Math.abs(currentState.accruedInterest), currentState.outstandingPrincipal);
                     
                     // Move credit from Interest to Principal
                     currentState.outstandingPrincipal -= settlementSize;
                     currentState.accruedInterest += settlementSize;
                     
                     // Reflect in this transaction's components
                     // This ensures that: Cash Paid = Principal Paid + Interest Paid
                     // (e.g. 79,200 Cash = 89,500 Principal + -10,300 Interest)
                     principalPaid += settlementSize;
                     interestPaid -= settlementSize;
                 }
                 
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
                     if (txn.type === 'Interest') {
                         allowPrincipalReduction = false; 
                     }
                     // Allow 'EMI' type to reduce principal if interest is covered (effectively a Part Payment)
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
                 date: txn.date,
                 type: txn.type,
                 debit: 0,
                 credit: txn.amount,
                 balance: currentState.outstandingPrincipal + currentState.accruedInterest,
                 particulars: txn.description || `Payment Received`,
                 refNo: txn.reference,
                 txnId: txn.txnId,
                 // NEW FIELDS for UI Transparency
                 principalComponent: principalPaid,
                 interestComponent: interestPaid,
                 principalBalance: currentState.outstandingPrincipal,
                 interestBalance: currentState.accruedInterest,
                 isPayment: true
             });
        }
    }
    
    // Post-Loop: Update Loan Status
    if (currentState.outstandingPrincipal <= 0 && currentState.accruedInterest <= 0) {
        currentState.status = 'Closed';
    } else {
        currentState.status = 'Active';
    }

    // Save Changes (only if persist is true)
    if (persist) {
        loan.accumulatedInterest = currentState.accruedInterest;
        loan.currentPrincipal = currentState.outstandingPrincipal;
        if (loan.status !== 'written_off') loan.status = currentState.status;

        // Update Next Payment Amount for InterestOnly (Compounding)
        if (loan.loanScheme === 'InterestOnly') {
            const periodicRate = getPeriodicInterestRate(loan);
            loan.nextPaymentAmount = Math.round(loan.currentPrincipal * periodicRate);
        }
        
        await loan.save();
    }
    
    return currentState; // Return state so API can use it if needed
};

function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getDate() === d2.getDate();
}
