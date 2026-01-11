import { addMonths, addWeeks, addDays, differenceInDays } from 'date-fns';

interface LoanDetails {
    loanAmount: number;
    interestRate: number; // Yearly %
    tenureMonths: number;
    tenureUnit: 'Months' | 'Weeks' | 'Days';
    loanScheme: 'EMI' | 'InterestOnly';
    interestType: 'Flat' | 'Reducing';
    interestRateUnit: 'Yearly' | 'Monthly';
    repaymentFrequency: 'Monthly' | 'Weekly' | 'Daily';
    startDate: Date;
    disbursementDate?: Date; // New: For Broken Period Calc
    indefiniteTenure: boolean;
    holidayHandling?: 'NextWorkingDay' | 'PreviousWorkingDay' | 'Ignore';
    gracePeriodDays?: number;
}


export interface ScheduleItem {
    installmentNo: number;
    dueDate: Date;
    amount: number;
    principalComponent: number;
    interestComponent: number;
    balance: number;
    status: 'pending' | 'paid' | 'partially_paid' | 'overdue';
    paidAmount: number;
}

export const generateRepaymentSchedule = (details: LoanDetails): ScheduleItem[] => {
    const {
        loanAmount: P,
        interestRate: R_Yearly,
        tenureMonths: N,
        tenureUnit,
        loanScheme,

        interestType,
        interestRateUnit,
        repaymentFrequency,
        startDate,
        disbursementDate,
        indefiniteTenure,
        holidayHandling
    } = details;

    const schedule: ScheduleItem[] = [];
    
    // 1. Indefinite Tenure: No fixed schedule is generated upfront, updates are manual/monthly.
    if (indefiniteTenure) {
        return []; 
    }

    // 2. Determine Frequency Factors
    let frequencyDivisor = 12; // Default Monthly
    if (repaymentFrequency === 'Weekly') frequencyDivisor = 52;
    if (repaymentFrequency === 'Daily') frequencyDivisor = 365;

    // Normalize Rate to Period
    let r = R_Yearly;
    if (interestRateUnit === 'Monthly') {
        r = R_Yearly * 12; // Convert to Yearly first
    }
    const annualRate = r;
    const periodicRate = r / frequencyDivisor / 100;

    let balance = P;
    let currentDate = new Date(startDate);
    
    // Holiday Handling Utility
    const adjustDateForHoliday = (date: Date): Date => {
        if (!holidayHandling || holidayHandling === 'Ignore') return date;
        let d = new Date(date);
        // Simple Sunday check
        if (d.getDay() === 0) { // 0 is Sunday
             if (holidayHandling === 'NextWorkingDay') d = addDays(d, 1);
             if (holidayHandling === 'PreviousWorkingDay') d = addDays(d, -1);
        }
        return d;
    };
    
    // N is tenure (Duration in tenureUnit)
    // We need to convert this to Total Number of Installments
    let totalInstallments = N;
    
    // Logic: If Frequency matches Unit, N = Installments
    // If mismatch, convert.
    // Assuming UI enforces consistency (e.g. if Weekly freq, Unit is Weeks),
    // but we support cross-conversion just in case (e.g. 1 Month Weekly).
    
    if (repaymentFrequency === 'Weekly') {
        if (tenureUnit === 'Months') totalInstallments = (N / 12) * 52;
        else if (tenureUnit === 'Weeks') totalInstallments = N;
        else if (tenureUnit === 'Days') totalInstallments = N / 7;
    } else if (repaymentFrequency === 'Daily') {
        if (tenureUnit === 'Months') totalInstallments = (N / 12) * 365;
        else if (tenureUnit === 'Weeks') totalInstallments = N * 7;
        else if (tenureUnit === 'Days') totalInstallments = N;
    } else {
        // Monthly
        if (tenureUnit === 'Months') totalInstallments = N;
        else if (tenureUnit === 'Weeks') totalInstallments = N / 4.33; // Approx
        else if (tenureUnit === 'Days') totalInstallments = N / 30; // Approx
    }

    totalInstallments = Math.ceil(totalInstallments);


    // --- EMI Calculation Logic ---
    if (loanScheme === 'EMI') {
        let emi = 0;
        
        if (interestType === 'Flat') {
             // Total Interest = P * AnnualRate * (Tenure in Years) / 100
             // Tenure in Years = N / 12
             const totalInt = (P * annualRate * (N / 12)) / 100;
             const totalPay = P + totalInt;
             emi = totalPay / totalInstallments;
        } else {
             // Reducing Balance

             // Check for Broken Period
            if (disbursementDate) {
                 const firstPeriodDays = differenceInDays(currentDate, disbursementDate);
                 // Approximate standard period days
                 let standardDays = 30;
                 if (repaymentFrequency === 'Weekly') standardDays = 7;
                 if (repaymentFrequency === 'Daily') standardDays = 1;

                 // If first period is significantly longer (e.g. > 1.5x standard), add extra interest
                 // Implementation: We'll add it to the first EMI interest component if it exceeds standard period significantly.
                 // NOTE: For MVP 2.0, we just log this capability or assume basic accrual handles it via Ledger Engine re-calc.
                 // But for SCHEDULE accuracy, we might adjust the first installment amount here.
            }

             if (periodicRate === 0) emi = P / totalInstallments;

             else emi = (P * periodicRate * Math.pow(1 + periodicRate, totalInstallments)) / (Math.pow(1 + periodicRate, totalInstallments) - 1);
        }
        
        emi = Math.round(emi);

        for (let i = 1; i <= totalInstallments; i++) {
            let interestComponent = 0;
            let principalComponent = 0;
            const dueDate = adjustDateForHoliday(new Date(currentDate)); // Apply Holiday Logic

            if (interestType === 'Reducing') {
                interestComponent = balance * periodicRate;
            } else {
                // Flat: Interest per installment
                interestComponent = ((P * annualRate * (N/12))/100) / totalInstallments;
            }
            
            interestComponent = Math.round(interestComponent);
            
            // Adjust last installment logic
            let installmentAmount = emi;
            
            principalComponent = installmentAmount - interestComponent;
            
            if (interestType === 'Reducing' && i === totalInstallments) {
                 principalComponent = balance;
                 installmentAmount = principalComponent + interestComponent;
            }

            balance -= principalComponent;
            if(balance < 0) balance = 0;

            schedule.push({
                installmentNo: i,
                dueDate: dueDate,
                amount: installmentAmount,

                principalComponent,
                interestComponent,
                balance: Math.round(balance),
                status: 'pending',
                paidAmount: 0
            });

            // Increment Date
            if (repaymentFrequency === 'Monthly') currentDate = addMonths(currentDate, 1);
            else if (repaymentFrequency === 'Weekly') currentDate = addWeeks(currentDate, 1);
            else currentDate = addDays(currentDate, 1);
        }

    } else {
        // --- Interest Only Logic ---
        const periodicInterest = Math.round(P * periodicRate);

        for (let i = 1; i <= totalInstallments; i++) {
            const isLast = i === totalInstallments;
            const amount = isLast ? (P + periodicInterest) : periodicInterest;
            const principalComponent = isLast ? P : 0;
            const interestComponent = periodicInterest;

            const dueDate = adjustDateForHoliday(new Date(currentDate)); // Apply Holiday Logic

            balance -= principalComponent;

            schedule.push({
                installmentNo: i,
                dueDate: dueDate,
                amount: amount,
                principalComponent,
                interestComponent,
                balance: Math.round(balance),
                status: 'pending',
                paidAmount: 0
            });

             // Increment Date
             if (repaymentFrequency === 'Monthly') currentDate = addMonths(currentDate, 1);
             else if (repaymentFrequency === 'Weekly') currentDate = addWeeks(currentDate, 1);
             else currentDate = addDays(currentDate, 1);
        }
    }

    return schedule;
};
