import { NextResponse } from 'next/server';
import { UnifiedLoanEngine } from '@/lib/engine';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            loanAmount, interestRate, tenureMonths, 
            loanScheme, interestType, interestRateUnit, 
            repaymentFrequency, startDate, 
            indefiniteTenure, tenureUnit,
            processingFeePercent, interestPaidInAdvance
        } = body;

        const P = parseFloat(loanAmount) || 0;
        const R = parseFloat(interestRate) || 0;
        const N = parseFloat(tenureMonths) || 0;
        const PF = parseFloat(processingFeePercent) || 0;

        if (P <= 0) {
            return NextResponse.json({ 
                schedule: [], 
                totals: { totalInterest: 0, totalPayable: 0, emi: 0, netDisbursal: 0 } 
            });
        }

        let tUnit = tenureUnit || 'Months';
        // Auto-correct unit if matches frequency logic (same as create loan)
        if (repaymentFrequency === 'Daily' && tUnit === 'Months') tUnit = 'Days';
        if (repaymentFrequency === 'Weekly' && tUnit === 'Months') tUnit = 'Weeks';

        const engineParams = {
            principal: P,
            interestRate: R,
            interestRateUnit: interestRateUnit as any,
            repaymentFrequency: repaymentFrequency as any,
            tenure: N,
            tenureUnit: tUnit as any,
            scheme: loanScheme as any,
            interestType: interestType as any,
            startDate: new Date(startDate || new Date()),
            indefiniteTenure: !!indefiniteTenure,
            interestPaidInAdvance: !!interestPaidInAdvance
        };

        // 1. Get Periodic Rate (for UI display)
        const periodicInt = UnifiedLoanEngine.calculatePeriodicInterest(
            P, R, interestRateUnit as any, repaymentFrequency as any
        );

        // 2. Generate Schedule
        const schedule = UnifiedLoanEngine.getSchedule(engineParams);

        // 3. Calculate Totals
        let totalInterest = 0;
        let totalPayable = 0;
        let emi = 0;

        if (indefiniteTenure) {
            emi = periodicInt;
            totalInterest = 0; // Unknown
            totalPayable = 0;  // Unknown
        } else if (schedule.length > 0) {
            totalPayable = schedule.reduce((sum, row) => sum + row.amount, 0);
            totalInterest = schedule.reduce((sum, row) => sum + row.interestComponent, 0);
            emi = schedule[0].amount;
        } else if (loanScheme === 'InterestOnly') {
             // Fallback if N=0 but Fixed Tenure? Should not happen if Valid.
             // If N=0 and Fixed, we return emi=PeriodInt
             emi = periodicInt;
        }

        // 4. Net Disbursal
        let firstMonthInterest = 0;
        if (loanScheme === 'InterestOnly') {
             firstMonthInterest = periodicInt;
        } else if (schedule.length > 0) {
             firstMonthInterest = schedule[0].interestComponent;
        }

        const processingFeeAmount = (P * PF) / 100;
        const netDisbursal = UnifiedLoanEngine.calculateNetDisbursement(P, processingFeeAmount, !!interestPaidInAdvance, firstMonthInterest);

        return NextResponse.json({
            success: true,
            schedule,
            totals: {
                totalInterest: Math.round(totalInterest),
                totalPayable: Math.round(totalPayable),
                emi: Math.round(emi),
                periodicInterest: Math.round(periodicInt),
                processingFeeAmount: Math.round(processingFeeAmount),
                netDisbursal: Math.round(netDisbursal),
                firstMonthInterest: Math.round(firstMonthInterest)
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
