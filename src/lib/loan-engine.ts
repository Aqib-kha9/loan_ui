import Loan from '@/lib/models/Loan';
import { differenceInDays, addDays, isBefore, isAfter, startOfDay, addMonths, getDate } from 'date-fns';

/**
 * Core Loan Engine for Lifecycle 2.0
 * Handles purely date-driven calculations.
 */

// --- 1. Daily Rate Conversion ---

export const getDailyInterestRate = (annualRate: number, yearDays: number = 365): number => {
    // Standard conversion: Annual % / 365 / 100
    // e.g., 12% -> 0.12 / 365 = 0.000328...
    return (annualRate / 100) / yearDays;
};

export const calculateDailyInterest = (principal: number, dailyRate: number): number => {
    return principal * dailyRate;
};

// --- 2. Ledger Engine (Rollback & Replay) ---

interface LedgerState {
    date: Date;
    outstandingPrincipal: number;
    advanceWalletBalance: number;
    accruedInterest: number;
    totalPaidInterest: number;
    totalPaidPrincipal: number;
    status: 'active' | 'closed' | 'defaulted';
}

export const recalculateLedger = async (loanId: string) => {
    // 1. Fetch Loan & All Transactions
    const loan = await Loan.findOne({ loanId }).sort({ 'transactions.date': 1 }); // Ensure txn sort from DB if possible, but we resort below
    if (!loan) throw new Error("Loan not found");

    // Sort transactions by date (Critical for replay)
    const transactions = loan.transactions.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 2. Initial State (At Disbursement)
    let currentState: LedgerState = {
        date: new Date(loan.disbursementDate),
        outstandingPrincipal: loan.loanAmount,
        advanceWalletBalance: 0,
        accruedInterest: 0,
        totalPaidInterest: 0,
        totalPaidPrincipal: 0,
        status: 'active'
    };
    
    // Sort Schedule for checking overdue
    const schedule = loan.repaymentSchedule.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    // Determine Daily Rate
    let dailyRate = loan.dailyInterestRate;
    if (!dailyRate) {
        let annualRate = loan.interestRate;
        if (loan.interestRateUnit === 'Monthly') annualRate = annualRate * 12;
        dailyRate = getDailyInterestRate(annualRate);
    }
    
    // Capitalization Config
    // For "Reducing" loans in this context, we apply Monthly Capitalization of Unpaid Interest.
    const enableCapitalization = loan.interestType === 'Reducing';
    const disburseDay = getDate(new Date(loan.disbursementDate)); // e.g., 15th

    // 3. Replay Loop
    // Process timeline from Disbursement -> Transactions -> Today
    
    // We treat "Today" as a phantom final transaction to ensure accrual up to now
    const timelineEvents = [...transactions.map((t: any) => ({...t, isTxn: true})), { date: new Date(), isTxn: false }];

    let lastDate = new Date(currentState.date);

    for (const event of timelineEvents) {
        let eventDate = new Date(event.date);
        
        // Ensure strictly chronological (handle messy timestamps)
        if (isBefore(eventDate, lastDate)) eventDate = lastDate;

        // --- Step logic with Capitalization Boundaries ---
        // We cannot just jump from lastDate to eventDate. We must stop at each Monthly Anniversary.
        
        while (differenceInDays(eventDate, lastDate) > 0) {
            // Determine next potential Capitalization Date
            // It should be the next "Day X of Month" after lastDate
            // e.g. Last = 15 Jan. Next Cap = 15 Feb.
            // If Last = 10 Jan (Disburse = 15th). Next Cap = 15 Jan.
            
            let nextCapDate = new Date(lastDate);
            nextCapDate.setMonth(nextCapDate.getMonth() + 1);
            
            // Adjust to Disbursal Day (e.g., maintain 15th)
            // Handle edge cases like 31st Feb? date-fns addMonths handles this gracefully usually.
            // But we want strictly "Cycle Date". 
            // Better Logic: iterate day by day? Too slow.
            // Current Month Cycle:
            // We want the smallest date > lastDate that matches disbursement Day.
            
            const currentMonth = lastDate.getMonth();
            const currentYear = lastDate.getFullYear();
            
            // Candidates: 
            // 1. Disbursement Day of Current Month (if > lastDate)
            // 2. Disbursement Day of Next Month
            
            let candidate1 = new Date(currentYear, currentMonth, disburseDay);
            let candidate2 = new Date(currentYear, currentMonth + 1, disburseDay);
            
            let targetParams = candidate1;
            if (!isAfter(candidate1, lastDate)) {
                targetParams = candidate2;
            }
            
            // If the next Capitalization Date is AFTER the event, we just proceed to event.
            // Else, we proceed to Capitalization Date, Capitalize, then Loop continues.
            
            let stopDate = eventDate;
            let isCapEvent = false;

            if (enableCapitalization && isBefore(targetParams, eventDate)) {
                 stopDate = targetParams;
                 isCapEvent = true;
            }
            
            // A. Accrue Interest (lastDate -> stopDate)
            const days = differenceInDays(stopDate, lastDate);
            if (days > 0) {
                 let principalForInterest = currentState.outstandingPrincipal;
                 if (loan.interestType === 'Flat') {
                     // Flat Rate: Interest always on Original Principal
                     principalForInterest = loan.loanAmount; 
                 }

                 if (principalForInterest > 0) {
                     const interestForPeriod = calculateDailyInterest(principalForInterest, dailyRate) * days;
                     currentState.accruedInterest += interestForPeriod;
                 }
            }
            
            // Update Time
            lastDate = stopDate;

            // B. Apply Capitalization (if applicable)
            if (isCapEvent) {
                // Add Accrued Interest to Principal
                // "Unpaid interest is added to the Principal"
                // Only if there is accrued interest? Yes.
                if (currentState.accruedInterest > 0) {
                    currentState.outstandingPrincipal += currentState.accruedInterest;
                    // Reset Accrued or Keep it?
                    // If we added it to Principal, we essentially "paid" it via debt expansion.
                    // So we should reset 'accruedInterest' bucket to 0, 
                    // because future calculations on this amount are now covered by the larger principal.
                    currentState.accruedInterest = 0;
                }
            }
        }

        if (event.isTxn) {
             // C. Check for Penalties (Dynamic Overdue)
             // ... existing penalty logic ...
             // Simplified: Penalty applies if we cross DueDate. 
             // (Keeping existing simplified penalty logic placeholder for brevity or reusing previous valid block)
             // D. Apply Transaction (Waterfall)
             let amountLeft = event.amount;
             
             // 1. (Penalty Removed)
             
             // 2. Interest
             
             // 2. Interest
             // Even if capitalized, we might have fresh accrual (partial month) OR pre-capitalized interest?
             // Since we clear `accruedInterest` on capitalization, this handles "Interest since last cap".
             if (amountLeft > 0 && currentState.accruedInterest > 0) {
                const interestAllocated = Math.min(amountLeft, currentState.accruedInterest);
                currentState.accruedInterest -= interestAllocated;
                currentState.totalPaidInterest += interestAllocated;
                amountLeft -= interestAllocated;
             }
             
             // 3. Principal (Reducing)
             if (amountLeft > 0) {
                const principalAllocated = Math.min(amountLeft, currentState.outstandingPrincipal);
                currentState.outstandingPrincipal -= principalAllocated;
                currentState.totalPaidPrincipal += principalAllocated;
                amountLeft -= principalAllocated;
             }
             
             // 4. Excess
             if (amountLeft > 0) {
                currentState.advanceWalletBalance += amountLeft;
             }
             
             // Update Txn Record (Mongoose Doc)
             // We access the original txn object via `event` reference if possible, but `event` is a copy/derived.
             // We need to update the ACTUAL transaction in `loan.transactions`.
             // Matching by ID is safest.
             const realTxn = loan.transactions.find((t: any) => t._id?.toString() === event._id?.toString() || t.txnId === event.txnId);
             if (realTxn) {
                 realTxn.balanceAfter = Math.round(currentState.outstandingPrincipal);
             }
             
             // Auto-Close
             if (currentState.outstandingPrincipal < 1) {
                 currentState.status = 'closed';
             } else {
                 currentState.status = 'active';
             }
        }
    }
    
    // 5. Update Loan Object
    loan.accumulatedInterest = currentState.accruedInterest;
    loan.lastAccrualDate = new Date(); // As of now
    loan.currentPrincipal = currentState.outstandingPrincipal;
    if (loan.status !== 'written_off') {
         loan.status = currentState.status; 
    }
    
    await loan.save();

    return {
        outstandingPrincipal: currentState.outstandingPrincipal,
        accruedInterest: currentState.accruedInterest
    };
};
