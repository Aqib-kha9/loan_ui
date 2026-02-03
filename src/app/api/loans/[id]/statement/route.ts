import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Loan from '@/lib/models/Loan';
// Ensure Client is registered by importing it (even if not used directly, populate needs it)
import Client from '@/lib/models/Client'; 
import { UnifiedLoanEngine } from '@/lib/engine';
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

        // 4. Prepare Engine Params
        const statementParams = {
            loanAmount: Number(loan.loanAmount),
            interestRate: Number(loan.interestRate),
            interestRateUnit: loan.interestRateUnit as any,
            repaymentFrequency: loan.repaymentFrequency as any,
            disbursalDate: loan.disbursementDate || loan.createdAt,
            interestPaidInAdvance: loan.interestPaidInAdvance,
            loanScheme: loan.loanScheme,
            transactions: (loan.transactions || []).map((t: any) => ({
                id: t.txnId || t._id.toString(),
                date: new Date(t.date),
                amount: Number(t.amount),
                type: t.type,
                description: t.description,
                reference: t.reference,
                principalComponent: t.principalComponent,
                interestComponent: t.interestComponent
            }))
        };

        // 5. Generate Ledger via Unified Engine
        const ledger = UnifiedLoanEngine.getStatement(statementParams);

        // Calculate Net Disbursal for display
        const netDisbursal = UnifiedLoanEngine.calculateNetDisbursement(
            statementParams.loanAmount,
            loan.processingFee || 0, // Assuming processing fee field exists or 0
            statementParams.interestPaidInAdvance,
            // Calculate Advance Interest Amount (Simple: P * rate * 1 period)
            // Or extract from ledger if easier?
            // Let's use the Ledger's "Interest Debited (Advance)" if strictly needed,
            // or the Engine's util.
            UnifiedLoanEngine.calculatePeriodicInterest(
                statementParams.loanAmount,
                statementParams.interestRate,
                statementParams.interestRateUnit,
                statementParams.repaymentFrequency
            )
        );

        // 6. Calculate Summaries
        const totalInterestAccrued = ledger
            .filter(e => e.type === 'Interest')
            .reduce((sum, e) => sum + e.debit, 0);

        const totalPaid = ledger
            .filter(e => e.isPayment)
            .reduce((sum, e) => sum + e.credit, 0);

        const closingBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;

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
                    netDisbursal: netDisbursal, // Added
                    interestRateDisplay: loan.interestRateUnit === 'Monthly' 
                        ? `${loan.interestRate}% Monthly (${(loan.interestRate * 12).toFixed(2)}% Yearly)` 
                        : `${loan.interestRate}% Yearly (${(loan.interestRate / 12).toFixed(2)}% Monthly)`
                },
                ledger: ledger,
                summary: {
                    totalInterestAccrued,
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
