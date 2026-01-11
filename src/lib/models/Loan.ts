import mongoose from "mongoose";

// Force model rebuild in dev to handle schema changes hot-reloading
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models['Loan'];
}

const LoanSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    loanId: {
        type: String,
        required: true,
        unique: true,
    },
    // Loan Configuration
    loanAmount: {
        type: Number,
        required: true,
    },
    interestRate: {
        type: Number,
        required: true,
    },
    interestRateUnit: {
        type: String,
        enum: ['Yearly', 'Monthly'],
        default: 'Yearly',
    },
    tenureMonths: {
        type: Number,
        required: true, // 0 if indefinite
    },
    tenureUnit: {
        type: String,
        enum: ['Months', 'Weeks', 'Days'],
        default: 'Months',
    },

    indefiniteTenure: {
        type: Boolean,
        default: false,
    },
    loanScheme: {
        type: String,
        enum: ['EMI', 'InterestOnly'],
        required: true,
    },
    interestType: {
        type: String,
        enum: ['Flat', 'Reducing'],
        default: 'Flat',
    },
    interestPaidInAdvance: {
        type: Boolean,
        default: false,
    },
    repaymentFrequency: {
        type: String,
        enum: ['Monthly', 'Weekly', 'Daily'],
        default: 'Monthly',
    },
    processingFeePercent: {
        type: Number,
        default: 0,
    },
    
    // --- Loan Lifecycle 2.0 Config ---
    gracePeriodDays: {
        type: Number,
        default: 0
    },
    penaltyConfig: {
        type: {
            type: String,
            enum: ['Fixed', 'Percentage'],
            default: 'Fixed'
        },
        value: { type: Number, default: 0 }
    },
    advancePaymentAction: {
        type: String,
        enum: ['ReduceNextEMI', 'ReduceTenure', 'KeepInWallet'],
        default: 'ReduceNextEMI'
    },
    holidayHandling: {
        type: String,
        enum: ['NextWorkingDay', 'PreviousWorkingDay', 'Ignore'],
        default: 'Ignore'
    },
    
    // Internal Tracking for Date-Driven Engine
    dailyInterestRate: { type: Number }, // Calculated and stored for consistency
    lastAccrualDate: { type: Date },     // For daily accrual tracking
    accumulatedInterest: { type: Number, default: 0 }, // Unpaid accrued interest
    

    // Calculated Values (Snapshot at creation)
    calculatedEMI: {
        type: Number,
        required: true,
    },
    totalInterest: {
        type: Number,
        required: true,
    },
    totalPayable: {
        type: Number,
        required: true,
    },
    netDisbursal: {
        type: Number,
        required: true,
    },
    
    // Dates
    disbursementDate: {
        type: Date,
        default: Date.now,
    },
    startDate: { // First EMI / Interest date
        type: Date,
        required: true,
    },
    
    // Future Payment Tracking
    nextPaymentDate: {
        type: Date,
    },
    nextPaymentAmount: {
        type: Number,
    },
    currentPrincipal: {
        type: Number, // Date-driven outstanding principal
        default: 0
    },


    // Repayment Schedule
    repaymentSchedule: [{
        installmentNo: Number,
        dueDate: Date,
        amount: Number,
        principalComponent: Number,
        interestComponent: Number,
        balance: Number,
        status: {
            type: String,
            enum: ['pending', 'paid', 'partially_paid', 'overdue'],
            default: 'pending'
        },
        paidAmount: { type: Number, default: 0 },
        paidDate: Date
    }],

    // Payment Splits (Disbursement)
    paymentModes: [{
        type: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        reference: String
    }],

    // Transaction History (Repayments)
    transactions: [{
        txnId: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        amount: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['EMI', 'Part Payment', 'Closure', 'Fee', 'Penalty'],
            default: 'EMI'
        },
        description: String,
        reference: String, // e.g., UPI Ref
        paymentMode: String, // Cash, UPI, etc.
        balanceAfter: Number
    }],

    // Meta
    status: {
        type: String,
        enum: ['Active', 'Closed', 'NPA', 'Rejected'],
        default: 'Active',
    },
    disbursedBy: {
        type: String, // Username or ID of admin
        required: true,
    }
}, {
    timestamps: true // Automatically handles createdAt and updatedAt
});

export default mongoose.models.Loan || mongoose.model("Loan", LoanSchema);
