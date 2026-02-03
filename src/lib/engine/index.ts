import { LoanParams, generateSchedule, ScheduleRow } from './schedule-generator';
import { calculatePeriodicRate, calculatePeriodInterest, InterestRateUnit, RepaymentFrequency } from './interest-calculator';
import { generateStatement, StatementParams, LedgerEntry } from './statement-generator';

export class UnifiedLoanEngine {
    
    /**
     * Calculates the "Monthly" (or periodic) interest amount.
     * Useful for UI previews like "Interest: ₹10,000 / month".
     */
    static calculatePeriodicInterest(
        principal: number,
        rate: number,
        rateUnit: InterestRateUnit,
        freq: RepaymentFrequency
    ): number {
        const periodicRate = calculatePeriodicRate(rate, rateUnit, freq);
        return calculatePeriodInterest(principal, periodicRate);
    }

    /**
     * Generates the full repayment schedule.
     */
    static getSchedule(params: LoanParams): ScheduleRow[] {
        return generateSchedule(params);
    }

    /**
     * Calculates the "Net Disbursement Amount" (Principal - Deductions).
     */
    static calculateNetDisbursement(
        principal: number,
        processingFee: number,
        collectAdvanceInterest: boolean,
        advanceInterestAmount: number = 0
    ): number {
        let net = principal - processingFee;
        if (collectAdvanceInterest) {
            net -= advanceInterestAmount;
        }
        return net;
    }

    /**
     * Generates a chronological Statement of Account (Ledger).
     */
    static getStatement(params: StatementParams): LedgerEntry[] {
        return generateStatement(params);
    }
}
