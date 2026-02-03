import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Client from '@/lib/models/Client';
import Loan from '@/lib/models/Loan';
import Activity from '@/lib/models/Activity';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { logActivity } from '@/lib/activity-logger';
import { cookies } from 'next/headers';
import { verifyJWT, AUTH_COOKIE_NAME } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';

async function checkAccess(req: Request, requiredPermission: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return false;
    
    const payload = await verifyJWT(token);
    if (!payload) return false;

    const userPayload = payload as any; 
    // Admin bypass
    if (userPayload.role === 'Admin' || userPayload.role === 'super_admin') return true;

    return userPayload.permissions?.includes(requiredPermission);
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        
        // 1. Auth & Permission Check
        const hasAccess = await checkAccess(req, PERMISSIONS.CREATE_LOAN);
        if (!hasAccess) {
            return NextResponse.json({ error: "Unauthorized: Missing 'create_loan' permission" }, { status: 403 });
        }

        const body = await req.json();
        const {
            // Customer Info
            firstName, lastName, mobile, email, address, aadhar, pan, customerImage,
            
            // Loan Config
            loanAmount, interestRate, tenureMonths, loanScheme,
            interestType, interestRateUnit, interestPaidInAdvance,
            repaymentFrequency, processingFeePercent, startDate,
            indefiniteTenure, tenureUnit,
            
            // Lifecycle 2.0 Configs
            gracePeriodDays, penaltyConfig, advancePaymentAction, holidayHandling,
            
            // Splits
            paymentModes
        } = body;


        // 2. Validate essential fields
        if (!firstName || !mobile || !loanAmount || !interestRate || !startDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 3. Handle Image Upload
        let photoUrl = null;
        if (customerImage) {
            try {
                // If it's a base64 string, upload it
                if (customerImage.startsWith('data:image')) {
                    photoUrl = await uploadToCloudinary(customerImage);
                }
            } catch (err) {
                console.error("Image upload failed, proceeding without image:", err);
            }
        }

        // 4. Find or Create Client
        // Check if client exists by Mobile or PAN
        let client = await Client.findOne({ $or: [{ mobile }, { pan: pan ? pan : "NO_MATCH" }] });

        if (client) {
            // Update existing client
            client.firstName = firstName;
            client.lastName = lastName;
            client.email = email;
            client.address = address;
            if (aadhar) client.aadhar = aadhar;
            if (pan) client.pan = pan;
            if (photoUrl) client.photoUrl = photoUrl; // Update photo if new one provided
            await client.save();
        } else {
            // Create new client
            client = await Client.create({
                firstName,
                lastName,
                mobile,
                email,
                address,
                aadhar,
                pan,
                photoUrl
            });
        }

        // 5. Unified Engine Calculation
        const P = parseFloat(loanAmount);
        const R = parseFloat(interestRate);
        const N = parseFloat(tenureMonths) || 0;
        const PF_Percent = parseFloat(processingFeePercent) || 0;
        
        let tUnit = tenureUnit || 'Months';
        // Auto-correct unit if Frequency is Daily/Weekly but Unit defaulted to Months
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
            startDate: new Date(startDate),
            indefiniteTenure: !!indefiniteTenure,
            interestPaidInAdvance: !!interestPaidInAdvance
        };

        const { UnifiedLoanEngine } = await import('@/lib/engine');
        const schedule = UnifiedLoanEngine.getSchedule(engineParams);

        // Calculate Totals from Schedule
        let totalInterest = 0;
        let totalPayable = 0;
        let emi = 0;
        let nextPaymentDate = null;
        let nextPaymentAmount = 0;
        
        const disbursementDate = new Date(startDate);

        if (indefiniteTenure) {
            // Indefinite: Calculate periodic interest manually for initial record
            const periodicInt = UnifiedLoanEngine.calculatePeriodicInterest(
                P, 
                R, 
                interestRateUnit as any, 
                repaymentFrequency as any
            );
            
            emi = periodicInt; // For Interest Only, EMI = Periodic Interest
            totalInterest = 0; // Unknown
            totalPayable = 0;  // Unknown
            
            // Next Payment Date logic
            const { addMonths, addWeeks, addDays } = await import('date-fns');
            const dDate = new Date(startDate); // Disbursement Date
            
             if (!interestPaidInAdvance) {
                if (repaymentFrequency === 'Weekly') nextPaymentDate = addWeeks(dDate, 1);
                else if (repaymentFrequency === 'Daily') nextPaymentDate = addDays(dDate, 1);
                else nextPaymentDate = addMonths(dDate, 1);
            } else {
                nextPaymentDate = new Date(dDate); // Immediate if advance? Or next cycle? 
                // Usually Advance means Date 0 is paid. So next due is Date 1.
                 if (repaymentFrequency === 'Weekly') nextPaymentDate = addWeeks(dDate, 1);
                else if (repaymentFrequency === 'Daily') nextPaymentDate = addDays(dDate, 1);
                else nextPaymentDate = addMonths(dDate, 1);
            }
            nextPaymentAmount = periodicInt;

        } else if (schedule.length > 0) {
            // Fixed Tenure
            totalPayable = schedule.reduce((sum, row) => sum + row.amount, 0);
            totalInterest = schedule.reduce((sum, row) => sum + row.interestComponent, 0);
            
            // Estimate EMI (Take first installment amount)
            emi = schedule[0].amount;

            // Next Payment
            // If Interest Paid In Advance, the first schedule item is the "Advance Payment" which is already done.
            // So next due is the second item.
            if (interestPaidInAdvance && schedule.length > 1) {
                // Mark first as paid
                (schedule[0] as any).status = 'paid';
                (schedule[0] as any).paidAmount = schedule[0].amount;
                // Next
                nextPaymentDate = schedule[1].dueDate;
                nextPaymentAmount = schedule[1].amount;
            } else {
                nextPaymentDate = schedule[0].dueDate;
                nextPaymentAmount = schedule[0].amount;
            }
        }

        // Net Disbursement
        let firstMonthInterest = 0;
        if (loanScheme === 'InterestOnly') {
             firstMonthInterest = UnifiedLoanEngine.calculatePeriodicInterest(P, R, interestRateUnit as any, repaymentFrequency as any);
        } else {
            // For EMI, roughly estimate first interest component
             // Or use schedule[0].interestComponent if available
             if (schedule.length > 0) firstMonthInterest = schedule[0].interestComponent;
        }

        const processingFeeAmount = (P * PF_Percent) / 100;
        const netDisbursal = UnifiedLoanEngine.calculateNetDisbursement(P, processingFeeAmount, !!interestPaidInAdvance, firstMonthInterest);

        // 7. Create Loan Record
        const loanId = `LN-${Date.now().toString().slice(-6)}`; 
    
        const newLoan = await Loan.create({
            client: client._id,
            loanId,
            loanAmount: P,
            interestRate: R,
            interestRateUnit: interestRateUnit || 'Yearly',
            tenureMonths: N,
            tenureUnit: tUnit,
            indefiniteTenure: !!indefiniteTenure,
            loanScheme,
            interestType,
            interestPaidInAdvance: !!interestPaidInAdvance,
            repaymentFrequency,
            processingFeePercent: PF_Percent,
            
            // Lifecycle 2.0
            gracePeriodDays: parseInt(gracePeriodDays) || 0,
            penaltyConfig: penaltyConfig || { type: 'Fixed', value: 0 },
            advancePaymentAction: advancePaymentAction || 'ReduceNextEMI',
            holidayHandling: holidayHandling || 'Ignore',
            
            calculatedEMI: Math.round(emi),
            totalInterest: Math.round(totalInterest),
            totalPayable: Math.round(totalPayable),
            netDisbursal: Math.round(netDisbursal),
            
            disbursementDate: new Date(startDate), // User Selected
            startDate: schedule.length > 0 ? schedule[0].dueDate : new Date(startDate),    
            
            // Future Tracking
            nextPaymentDate,
            nextPaymentAmount,
            repaymentSchedule: schedule,
            
            paymentModes: paymentModes.map((mode: any) => ({
                type: mode.type,
                amount: parseFloat(mode.amount),
                reference: mode.reference
            })),
            
            status: 'Active',
            disbursedBy: 'Admin User' 
        });

        // 7b. If Interest Paid In Advance, Create the Transaction & Handle Initial State
        if (interestPaidInAdvance) {
            // Update Transaction History for the Advance Payment
             const advanceTxn = {
                txnId: `TXN-ADV-${Date.now()}`,
                date: new Date(disbursementDate),
                amount: firstMonthInterest,
                type: 'Interest', // Explicitly Interest
                description: 'Interest Paid in Advance',
                reference: 'Auto-Deducted / Pre-Paid',
                paymentMode: 'System',
                interestComponent: firstMonthInterest,
                principalComponent: 0,
                balanceAfter: P // Principal is still P until repaid at end
            };

            await Loan.findOneAndUpdate(
                { _id: newLoan._id },
                { $push: { transactions: advanceTxn } }
            );
        }

        return NextResponse.json({ success: true, loan: newLoan, client });

    } catch (error: any) {
        console.error("Loan Creation Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        
        // Auth Check
        const hasAccess = await checkAccess(req, PERMISSIONS.VIEW_LOANS);
        if (!hasAccess) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const loans = await Loan.find({})
            .populate('client', 'firstName lastName photoUrl mobile address email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, loans });
    } catch (error: any) {
        console.error("Fetch Loans Error:", error);
        return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 });
    }
}
