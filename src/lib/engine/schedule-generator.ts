import { addMonths, addWeeks, addDays } from 'date-fns';
import { InterestRateUnit, RepaymentFrequency, InterestType, calculatePeriodicRate, calculateEMI, calculatePeriodInterest } from './interest-calculator';

export interface LoanParams {
    principal: number;
    interestRate: number;
    interestRateUnit: InterestRateUnit;
    repaymentFrequency: RepaymentFrequency;
    
    tenure: number;
    tenureUnit: 'Months' | 'Weeks' | 'Days';
    
    scheme: 'EMI' | 'InterestOnly';
    interestType: InterestType;
    
    startDate: Date;
    indefiniteTenure: boolean;
    interestPaidInAdvance: boolean;
}

export interface ScheduleRow {
    installmentNo: number;
    dueDate: Date;
    amount: number;
    principalComponent: number;
    interestComponent: number;
    balance: number;
}

export function generateSchedule(params: LoanParams): ScheduleRow[] {
    const {
        principal: P,
        tenure: N,
        tenureUnit,
        repaymentFrequency,
        scheme,
        interestType,
        startDate,
        indefiniteTenure,
        interestPaidInAdvance
    } = params;

    if (indefiniteTenure) return [];

    // 1. Calculate Periodic Rate
    const periodicRate = calculatePeriodicRate(params.interestRate, params.interestRateUnit, repaymentFrequency);

    // 2. Normalize Tenure to Number of Installments
    let totalInstallments = N;
    
    // Cross-conversion (e.g. 1 Year Tenure, Weekly Freq)
    if (repaymentFrequency === 'Weekly') {
        if (tenureUnit === 'Months') totalInstallments = (N / 12) * 52;
        else if (tenureUnit === 'Days') totalInstallments = N / 7;
    } else if (repaymentFrequency === 'Daily') {
        if (tenureUnit === 'Months') totalInstallments = (N / 12) * 365;
        else if (tenureUnit === 'Weeks') totalInstallments = N * 7;
    } else { // Monthly
        if (tenureUnit === 'Weeks') totalInstallments = N / 4.33;
        else if (tenureUnit === 'Days') totalInstallments = N / 30;
    }
    totalInstallments = Math.ceil(totalInstallments);

    const schedule: ScheduleRow[] = [];
    let currentDate = new Date(startDate);
    let balance = P;

    // Helper to advance date
    const nextDate = (d: Date) => {
        if (repaymentFrequency === 'Monthly') return addMonths(d, 1);
        if (repaymentFrequency === 'Weekly') return addWeeks(d, 1);
        return addDays(d, 1);
    };

    // --- CASE A: EMI SCHEME ---
    if (scheme === 'EMI') {
        const emi = calculateEMI(P, periodicRate, totalInstallments, interestType);
        
        for (let i = 1; i <= totalInstallments; i++) {
            let interest = 0;
            if (interestType === 'Reducing') {
                interest = calculatePeriodInterest(balance, periodicRate);
            } else {
                // Flat Interest per installment: (P * Rate * Tenure) / Installments
                // Equivalent to: P * periodicRate
                interest = Math.round(P * periodicRate); 
            }
            
            let amount = emi;
            let principalComp = amount - interest;
            
            // Last Installment Adjustment
            if (i === totalInstallments && interestType === 'Reducing') {
                principalComp = balance;
                amount = principalComp + interest;
            }

            balance -= principalComp;
            if (balance < 0) balance = 0;

            schedule.push({
                installmentNo: i,
                dueDate: new Date(currentDate),
                amount: Math.round(amount),
                principalComponent: Math.round(principalComp),
                interestComponent: Math.round(interest),
                balance: Math.round(balance)
            });

            currentDate = nextDate(currentDate);
        }
    } 
    // --- CASE B: INTEREST ONLY SCHEME ---
    else {
        const periodInterest = calculatePeriodInterest(P, periodicRate);
        const loopCount = interestPaidInAdvance ? totalInstallments + 1 : totalInstallments;

        for (let i = 1; i <= loopCount; i++) {
            let amount = 0;
            let principalComp = 0;
            let interestComp = 0;

            if (interestPaidInAdvance) {
                // Advance:
                // Inst 1..N = Interest Only (Amount = Int)
                // Inst N+1 = Principal Only (Amount = P)
                if (i <= totalInstallments) {
                    amount = periodInterest;
                    interestComp = periodInterest;
                    principalComp = 0;
                } else {
                    amount = P;
                    interestComp = 0;
                    principalComp = P;
                }
            } else {
                // Standard:
                // Inst 1..N-1 = Interest
                // Inst N = Interest + Principal
                const isLast = (i === totalInstallments);
                amount = isLast ? (P + periodInterest) : periodInterest;
                interestComp = periodInterest;
                principalComp = isLast ? P : 0;
            }

            if (principalComp > 0) balance -= principalComp;
            if (balance < 0) balance = 0;

            schedule.push({
                installmentNo: i,
                dueDate: new Date(currentDate),
                amount: Math.round(amount),
                principalComponent: Math.round(principalComp),
                interestComponent: Math.round(interestComp),
                balance: Math.round(balance)
            });

            currentDate = nextDate(currentDate);
        }
    }

    return schedule;
}
