
import { calculateDailyInterest, getDailyInterestRate } from '../src/lib/loan-engine';
import { differenceInDays, addDays } from 'date-fns';

console.log("Starting Loan Engine Verification...");

// --- Mocks & Utilities ---
const passed = (msg: string) => console.log(`✅ PASS: ${msg}`);
const failed = (msg: string, expected: any, actual: any) => console.error(`❌ FAIL: ${msg}. Expected ${expected}, got ${actual}`);

const assertApprox = (actual: number, expected: number, tolerance = 1) => {
    if (Math.abs(actual - expected) <= tolerance) {
        return true;
    }
    return false;
};

// --- Test Suite ---

const testDailyInterestCalculation = () => {
    console.log("\n--- Testing Daily Interest Calculation ---");
    
    const principal = 100000;
    const annualRate = 12; // 12%
    const dailyRate = getDailyInterestRate(annualRate);
    
    if (assertApprox(dailyRate, 0.00032876, 0.00000001)) passed("Daily Rate Conversion");
    else failed("Daily Rate Conversion", 0.00032876, dailyRate);

    const oneDayInterest = calculateDailyInterest(principal, dailyRate);
    // 100000 * 12% / 365 = 32.876
    if (assertApprox(oneDayInterest, 32.88, 0.1)) passed("One Day Interest Calculation");
    else failed("One Day Interest", 32.88, oneDayInterest);
};

// Mocking the behavior of recalculateLedger is complex without a DB.
// We will test the LOGIC core, assuming the DB interactions work (which relies on Mongoose).
// Ideally, we'd fire up a test DB, but for a quick script, let's verify the core math functions
// that the engine uses.

// To truly test recalculateLedger automatically via script without a running DB is hard.
// However, we can simulate the "Replay Loop" logic here to verify the math sequence.

const simulateLedgerReplay = () => {
    console.log("\n--- Testing Ledger Replay Logic (Simulation) ---");
    
    // Scenario: 
    // Loan: 10,000, 12% Flat, Disbursed 1 Jan 2024.
    // Txn 1: 1 Feb 2024 (31 days). Payment 2000.
    
    const loanAmount = 10000;
    const rate = 12;
    const disbursementDate = new Date('2024-01-01');
    const type = 'Flat';
    
    // Initial State
    let state = {
        date: disbursementDate,
        outstandingPrincipal: loanAmount,
        accruedInterest: 0,
        totalPaidPrincipal: 0,
        totalPaidInterest: 0
    };
    
    const transactions = [
        { date: new Date('2024-02-01'), amount: 2000 }
    ];
    
    const dailyRate = getDailyInterestRate(rate); // 0.000328..
    let lastDate = state.date;
    
    for (const txn of transactions) {
        const days = differenceInDays(txn.date, lastDate);
        // Interest on 10000 for 31 days (Flat)
        const interest = calculateDailyInterest(loanAmount, dailyRate) * days; 
        state.accruedInterest += interest;
        
        let amountLeft = txn.amount;
        
        // Pay Interest
        const intPaid = Math.min(amountLeft, state.accruedInterest);
        state.accruedInterest -= intPaid;
        state.totalPaidInterest += intPaid;
        amountLeft -= intPaid;
        
        // Pay Principal
        const prinPaid = Math.min(amountLeft, state.outstandingPrincipal);
        state.outstandingPrincipal -= prinPaid;
        state.totalPaidPrincipal += prinPaid;
        
        lastDate = txn.date;
    }
    
    // Expected:
    // Interest 31 days: 10000 * 12% * 31/365 = ~101.9
    // Payment 2000.
    // Interest Paid: 101.9
    // Principal Paid: 1898.1
    // Balance: 8101.9
    
    const expectedInterest = (10000 * 0.12 * 31) / 365;
    
    if (assertApprox(state.totalPaidInterest, expectedInterest, 1)) passed(`Ledger Replay Interest Paid. Got ${state.totalPaidInterest.toFixed(2)}`);
    else failed("Ledger Replay Interest", expectedInterest, state.totalPaidInterest);
    
    if (assertApprox(state.outstandingPrincipal, 10000 - (2000 - expectedInterest), 1)) passed(`Ledger Replay Principal Balance. Got ${state.outstandingPrincipal.toFixed(2)}`);
    else failed("Ledger Replay Balance", 10000 - (2000 - expectedInterest), state.outstandingPrincipal);

};


testDailyInterestCalculation();
simulateLedgerReplay();

console.log("\nVerification Complete.");
