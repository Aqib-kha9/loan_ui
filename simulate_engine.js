
const loan = {
    loanId: "LN-216933",
    loanAmount: 100000,
    interestRate: 10,
    interestRateUnit: "Monthly",
    repaymentFrequency: "Monthly",
    interestType: "Flat",
    loanScheme: "EMI",
    disbursementDate: new Date("2025-10-01"),
    transactions: [
        { date: new Date("2025-11-01"), amount: 18333, type: "EMI" },
        { date: new Date("2025-12-01"), amount: 18333, type: "EMI" },
        { date: new Date("2026-01-01"), amount: 18333, type: "EMI" },
        { date: new Date("2026-02-10"), amount: 18333, type: "EMI" }
    ]
};

const periodicRate = 0.10; // 10% monthly
const targetDate = new Date("2026-02-19");

let currentState = {
    outstandingPrincipal: loan.loanAmount,
    accruedInterest: 0,
};

const cycleDates = [
    new Date("2025-11-01"),
    new Date("2025-12-01"),
    new Date("2026-01-01"),
    new Date("2026-02-01")
];

const allEvents = [
    ...cycleDates.map(d => ({ date: d, type: 'CYCLE_INTEREST' })),
    ...loan.transactions.map(t => ({ ...t, type: 'TRANSACTION' }))
].sort((a, b) => {
    const tA = a.date.getTime();
    const tB = b.date.getTime();
    if (tA === tB) return a.type === 'CYCLE_INTEREST' ? -1 : 1;
    return tA - tB;
});

allEvents.forEach(event => {
    if (event.date > targetDate) return;
    console.log(`Event: ${event.type} on ${event.date.toISOString().split('T')[0]}`);
    if (event.type === 'CYCLE_INTEREST') {
        let interestAmount = Math.round(loan.loanAmount * periodicRate);
        currentState.accruedInterest += interestAmount;
        console.log(`  Interest Accrued: ${interestAmount} | Total Accrued: ${currentState.accruedInterest}`);
    } else {
        let amountLeft = event.amount;
        let interestPaid = Math.min(amountLeft, currentState.accruedInterest);
        currentState.accruedInterest -= interestPaid;
        amountLeft -= interestPaid;
        
        // --- THIS IS THE KEY PART ---
        let allowPrincipalReduction = true;
        if (loan.loanScheme === 'InterestOnly') {
             // ...
        } else {
             if (event.type === 'Interest') { // Wait! 'type' in recalculateLedger is event.type which is 'TRANSACTION'
                  // No, in recalculateLedger it is txn.type
             }
        }
        
        let principalPaid = Math.min(amountLeft, currentState.outstandingPrincipal);
        currentState.outstandingPrincipal -= principalPaid;
        console.log(`  Payment: ${event.amount} | Int Paid: ${interestPaid} | Prin Paid: ${principalPaid} | Prin Bal: ${currentState.outstandingPrincipal}`);
    }
});

console.log("Final Balances:", currentState);
