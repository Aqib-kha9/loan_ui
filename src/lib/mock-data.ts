export type LoanAccount = {
  loanNumber: string;
  customerName: string;
  fatherName: string; // New
  dob: string;        // New
  gender: "Male" | "Female" | "Other"; // New
  mobile: string;
  altMobile?: string; // New
  email?: string;     // New
  address: string;
  permanentAddress?: string; // New
  occupation: string; // New

  // Loan Details
  totalLoanAmount: number;
  disbursedDate: string;
  emiAmount: number;
  interestRate: number; 
  tenureMonths: number;
  emisPaid: number;
  status: "Active" | "Closed" | "NPA";
  loanType: "Personal" | "Business" | "Vehicle"; // New
  
  // KYC Documents
  aadharNo: string; // New
  panNo: string;    // New
  kycStatus: "Verified" | "Pending" | "Rejected"; // New
  photoUrl?: string;

  // Guarantor
  guarantorName: string;   // New
  guarantorMobile: string; // New
  guarantorRelation: string; // New
  guarantorAadhar?: string; // New

  // Bank Details
  bankName?: string;
  accountNo?: string;
  ifscCode?: string;

  transactions: Transaction[];
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  type: "EMI" | "Part Payment" | "Closure" | "Fee";
  balanceAfter: number;
};

export const MOCK_LOANS: LoanAccount[] = [
  {
    loanNumber: "LN001",
    customerName: "Rajesh Kumar",
    fatherName: "Suresh Kumar",
    dob: "1985-06-15",
    gender: "Male",
    mobile: "9876543210",
    altMobile: "9876500000",
    email: "rajesh.k@example.com",
    address: "H.No 123, Gandhi Nagar, Delhi",
    permanentAddress: "Vill. Rampur, Dist. Meerut, UP",
    occupation: "Shopkeeper (Kirana)",
    
    totalLoanAmount: 50000,
    disbursedDate: "2024-01-15",
    emiAmount: 4500,
    interestRate: 12,
    tenureMonths: 12,
    emisPaid: 4,
    status: "Active",
    loanType: "Business",

    aadharNo: "4589 1234 5678",
    panNo: "ABCDE1234F",
    kycStatus: "Verified",
    photoUrl: "https://ui-avatars.com/api/?name=Rajesh+Kumar",

    guarantorName: "Amit Verma",
    guarantorMobile: "9988776655",
    guarantorRelation: "Friend/Business Partner",
    guarantorAadhar: "1234 5678 9012",

    bankName: "SBI",
    accountNo: "12345678901",
    ifscCode: "SBIN0001234",

    transactions: [
       { id: "TXN001", date: "2024-02-15", amount: 4500, type: "EMI", balanceAfter: 45500 },
       { id: "TXN002", date: "2024-03-15", amount: 4500, type: "EMI", balanceAfter: 41000 },
       { id: "TXN003", date: "2024-04-15", amount: 4500, type: "EMI", balanceAfter: 36500 },
       { id: "TXN004", date: "2024-05-15", amount: 4500, type: "EMI", balanceAfter: 32000 },
    ]
  },
  {
    loanNumber: "LN002",
    customerName: "Sita Devi",
    fatherName: "Ram Prasad",
    dob: "1990-08-22",
    gender: "Female",
    mobile: "9988776655",
    address: "Flat 4B, Sky Heights, Mumbai",
    occupation: "Private Teacher",

    totalLoanAmount: 100000,
    disbursedDate: "2023-11-01",
    emiAmount: 9000,
    interestRate: 14,
    tenureMonths: 12,
    emisPaid: 8,
    status: "Active",
    loanType: "Personal",

    aadharNo: "7890 1234 5678",
    panNo: "FGHIJ5678K",
    kycStatus: "Verified",
    photoUrl: "https://ui-avatars.com/api/?name=Sita+Devi",

    guarantorName: "Mohan Lal",
    guarantorMobile: "8877665544",
    guarantorRelation: "Father",

    bankName: "HDFC Bank",
    accountNo: "98765432109",
    ifscCode: "HDFC0001234",

    transactions: [] 
  },
  {
    loanNumber: "LN003",
    customerName: "Amit Singh",
    fatherName: "Deepak Singh",
    dob: "1992-12-10",
    gender: "Male",
    mobile: "1231231234",
    address: "Vill. Rampur, UP",
    occupation: "Farmer",

    totalLoanAmount: 20000,
    disbursedDate: "2023-01-01",
    emiAmount: 2000,
    interestRate: 15,
    tenureMonths: 11,
    emisPaid: 11,
    status: "Closed",
    loanType: "Personal",

    aadharNo: "1122 3344 5566",
    panNo: "KLMNO9012P",
    kycStatus: "Verified",

    guarantorName: "Sumit Singh",
    guarantorMobile: "9900112233",
    guarantorRelation: "Brother",

    transactions: []
  }
];

export const getLoanDetails = (query: string) => {
  return MOCK_LOANS.find(l => 
    l.loanNumber.toLowerCase() === query.toLowerCase() || 
    l.mobile === query ||
    l.customerName.toLowerCase().includes(query.toLowerCase())
  );
};
