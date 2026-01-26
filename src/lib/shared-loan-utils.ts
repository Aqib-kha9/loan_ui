/**
 * Shared Loan Utilities
 * Pure functions for calculation that can be used on both Client and Server.
 * DO NOT import Mongoose or Node-specific modules here.
 */

export const getPeriodicInterestRate = (loan: any): number => {
    let annualRate = loan.interestRate;
    let ratePerPeriod = 0;
    
    // HEURISTIC (Restored per User Request): Fix Common Data Entry Error
    // Users often enter "1.5" meaning "1.5% Monthly" but leave Unit as "Yearly".
    // If Rate < 5 (Threshold) AND Unit is Yearly AND Freq is Monthly: Assume it's Monthly Rate.
    let isLikelyMonthly = false;
    if (loan.interestRateUnit === 'Yearly' && annualRate <= 5 && loan.repaymentFrequency === 'Monthly') {
        isLikelyMonthly = true;
    }

    let effectiveAnnualRate = annualRate;
    
    // If unit is already Monthly OR we detected it likely is
    if (loan.interestRateUnit === 'Monthly' || isLikelyMonthly) {
        effectiveAnnualRate = annualRate * 12;
    }
    
    // De-Annualize to Frequency
    if (loan.repaymentFrequency === 'Monthly') {
        ratePerPeriod = effectiveAnnualRate / 12;
    } else if (loan.repaymentFrequency === 'Weekly') {
        ratePerPeriod = effectiveAnnualRate / 52;
    } else if (loan.repaymentFrequency === 'Daily') {
        ratePerPeriod = effectiveAnnualRate / 365;
    }
    
    return ratePerPeriod / 100;
};
