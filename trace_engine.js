
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://aqib:aqib@cluster0.rwwbcqt.mongodb.net/";
const { addMonths, isBefore, isAfter, isSameDay, differenceInDays } = require('date-fns');

const LoanSchema = new mongoose.Schema({}, { strict: false });
const Loan = mongoose.model('LoanDebug', LoanSchema, 'loans');

const getPeriodicInterestRate = (loan) => {
    let annualRate = loan.interestRate;
    if (loan.interestRateUnit === 'Monthly') annualRate *= 12;
    let ratePerPeriod = annualRate / 12; // Monthly only for this test
    return ratePerPeriod / 100;
};

async function run() {
    await mongoose.connect(MONGODB_URI);
    const loan = await Loan.findOne({ loanId: 'LN-216933' });
    
    console.log("--- STARTING TRACE ---");
    const targetDate = new Date();
    const transactions = (loan.transactions || [])
        .map((t) => ({ ...t, date: new Date(t.date) }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    let currentState = {
        outstandingPrincipal: loan.loanAmount,
        accruedInterest: 0,
    };
    
    console.log(`Initial Principal: ${currentState.outstandingPrincipal}`);

    const periodicRate = getPeriodicInterestRate(loan);
    console.log(`Periodic Rate: ${periodicRate}`);

    let cycleDates = [];
    let cycleCursor = new Date(loan.disbursementDate);
    cycleCursor = addMonths(cycleCursor, 1); // Standard post-paid

    while (!isAfter(cycleCursor, targetDate)) {
        cycleDates.push(new Date(cycleCursor));
        cycleCursor = addMonths(cycleCursor, 1);
    }

    const allEvents = [
        ...cycleDates.map(d => ({ date: d, type: 'CYCLE_INTEREST' })),
        ...transactions.map((t) => ({ ...t, type: 'TRANSACTION' }))
    ].sort((a, b) => {
        const tA = a.date.getTime();
        const tB = b.date.getTime();
        if (tA === tB) return a.type === 'CYCLE_INTEREST' ? -1 : 1;
        return tA - tB;
    });

    for (const event of allEvents) {
        if (isAfter(event.date, targetDate)) continue;

        console.log(`Event: ${event.type} | Date: ${event.date.toISOString().split('T')[0]}`);

        if (event.type === 'CYCLE_INTEREST') {
            let interestAmount = Math.round(currentState.outstandingPrincipal * periodicRate);
            if (loan.interestType === 'Flat') interestAmount = Math.round(loan.loanAmount * periodicRate);
            
            currentState.accruedInterest += interestAmount;
            console.log(`  + Interest Accrued: ${interestAmount} | Total Accrued: ${currentState.accruedInterest}`);
        } else {
            let amountLeft = event.amount;
            console.log(`  - Payment Received: ${amountLeft}`);
            
            let interestPaid = Math.min(amountLeft, currentState.accruedInterest);
            currentState.accruedInterest -= interestPaid;
            amountLeft -= interestPaid;
            console.log(`    Applied to Interest: ${interestPaid} | Accrued left: ${currentState.accruedInterest}`);

            let principalPaid = Math.min(amountLeft, currentState.outstandingPrincipal);
            currentState.outstandingPrincipal -= principalPaid;
            console.log(`    Applied to Principal: ${principalPaid} | Principal left: ${currentState.outstandingPrincipal}`);
        }
    }

    console.log("--- FINAL STATE ---");
    console.log(currentState);
    
    await mongoose.disconnect();
    process.exit(0);
}
run();
