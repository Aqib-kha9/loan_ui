import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Loan from '@/lib/models/Loan';
// Ensure Client is registered by importing it (even if not used directly, populate needs it)
import Client from '@/lib/models/Client'; 
import { recalculateLedger } from '@/lib/loan-engine';
import { getPeriodicInterestRate } from '@/lib/shared-loan-utils';
import { cookies } from 'next/headers';
import { verifyJWT, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // 1. Auth Check (Custom JWT)
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
        const user = token ? await verifyJWT(token) : null;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        // 2. DB Connection
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI as string);
        }

        // 3. Fetch Loan
        let query = {};
        if (mongoose.Types.ObjectId.isValid(id)) {
             query = { _id: id };
        } else {
             query = { loanId: id }; 
        }

        const loan = await Loan.findOne(query).populate('client');

        if (!loan) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }

        // 4. Params (Unused after migration)
        // const statementParams = { ... };

        // 5. Generate Ledger via Unified Engine (Migrated to Core Loan Engine)
        // We use 'recalculateLedger' in read-only mode (persist=false) to get the exact backend state.
        const ledgerState = await recalculateLedger(loan.loanId, undefined, false);
        const ledger = ledgerState.virtualTransactions.map((txn: any) => ({
             date: txn.date,
             particulars: txn.particulars,
             type: txn.type,
             debit: txn.debit,
             credit: txn.credit,
             balance: txn.balance,
             refNo: txn.refNo,
             txnId: txn.txnId,
             // NEW FIELDS
             principalComponent: txn.principalComponent,
             interestComponent: txn.interestComponent,
             principalBalance: txn.principalBalance,
             interestBalance: txn.interestBalance,
             isPayment: txn.isPayment
        }));

        // Calculate Net Disbursal for display
        // We can use the utils or just simple calc
        // Net = LoanAmount - ProcessingFee - (PrepaidInterest ? InterestFor1stPeriod : 0)
        
        // Let's use logic consistent with engine
        let firstPeriodInterest = 0;
        if (loan.interestPaidInAdvance) {
             const periodicRate = getPeriodicInterestRate(loan);
             // Interest on Full Principal
             firstPeriodInterest = Math.round(loan.loanAmount * periodicRate);
        }
        
        const netDisbursal = loan.loanAmount - (loan.processingFee || 0) - (loan.interestPaidInAdvance ? firstPeriodInterest : 0);

        // 6. Calculate Summaries
        const totalInterestAccrued = ledgerState.accruedInterest + ledgerState.totalPaidInterest; 
        // Note: ledgerState.accruedInterest is "Currently Outstanding Interest". 
        // We want "Total Interest Charged So Far". 
        // In virtualTransactions, we can sum 'debit' of type 'Interest'.
        
        const totalInterestDebited = ledger
            .filter((e: any) => e.type === 'Interest')
            .reduce((sum: number, e: any) => sum + (e.debit || 0), 0);
            
        const totalPaid = ledgerState.totalPaidPrincipal + ledgerState.totalPaidInterest;
        const closingBalance = ledgerState.outstandingPrincipal + ledgerState.accruedInterest;

        return NextResponse.json({
            success: true,
            statement: {
                metadata: {
                    generatedAt: new Date(),
                    loanId: loan.loanId,
                    customer: `${loan.client.firstName} ${loan.client.lastName}`.trim(),
                    address: loan.client.address || '',
                    mobile: loan.client.mobile || '',
                    sanctionDate: loan.disbursementDate,
                    loanAmount: Number(loan.loanAmount) || 0,
                    netDisbursal: netDisbursal, 
                    interestRateDisplay: loan.interestRateUnit === 'Monthly' 
                        ? `${loan.interestRate}% Monthly (${(loan.interestRate * 12).toFixed(2)}% Yearly)` 
                        : `${loan.interestRate}% Yearly (${(loan.interestRate / 12).toFixed(2)}% Monthly)`
                },
                ledger: ledger,
                summary: {
                    totalInterest: totalInterestDebited, // Renamed for frontend compatibility
                    totalPrincipalPaid: ledgerState.totalPaidPrincipal,
                    totalInterestPaid: ledgerState.totalPaidInterest,
                    totalPaid,
                    closingBalance
                }
            }
        });

    } catch (error: any) {
        console.error("Statement API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
