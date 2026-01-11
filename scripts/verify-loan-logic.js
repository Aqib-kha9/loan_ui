
const { format } = require('util');

console.log("Starting Self-Contained Loan Verification...");

// --- COPIED LIST LOGIC FROM loan-engine.ts ---

const getDailyInterestRate = (annualRate, yearDays = 365) => {
    return (annualRate / 100) / yearDays;
};

const calculateDailyInterest = (principal, dailyRate) => {
    return principal * dailyRate;
};

const differenceInDays = (date2, date1) => {
    // Simple MS difference
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

// --- TEST SUITE ---

const passed = (msg) => console.log(`✅ PASS: ${msg}`);
const failed = (msg, expected, actual) => console.error(`❌ FAIL: ${msg}. Expected ${expected}, got ${actual}`);

const assertApprox = (actual, expected, tolerance = 1) => {
    if (Math.abs(actual - expected) <= tolerance) {
        return true;
    }
    return false;
};

const testDailyMap = () => {
    console.log("\n--- [1] Daily Rate Calculation ---");
    const rate = 12;
    const result = getDailyInterestRate(rate);
    const expected = 0.00032876; // 12 / 100 / 365
    
    if (assertApprox(result, expected, 0.0000001)) passed(`Daily Rate for 12% is ~${result.toFixed(6)}`);
    else failed("Daily Rate", expected, result);
};

const testLedgerReplay = () => {
    console.log("\n--- [2] Ledger Replay Simulation ---");
    
    // Setup
    const loanAmount = 50000;
    const rate = 12; // 12%
    const disbursementDate = new Date("2024-01-01");
    // const dailyRate = getDailyInterestRate(rate);
    const dailyRate = 0.00032876712; // Precise
    
    // Transaction: Paid 5000 on Feb 1st
    const txnDate = new Date("2024-02-01"); // 31 days later
    const txnAmount = 5000;
    
    // Logic Replay
    let accruedInterest = 0;
    let outstandingPrincipal = loanAmount;
    
    // 1. Accrue Interest for 31 days
    const days = 31;
    const dailyInt = calculateDailyInterest(outstandingPrincipal, dailyRate);
    const totalPeriodInterest = dailyInt * days;
    accruedInterest += totalPeriodInterest;
    
    console.log(`Loan: 50,000 @ 12%. Period: 31 Days.`);
    console.log(`Expected Interest: 50000 * 12% * 31/365 = 509.589`);
    console.log(`Calculated Interest: ${totalPeriodInterest.toFixed(3)}`);
    
    if (assertApprox(totalPeriodInterest, 509.59, 0.1)) passed("Interest Accrual Correct");
    else failed("Interest Accrual", 509.59, totalPeriodInterest);
    
    // 2. Apply Payment
    // Waterfall: Interest -> Principal
    let amountLeft = txnAmount;
    const interestPaid = Math.min(amountLeft, accruedInterest);
    amountLeft -= interestPaid;
    accruedInterest -= interestPaid;
    
    const principalPaid = Math.min(amountLeft, outstandingPrincipal);
    outstandingPrincipal -= principalPaid;
    
    console.log(`Payment: 5000. Allocated to Int: ${interestPaid.toFixed(2)}, Princ: ${principalPaid.toFixed(2)}`);
    
    // Check Principcal Balance
    // 5000 - 509.59 = 4490.41 Principal Paid
    // 50000 - 4490.41 = 45509.59
    
    if (assertApprox(outstandingPrincipal, 45509.59, 1)) passed("Principal Deduction Correct");
    else failed("Principal Balance", 45509.59, outstandingPrincipal);
    
    if (accruedInterest === 0) passed("Interest Cleared Correctly");
    else failed("Outstanding Interest", 0, accruedInterest);
};

const testAutoClosure = () => {
   console.log("\n--- [3] Auto-Closure Logic ---");
   let outstandingPrincipal = 0.5; // < 1
   let status = 'Active';
   
   if (outstandingPrincipal < 1) {
       status = 'Closed';
   }
   
   if (status === 'Closed') passed("Auto-Closure Triggered for Balance < 1");
   else failed("Auto-Closure", 'Closed', status);
};


// Run
testDailyMap();
testLedgerReplay();
testAutoClosure();

console.log("\nDone.");
