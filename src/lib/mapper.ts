import { LoanAccount, Transaction, RepaymentScheduleItem } from "./mock-data";
import { calculateLoanState } from "./loan-state-engine";

export function mapLoanToFrontend(backendLoan: any): LoanAccount {
    const client = backendLoan.client || {};
    const state = calculateLoanState(backendLoan);
    
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
        loanType: (backendLoan.loanScheme === 'Business' ? 'Business' : backendLoan.loanScheme === 'Vehicle' ? 'Vehicle' : 'Personal'),
        loanScheme: backendLoan.loanScheme,
        repaymentFrequency: backendLoan.repaymentFrequency,
        interestType: backendLoan.interestType,
        interestRateUnit: backendLoan.interestRateUnit || 'Yearly',
        tenureUnit: backendLoan.tenureUnit || 'Months',
        
        // Total Contract Values
        totalPayable: backendLoan.totalPayable || 0,
        totalPaid: state.totalPaid,
        
        // Status Overide by State Engine
        status: state.status as any,

        // Date-Driven Fields
        accumulatedInterest: state.accruedInterest,
        currentPrincipal: state.principalBalance,
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
        nextPaymentDate: state.nextDueDate || repaymentSchedule.find(i => i.status === 'pending')?.dueDate || undefined,
        nextPaymentAmount: state.nextDueAmount,

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
