
const mongoose = require('mongoose');

// Mock specific logic from src/app/api/loans/route.ts
// We want to verify what "Loan.create" receives.

// Mock Schema - minimal for testing
const LoanSchema = new mongoose.Schema({
    loanId: String,
    loanAmount: Number, // The field in question
    netDisbursal: Number,
    totalInterest: Number,
    interestPaidInAdvance: Boolean,
    loanScheme: String
});

const Loan = mongoose.model('LoanTest', LoanSchema);

async function runTest() {
    try {
        await mongoose.connect('mongodb://localhost:27017/loanerp_test', { 
            serverSelectionTimeoutMS: 5000 
        });
        console.log('Connected to DB');

        // --- SIMULATE CONTROLLER LOGIC ---
        
        // INPUTS
        const loanAmountInput = "100000";
        const interestRateInput = "12"; // 12% Yearly
        const tenureMonthsInput = "12";
        const loanScheme = "InterestOnly";
        const interestPaidInAdvance = true;
        
        // LOGIC START
        const P = parseFloat(loanAmountInput);
        const R = parseFloat(interestRateInput);
        const N = parseFloat(tenureMonthsInput);
        
        let annualRate = R;        
        const frequencyDivisor = 12; // Monthly
        const periodicRate = annualRate / frequencyDivisor / 100;
        
        const numberOfInstallments = N; 
        
        let emi = 0;
        let totalInterest = 0;
        let firstMonthInterest = 0;
        
        if (loanScheme === "InterestOnly") {
             // 100000 * (12/12/100) = 1000
             firstMonthInterest = P * periodicRate;
             emi = firstMonthInterest;
             
             totalInterest = firstMonthInterest * numberOfInstallments;
             // 1000 * 12 = 12000
        }
        
        // Processing Fee
        const PF_Percent = 0;
        let processingFeeAmount = (P * PF_Percent) / 100;
        let netDisbursal = P - processingFeeAmount; // 100000
        
        // Advance Interest Logic
        if (loanScheme === "InterestOnly" && interestPaidInAdvance) {
            netDisbursal -= firstMonthInterest;
            // 100000 - 1000 = 99000
        }
        
        // User claims: "Loan Amount 1 lakh, Int 10000 advance"
        // If Int is 10000, that means Rate/Princ are different, but let's test the VARIABLE assignment.
        
        console.log("--- CALCULATION RESULTS ---");
        console.log("Input P (Loan Amount):", P);
        console.log("Calculated First Month Interest:", firstMonthInterest);
        console.log("Calculated Net Disbursal:", netDisbursal);
        
        // CREATE PAYLOAD
        const loanPayload = {
            loanId: "LN-TEST-001",
            loanAmount: P, // <--- THIS is what we expect to be 100,000
            netDisbursal: netDisbursal, // <--- THIS should be (P - Int)
            totalInterest: totalInterest,
            interestPaidInAdvance: !!interestPaidInAdvance,
            loanScheme: loanScheme
        };
        
        console.log("--- MONGODB PAYLOAD ---");
        console.log(JSON.stringify(loanPayload, null, 2));
        
        // SAVE
        const newLoan = await Loan.create(loanPayload);
        console.log("--- SAVED DOCUMENT ---");
        console.log(newLoan);
        
        console.log("\nVERDICT:");
        if (newLoan.loanAmount === P) {
            console.log("✅ SUCCESS: Loan Amount preserved as Principal (" + P + ")");
        } else {
            console.log("❌ FAILURE: Loan Amount mutated to " + newLoan.loanAmount);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
