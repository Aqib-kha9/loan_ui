
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://aqib:aqib@cluster0.rwwbcqt.mongodb.net/";

const LoanSchema = new mongoose.Schema({
    loanId: String,
    transactions: [{}]
}, { strict: false });

const Loan = mongoose.model('LoanDebug', LoanSchema, 'loans');

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        const loans = await Loan.find({ loanId: 'LN-216933' });
        console.log(`Found ${loans.length} documents for LN-216933`);
        loans.forEach((l, i) => {
            console.log(`Doc ${i}: _id=${l._id} | Txns=${l.transactions?.length || 0} | Principal=${l.currentPrincipal}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
run();
