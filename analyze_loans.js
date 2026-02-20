
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://aqib:aqib@cluster0.rwwbcqt.mongodb.net/";

const LoanSchema = new mongoose.Schema({
    loanId: String,
    transactions: [{}],
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }
}, { strict: false });

const ClientSchema = new mongoose.Schema({ firstName: String, lastName: String }, { strict: false });
mongoose.model('Client', ClientSchema);

const Loan = mongoose.model('LoanDebug', LoanSchema, 'loans');

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        const loans = await Loan.find({}).populate('client');
        console.log(`LoanId | Client | Txns`);
        console.log(`------------------------`);
        loans.forEach(l => {
            const name = l.client ? `${l.client.firstName} ${l.client.lastName}` : "Unknown";
            console.log(`${l.loanId.padEnd(10)} | ${name.padEnd(20)} | ${l.transactions?.length || 0}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
run();
