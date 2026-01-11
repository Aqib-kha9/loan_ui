import { LoanAccount, Transaction, RepaymentScheduleItem } from "./mock-data";

export function mapLoanToFrontend(backendLoan: any): LoanAccount {
    const client = backendLoan.client || {};
    
    // Map Schedule
    const repaymentSchedule: RepaymentScheduleItem[] = (backendLoan.repaymentSchedule || []).map((item: any) => ({
        installmentNo: item.installmentNo,
        dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
        amount: item.amount,
        principalComponent: item.principalComponent,
        interestComponent: item.interestComponent,
        balance: item.balance,
        status: item.status,
        paidAmount: item.paidAmount || 0,
        paidDate: item.paidDate ? new Date(item.paidDate).toISOString().split('T')[0] : undefined
    }));

    // Map Transactions
    let transactions: Transaction[] = [];
    if (backendLoan.transactions && backendLoan.transactions.length > 0) {
        transactions = backendLoan.transactions.map((txn: any) => ({
            id: txn.txnId || txn._id,
            date: txn.date ? new Date(txn.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            amount: txn.amount,
            type: txn.type || 'EMI',
            refNo: txn.reference || txn.paymentMode || '-',
            balanceAfter: txn.balanceAfter || 0,
            principalComponent: 0, // backend might not store this granularly in txn history yet
            interestComponent: 0,
            penalty: 0
        }));
    } else {
        // Fallback: Construct transactions for compatibility (legacy use)
        transactions = (backendLoan.repaymentSchedule || [])
            .filter((item: any) => item.status === 'paid' || item.status === 'partially_paid')
            .map((item: any) => ({
                id: item._id || `txn-${item.installmentNo}`,
                date: item.paidDate ? new Date(item.paidDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                amount: item.paidAmount || 0,
                type: 'EMI',
                refNo: `EMI-${item.installmentNo}`,
                balanceAfter: 0,
                principalComponent: 0,
                interestComponent: 0,
                penalty: 0
            }));
    }

    return {
        clientId: client._id || "",
        loanNumber: backendLoan.loanId,
        customerName: `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unknown',
        fatherName: "", 
        dob: "", 
        gender: "Male",
        mobile: client.mobile || "",
        altMobile: "",
        email: client.email || "",
        address: client.address || "",
        permanentAddress: "",
        occupation: "",
        photoUrl: client.photoUrl || "",
        
        totalLoanAmount: backendLoan.loanAmount,
        disbursedDate: backendLoan.disbursementDate ? new Date(backendLoan.disbursementDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        emiAmount: backendLoan.calculatedEMI || 0,
        interestRate: backendLoan.interestRate,
        interestPaidInAdvance: backendLoan.interestPaidInAdvance,
        tenureMonths: backendLoan.tenureMonths,
        indefiniteTenure: backendLoan.indefiniteTenure,
        emisPaid: transactions.length, 
        status: backendLoan.status ? (backendLoan.status.charAt(0).toUpperCase() + backendLoan.status.slice(1)) as any : "Active",
        loanType: (backendLoan.loanScheme === 'Business' ? 'Business' : backendLoan.loanScheme === 'Vehicle' ? 'Vehicle' : 'Personal'),
        loanScheme: backendLoan.loanScheme,
        repaymentFrequency: backendLoan.repaymentFrequency,
        interestType: backendLoan.interestType,
        interestRateUnit: backendLoan.interestRateUnit || 'Yearly',
        tenureUnit: backendLoan.tenureUnit || 'Months',
        
        // Total Contract Values
        totalPayable: backendLoan.totalPayable || 0,
        totalPaid: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),

        // Date-Driven Fields
        accumulatedInterest: backendLoan.accumulatedInterest || 0,
        currentPrincipal: backendLoan.currentPrincipal || backendLoan.loanAmount,
        lastAccrualDate: backendLoan.lastAccrualDate ? new Date(backendLoan.lastAccrualDate).toISOString().split('T')[0] : undefined,
        dailyInterestRate: backendLoan.dailyInterestRate,
        outstandingPenalty: backendLoan.outstandingPenalty || 0,

        // Receipt Data
        processingFee: backendLoan.processingFeePercent ? (backendLoan.loanAmount * backendLoan.processingFeePercent / 100) : 0,
        netDisbursal: backendLoan.netDisbursal || backendLoan.loanAmount,
        paymentModes: backendLoan.paymentModes ? backendLoan.paymentModes.map((m: any) => ({
            type: m.type,
            amount: m.amount.toString(),
            reference: m.reference || ''
        })) : [],

        repaymentSchedule: repaymentSchedule,
        nextPaymentDate: (() => {
            let nextDate = backendLoan.nextPaymentDate 
                ? new Date(backendLoan.nextPaymentDate).toISOString().split('T')[0] 
                : repaymentSchedule.find(i => i.status === 'pending')?.dueDate;

            // FIX: If "Interest Paid In Advance" is true, and Next Date == Disbursed Date (Initial State),
            // It means the first month is covered. We should show the NEXT due date (1 Month later).
            // Otherwise sidebar shows "DUE Today" immediately after creation.
            if (backendLoan.interestPaidInAdvance && nextDate) {
                const disbDate = backendLoan.disbursementDate ? new Date(backendLoan.disbursementDate).toISOString().split('T')[0] : '';
                if (nextDate === disbDate) {
                     // Bump by 1 month (assuming Monthly for now, safe default)
                     const d = new Date(nextDate);
                     d.setMonth(d.getMonth() + 1);
                     nextDate = d.toISOString().split('T')[0];
                }
            }

            // FIX: For Indefinite Tenure, never show "Completed" (undefined).
            // If schedule is exhausted or empty, project the next date.
            // FIX: For Indefinite Tenure, never show "Completed" (undefined).
            // If active, always project the next date relative to today or last item.
            if (!nextDate && backendLoan.indefiniteTenure && backendLoan.status !== 'Closed') {
                 const lastItem = repaymentSchedule[repaymentSchedule.length - 1];
                 
                 // If no schedule (common for flat indefinite), start from disbursal
                 let baseDateStr = lastItem ? lastItem.dueDate : (backendLoan.disbursementDate || new Date().toISOString().split('T')[0]);
                 
                 // However, for indefinite, the "Due Date" should probably be the *upcoming* cycle.
                 // If disbursal was 10 days ago, is it due now? Or next month?
                 // Let's stick to the simple projection: Base + 1 Period.
                 
                 // Handle daily/weekly logic too if needed, but assuming Monthly default for now as per prompt context
                 const baseDate = new Date(baseDateStr);
                 baseDate.setMonth(baseDate.getMonth() + 1);
                 nextDate = baseDate.toISOString().split('T')[0];
            }

            return nextDate;
        })(),
            
        nextPaymentAmount: backendLoan.nextPaymentAmount || repaymentSchedule.find(i => i.status === 'pending')?.amount,

        aadharNo: client.aadhar || "",
        panNo: client.pan || "",
        kycStatus: "Verified",

        guarantorName: "",
        guarantorMobile: "",
        guarantorRelation: "",
        guarantorAadhar: "",

        bankName: "",
        accountNo: "",
        ifscCode: "",

        transactions: transactions
    };
}
