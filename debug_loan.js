
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://aqib:aqib@cluster0.rwwbcqt.mongodb.net/";

const LoanSchema = new mongoose.Schema({
    loanId: String,
    loanAmount: Number,
    currentPrincipal: Number,
    accumulatedInterest: Number,
    transactions: [{
        date: Date,
        amount: Number,
        type: String,
        principalComponent: Number,
        interestComponent: Number
    }]
}, { strict: false });

const Loan = mongoose.model('LoanDebug', LoanSchema, 'loans');

async function run() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(MONGODB_URI);
        const loan = await Loan.findOne({ loanId: 'LN-216933' });
        if (!loan) {
            console.log("Loan LN-216933 not found");
        } else {
            console.log("=== LOAN DATA ===");
            console.log("Loan ID:", loan.loanId);
            console.log("Loan Amount:", loan.loanAmount);
            console.log("Current Principal:", loan.currentPrincipal);
            console.log("Accumulated Interest:", loan.accumulatedInterest);
            console.log("Transactions Count:", loan.transactions?.length || 0);
            if (loan.transactions) {
                loan.transactions.forEach((t, i) => {
                    console.log(`  [${i}] ${t.date?.toISOString()} - Amt: ${t.amount} - P: ${t.principalComponent} - I: ${t.interestComponent}`);
                });
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
run();
