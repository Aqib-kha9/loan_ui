import { differenceInDays } from 'date-fns';

/**
 * Pure functions for Interest Calculations
 */

export type InterestRateUnit = 'Monthly' | 'Yearly';
export type InterestType = 'Flat' | 'Reducing';
export type RepaymentFrequency = 'Monthly' | 'Weekly' | 'Daily';

/**
 * Normalizes any interest rate to a "Per Installment" periodic rate.
 * Example: 10% Monthly -> 0.10 (if Monthly Freq)
 * Example: 12% Yearly -> 0.01 (if Monthly Freq)
 */
export function calculatePeriodicRate(
    rateValue: number,
    rateUnit: InterestRateUnit,
    frequency: RepaymentFrequency
): number {
    // 1. Convert everything to Yearly Rate first
    let yearlyRate = rateValue;
    if (rateUnit === 'Monthly') {
        yearlyRate = rateValue * 12;
    }

    // 2. Convert Yearly Rate to Frequency Rate
    let divisor = 12; // Default Monthly
    if (frequency === 'Weekly') divisor = 52;
    if (frequency === 'Daily') divisor = 365;

    // Rate is percentage, so divide by 100
    return (yearlyRate / divisor) / 100;
}

/**
 * Calculates a standard EMI for a Fixed Tenure loan.
 */
export function calculateEMI(
    principal: number,
    periodicRate: number, // 0.01 for 1%
    totalInstallments: number,
    type: InterestType
): number {
    // 1. Flat Rate EMI: (P + TotalInterest) / N
    if (type === 'Flat') {
        // Flat Interest is usually calculated on Yearly Basis
        // Formula: P * R_Yearly * T_Years
        // Since we have periodicRate which is (R_Yearly/Divisor)/100
        // Total Interest = P * (periodicRate * Divisor) * (N / Divisor) = P * periodicRate * N?
        // Let's check:
        // P=100k, 10% Flat Yearly (0.10), 1 Year (12 months).
        // Total Int = 100k * 0.10 * 1 = 10k.
        // periodicRate (monthly) = 0.10 / 12 = 0.008333
        // P * perRate * N = 100000 * 0.008333 * 12 = 10000. Correct.
        
        const totalInterest = principal * periodicRate * totalInstallments;
        const totalPayable = principal + totalInterest;
        return Math.round(totalPayable / totalInstallments);
    }

    // 2. Reducing Balance EMI
    // Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    if (periodicRate === 0) return Math.round(principal / totalInstallments);
    
    const numerator = principal * periodicRate * Math.pow(1 + periodicRate, totalInstallments);
    const denominator = Math.pow(1 + periodicRate, totalInstallments) - 1;
    
    return Math.round(numerator / denominator);
}

/**
 * Calculates Simple Interest for a specific principal amount over one period.
 * Used for "Interest Only" or manual calculations.
 */
export function calculatePeriodInterest(
    principal: number,
    periodicRate: number
): number {
    return Math.round(principal * periodicRate);
}
