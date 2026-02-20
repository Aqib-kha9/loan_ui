
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://aqib:aqib@cluster0.rwwbcqt.mongodb.net/";

const LoanSchema = new mongoose.Schema({}, { strict: false });
const Loan = mongoose.model('LoanDebug', LoanSchema, 'loans');

const { addMonths, isBefore, isAfter, isSameDay, differenceInDays } = require('date-fns');

// Replicate logic from dues/route.ts and loan-engine.ts
async function run() {
    await mongoose.connect(MONGODB_URI);
    const loanId = "LN-216933";
    const targetDate = new Date("2026-02-19"); // Default today in UI

    console.log(`Simulating Dues API for ${loanId} as of ${targetDate.toISOString()}`);

    // Fetch loan twice as the API and Engine do
    const loanFromAPI = await Loan.findOne({ loanId });
    const loanFromEngine = await Loan.findOne({ loanId });

    // Engine logic (Simplified but reflecting the core)
    let currentState = {
        outstandingPrincipal: loanFromEngine.loanAmount,
        accruedInterest: 0,
    };

    const periodicRate = 0.1; // Hand-verified for this loan

    let cycleCursor = new Date(loanFromEngine.disbursementDate);
    let cycleDates = [];
    cycleCursor = addMonths(cycleCursor, 1);
    while (!isAfter(cycleCursor, targetDate)) {
        cycleDates.push(new Date(cycleCursor));
        cycleCursor = addMonths(cycleCursor, 1);
    }

    const transactions = (loanFromEngine.transactions || [])
        .map(t => ({ ...t, date: new Date(t.date) }))
        .sort((a,b) => a.date.getTime() - b.date.getTime());

    const allEvents = [
        ...cycleDates.map(d => ({ date: d, type: 'CYCLE' })),
        ...transactions.map(t => ({ ...t, type: 'TXN' }))
    ].sort((a,b) => {
        const tA = a.date.getTime();
        const tB = b.date.getTime();
        if (tA === tB) return a.type === 'CYCLE' ? -1 : 1;
        return tA - tB;
    });

    for (const event of allEvents) {
        if (isAfter(event.date, targetDate)) {
            console.log(`Skipping event on ${event.date.toISOString()} (After ${targetDate.toISOString()})`);
            continue;
        }

        if (event.type === 'CYCLE') {
            currentState.accruedInterest += Math.round(loanFromEngine.loanAmount * periodicRate);
        } else {
            let amt = event.amount;
            let iPaid = Math.min(amt, currentState.accruedInterest);
            currentState.accruedInterest -= iPaid;
            amt -= iPaid;
            let pPaid = Math.min(amt, currentState.outstandingPrincipal);
            currentState.outstandingPrincipal -= pPaid;
        }
    }

    console.log("Resulting Principal:", currentState.outstandingPrincipal);
    console.log("Resulting Accrued Interest:", currentState.accruedInterest);

    await mongoose.disconnect();
    process.exit(0);
}
run();
