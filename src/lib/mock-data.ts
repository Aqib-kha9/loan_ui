export type RepaymentScheduleItem = {
  installmentNo: number;
  dueDate: string;
  amount: number;
  principalComponent: number;
  interestComponent: number;
  balance: number;
  status: "pending" | "paid" | "partially_paid" | "overdue";
  paidAmount: number;
  paidDate?: string;
};

export type LoanAccount = {
  clientId?: string; 
  loanNumber: string;
  customerName: string;
  fatherName: string; 
  dob: string;        
  gender: "Male" | "Female" | "Other"; 
  mobile: string;
  altMobile?: string; 
  email?: string;     
  address: string;
  permanentAddress?: string; 
  occupation: string; 
  photoUrl?: string;

  // Loan Details
  totalLoanAmount: number;
  disbursedDate: string;
  emiAmount: number;
  interestRate: number; 
  interestPaidInAdvance?: boolean; 
  tenureMonths: number;
  indefiniteTenure?: boolean; 
  emisPaid: number;
  status: "Active" | "Closed" | "NPA" | "Rejected" | "Overdue" | "Settled";
  loanType: "Personal" | "Business" | "Vehicle"; 
  loanScheme?: "EMI" | "InterestOnly" | "Bullet"; 
  repaymentFrequency?: "Monthly" | "Weekly" | "Daily" | "Yearly"; 
  interestType?: "Flat" | "Reducing"; 
  interestRateUnit?: string; 
  tenureUnit?: string; 
  
  // Total Contract Fields
  totalPayable?: number;
  totalPaid?: number;
  
  // Date-Driven Tracking
  accumulatedInterest?: number;
  currentPrincipal?: number; 
  lastAccrualDate?: string;
  dailyInterestRate?: number;
  outstandingPenalty?: number;
  
  // Receipt Data
  processingFee?: number;
  netDisbursal?: number;
  firstMonthInterest?: number;
  paymentModes?: { type: string, amount: string, reference: string }[];

  repaymentSchedule?: RepaymentScheduleItem[]; 
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
  
  // KYC Documents
  aadharNo: string; 
  panNo: string;    
  kycStatus: "Verified" | "Pending" | "Rejected"; 
  
  // Guarantor
  guarantorName: string;   
  guarantorMobile: string; 
  guarantorRelation: string; 
  guarantorAadhar?: string; 

  // Bank Details
  bankName?: string;
  accountNo?: string;
  ifscCode?: string;

  transactions: Transaction[];
};

export type Transaction = {
  id?: string;
  txnId?: string; 
  date: string; 
  amount: number;
  principalComponent?: number;
  interestComponent?: number;
  penalty?: number;
  refNo?: string;
  type: "EMI" | "Part Payment" | "Closure" | "Fee" | "Interest" | "Disbursal" | "Penalty";
  description?: string; 
  paymentMode?: string; 
  balanceAfter: number;
};
