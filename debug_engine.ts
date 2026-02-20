
import dbConnect from './src/lib/db';
import { recalculateLedger } from './src/lib/loan-engine';
import Loan from './src/lib/models/Loan';
import dotenv from 'dotenv';

dotenv.config();

async function debug() {
    console.log("Connecting to DB...");
    await dbConnect();
    const loanId = "LN-216933";
    console.log(`Debugging loan: ${loanId}`);
    
    const loan = await Loan.findOne({ loanId });
    if (!loan) {
        console.error("Loan not found in DB");
        return;
    }
    
    console.log("\n--- DB STATE ---");
    console.log(`Loan Amount: ${loan.loanAmount}`);
    console.log(`Current Principal (DB): ${loan.currentPrincipal}`);
    console.log(`Accumulated Interest (DB): ${loan.accumulatedInterest}`);
    console.log(`Transactions: ${loan.transactions.length}`);
    
    // Print transactions to verify date parsing
    loan.transactions.forEach((t: any, i: number) => {
        console.log(`  [${i}] ${t.date.toISOString()} - Amt: ${t.amount} - Type: ${t.type} - PrinComp: ${t.principalComponent} - IntComp: ${t.interestComponent}`);
    });

    const targetDate = new Date(); // Use current date for "today's" dues
    console.log(`\n--- REPLAYING ENGINE (targetDate: ${targetDate.toISOString()}) ---`);
    
    // We use persist=false to avoid affecting the DB
    const ledgerState = await recalculateLedger(loanId, targetDate, false);
    
    console.log("\n--- ENGINE RESULTS ---");
    console.log(`Final Outstanding Principal: ${ledgerState.outstandingPrincipal}`);
    console.log(`Final Accrued Interest: ${ledgerState.accruedInterest}`);
    console.log(`Total Paid Principal: ${ledgerState.totalPaidPrincipal}`);
    console.log(`Total Paid Interest: ${ledgerState.totalPaidInterest}`);
    
    console.log("\n--- VIRTUAL TRANSACTIONS (LEDGER) ---");
    ledgerState.virtualTransactions.forEach((txn: any, i: number) => {
        console.log(`  [${i}] ${new Date(txn.date).toISOString().split('T')[0]} - ${txn.particulars.padEnd(25)} - Bal: ${txn.balance.toString().padStart(8)} - PrinBal: ${txn.principalBalance.toString().padStart(8)} - IntBal: ${txn.interestBalance.toString().padStart(8)}`);
    });

    process.exit(0);
}

debug().catch(err => {
    console.error(err);
    process.exit(1);
});
