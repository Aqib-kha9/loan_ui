
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://aqib:aqib@cluster0.rwwbcqt.mongodb.net/";

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const collection = db.collection('loans');
        const loan = await collection.findOne({ loanId: 'LN-216933' });
        if (loan && loan.transactions) {
            loan.transactions.forEach((t, i) => {
                console.log(`T[${i}]: ${t.date.toISOString()} | amt: ${t.amount}`);
            });
        }
        console.log("Current Principal in DB:", loan.currentPrincipal);
        console.log("Disbursal Date in DB:", loan.disbursementDate.toISOString());
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
run();
