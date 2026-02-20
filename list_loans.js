
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://aqib:aqib@cluster0.rwwbcqt.mongodb.net/";

const LoanSchema = new mongoose.Schema({
    loanId: String,
    loanAmount: Number,
    transactions: [{}],
    "client": { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }
}, { strict: false });

const ClientSchema = new mongoose.Schema({ firstName: String, lastName: String }, { strict: false });
mongoose.model('Client', ClientSchema);

const Loan = mongoose.model('LoanDebug', LoanSchema, 'loans');

async function run() {
    try {
        console.log("Connecting to DB...");
        // Explicitly specify 'loanerp' or similar if known, but let's see what the default is first.
        // Usually it's in the URI. Since it's missing, let's try to list databases.
        const conn = await mongoose.connect(MONGODB_URI);
        const db = conn.connection.db;
        
        console.log("Current DB Name:", conn.connection.name);
        
        const loans = await Loan.find({}).populate('client').limit(10);
        console.log(`Found ${loans.length} loans`);
        loans.forEach(l => {
            const clientName = l.client ? `${l.client.firstName} ${l.client.lastName}` : "Unknown";
            console.log(`LoanId: ${l.loanId} | Client: ${clientName} | Amt: ${l.loanAmount} | Txns: ${l.transactions?.length || 0}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
run();
