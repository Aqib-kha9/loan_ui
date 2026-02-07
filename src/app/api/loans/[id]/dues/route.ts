import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Loan from '@/lib/models/Loan';
import { recalculateLedger } from '@/lib/loan-engine';
import { cookies } from 'next/headers';
import { verifyJWT, AUTH_COOKIE_NAME } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { differenceInDays, addDays, isAfter, isBefore } from 'date-fns';
import { getPeriodicInterestRate } from '@/lib/shared-loan-utils';

async function checkAccess(req: Request, requiredPermission: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return false;
    
    const payload = await verifyJWT(token);
    if (!payload) return false;

    const userPayload = payload as any; 
    if (userPayload.role === 'Admin' || userPayload.role === 'super_admin') return true;

    return userPayload.permissions?.includes(requiredPermission);
}

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await dbConnect();

        // 1. Auth Check
        const hasAccess = await checkAccess(req, PERMISSIONS.VIEW_LOANS); // Assuming view permission is enough to see dues
        if (!hasAccess) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const loanId = params.id;
        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get('date');
        const targetDate = dateParam ? new Date(dateParam) : new Date();

        const loan = await Loan.findOne({ loanId });
        if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });

        // 2. Run Ledger Engine to Target Date
        // This gives us the "Whole Cycle" state as of that date.
        const ledgerState = await recalculateLedger(loanId, targetDate);

        // 3. Pro-Rata Interest Calculation (The "Refined Approach")
        const lastAccrual = ledgerState.lastInterestAccrualDate ? new Date(ledgerState.lastInterestAccrualDate) : new Date(loan.disbursementDate);
        
        // Ensure we only calculate if target is AFTER last accrual
        let proRataInterest = 0;
        let daysElapsed = 0;

        if (isAfter(targetDate, lastAccrual)) {
            daysElapsed = differenceInDays(targetDate, lastAccrual);
            if (daysElapsed > 0) {
                 // Calculate Daily Rate
                 // We use the shared util but force 'Daily' frequency to get daily factor
                 const dailyRateWrapper = { 
                     ...loan.toObject(), 
                     repaymentFrequency: 'Daily' 
                 };
                 const dailyRate = getPeriodicInterestRate(dailyRateWrapper);
                 
                 // Basis for Interest
                 let principalBasis = ledgerState.outstandingPrincipal;
                 if (loan.interestType === 'Flat') {
                     principalBasis = loan.loanAmount;
                 }
                 
                 proRataInterest = Math.round(principalBasis * dailyRate * daysElapsed);
            }
        }
        
        // TOTAL DUE CALCULATION:
        const totalPrincipal = ledgerState.outstandingPrincipal;
        const totalInterest = ledgerState.accruedInterest + proRataInterest;
        const totalPenalty = (loan.outstandingPenalty || 0); 
        
        const totalToClose = totalPrincipal + totalInterest + totalPenalty;

        return NextResponse.json({
            success: true,
            dues: {
                principalBalance: totalPrincipal,
                accruedInterest: ledgerState.accruedInterest, // Billed
                proRataInterest: proRataInterest,             // Unbilled
                interestDue: totalInterest,                   // Total Interest
                penaltyDue: totalPenalty,
                totalDue: totalToClose,
                
                daysElapsed: daysElapsed,
                lastAccrualDate: lastAccrual,
                
                existingPrincipal: loan.currentPrincipal, // Debug
                existingInterest: loan.accumulatedInterest // Debug
            }
        });

    } catch (error: any) {
        console.error("Dues Fetch Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
