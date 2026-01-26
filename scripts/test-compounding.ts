
import { getPeriodicInterestRate, recalculateLedger } from '../src/lib/loan-engine';
import { differenceInDays, addMonths } from 'date-fns';
import mongoose from 'mongoose';
import Loan from '../src/lib/models/Loan';

// Mocking Mongoose Connection for Script
const TEST_DB = "mongodb+srv://admin:Admin123@cluster0.oasny.mongodb.net/loan_erp?retryWrites=true&w=majority&appName=Cluster0";

async function runTest() {
    console.log("Connectng to DB...");
    await mongoose.connect(TEST_DB);

    const loanId = "TEST-COMPOUNDING-" + Date.now();
    
    // Create Ashish Doshi Scenario
    const loan = new Loan({
        loanId: loanId,
        client: new mongoose.Types.ObjectId(), // Fake
        loanAmount: 95000,
        currentPrincipal: 95000,
        interestRate: 2,
        interestRateUnit: 'Monthly',
        repaymentFrequency: 'Monthly',
        interestType: 'Reducing',
        loanScheme: 'InterestOnly',
        disbursementDate: new Date('2021-06-16'),
        startDate: new Date('2021-06-16'),
        status: 'Active',
        transactions: [] // 0 Payments
    });

    await loan.save();
    console.log(`Created Loan ${loanId}`);

    // We need to simulate time passing by mocking 'today' or just letting the engine run
    // The current recalculateLedger uses 'new Date()' as the 'today' boundary. 
    // To test 2021 data, we might need to adjust the engine OR the dates.
    
    // For this test, I will temporarily modify the engine to process until a specific date 
    // OR just verify the MATH loop manually here.
    
    console.log("\n--- Verifying Compounding Math Loop ---");
    let principal = 95000;
    const rate = 0.02; // 2%
    
    for(let i=1; i<=3; i++) {
        const interest = Math.round(principal * rate);
        principal += interest;
        console.log(`Month ${i}: Interest=${interest}, New Principal=${principal}`);
    }

    // Now let's see what the REAL engine does.
    // Since the engine uses 'today', it will process many months from 2021 till today.
    // We expect the balance to be very high now.
    
    const state = await recalculateLedger(loanId);
    console.log(`\nEngine Result for today: ${state.outstandingPrincipal}`);

    // Cleanup
    await Loan.deleteOne({ loanId });
    await mongoose.disconnect();
}

runTest();
