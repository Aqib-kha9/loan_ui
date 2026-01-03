import { LoanAccount, Transaction } from "./mock-data";
import { addMonths, isSameMonth, parseISO, format, differenceInMonths, startOfMonth } from "date-fns";

export interface LedgerEntry {
    date: string;
    particulars: string;
    type: "Disbursal" | "Interest" | "EMI" | "Penalty" | "Closing";
    debit: number;  // Out (Charges, Disbursal)
    credit: number; // In (Payments)
    balance: number;
    refNo?: string;
    principalComponent?: number;
    interestComponent?: number;
}

export function calculateLedger(loan: LoanAccount): LedgerEntry[] {
    const entries: LedgerEntry[] = [];
    
    // 1. Initial Disbursal
    let currentBalance = loan.totalLoanAmount;
    const disbursalDate = parseISO(loan.disbursedDate);
    
    entries.push({
        date: loan.disbursedDate,
        particulars: "Loan Amount Disbursed",
        type: "Disbursal",
        debit: currentBalance,
        credit: 0,
        balance: currentBalance,
        refNo: "-"
    });

    // 2. Iterate month by month until today (or loan closure)
    let currentDate = addMonths(disbursalDate, 1); // First interest cycle starts 1 month after disbursal
    const today = new Date();
    
    // Limit loop to a reasonable future date or today
    while (currentDate <= addMonths(today, 1)) { 
        // A. Calculate Monthly Interest on Opening Balance
        // Logic: Rate is Monthly (e.g., 2% per month)
        // If Rate is Yearly in data (e.g. 24%), convert to monthly
        // We typically assume input is standardized. Let's assume input 'interestRate' is Yearly for now unless specified.
        // User said 10% in Excel image, looked like monthly. 
        // Let's treat loan.interestRate as Annual by default usually, but user specific case might be monthly.
        // However, standard banking is Annual / 12. 
        // If user said "Yearly" in form, we divide by 12.
        
        // FOR NOW: Standard logic: Rate / 12 / 100 * Balance
        const monthlyRate = (loan.interestRate / 12) / 100;
        const interestAmount = currentBalance * monthlyRate;

        // B. Check for payments in this month
        const monthlyTransactions = loan.transactions.filter(t => 
            isSameMonth(parseISO(t.date), currentDate) && t.type !== 'Fee' // Fees typically separate
        );

        let totalPaymentThisMonth = 0;
        monthlyTransactions.forEach(txn => {
            totalPaymentThisMonth += txn.amount;
        });

        const payment = totalPaymentThisMonth;
        
        // C. Apply Excel Logic: 
        // New Balance = Old Balance + Interest - Payment
        // If Payment == 0, then New Balance = Old Balance + Interest (Capitalization)
        
        // Record Interest Entry (Debit)
        // In user's excel, "Interest Received" column implies logic.
        // But for a statement, we debit Interest.
        
        currentBalance = currentBalance + interestAmount;
        
        entries.push({
            date: format(currentDate, "yyyy-MM-dd"), // e.g., 2024-02-15
            particulars: `Interest Capitalized (@${(loan.interestRate/12).toFixed(2)}%)`,
            type: "Interest",
            debit: interestAmount,
            credit: 0,
            balance: currentBalance,
            refNo: "-"
        });

        // Record Payment Entry (Credit)
        if (payment > 0) {
           currentBalance = currentBalance - payment;
           
           // We can assume the first txn ref for simplicity if multiple, or list them separately.
           // For better detail, let's push individual payment entries
           monthlyTransactions.forEach(txn => {
               entries.push({
                   date: txn.date,
                   particulars: `Payment Received (${txn.type})`,
                   type: "EMI",
                   debit: 0,
                   credit: txn.amount,
                   balance: currentBalance, // Technically balance drops after each, but simplified here
                   refNo: txn.refNo || txn.id,
                   principalComponent: txn.amount - interestAmount, // Rough approx
                   interestComponent: interestAmount
               });
           });
           
           // Correcting balance for exact flow:
           // If we pushed multiple payments, we should have reduced balance step-by-step.
           // Since we did bulk deduction above, let's stick to bulk or refine. 
           // Let's Refine loop for transaction accuracy.
        } else {
             // No Payment - Balance remains assumed 'Capitalized'
        }

        currentDate = addMonths(currentDate, 1);
        
        // Safety break
        if (currentBalance <= 0) break;
    }

    return entries;
}

// Refined Version to handle multiple transactions properly
export function generateLedger(loan: LoanAccount): LedgerEntry[] {
    const entries: LedgerEntry[] = [];
    let balance = loan.totalLoanAmount;
    
    // 1. Disbursal
    entries.push({
        date: loan.disbursedDate,
        particulars: "Loan Amount Disbursed",
        type: "Disbursal",
        debit: loan.totalLoanAmount,
        credit: 0,
        balance: balance,
        refNo: "-"
    });

    const startDate = parseISO(loan.disbursedDate);
    const today = new Date();
    let iteratorDate = addMonths(startDate, 1);

    // Sort transactions by date
    const allTransactions = [...loan.transactions].sort((a,b) => a.date.localeCompare(b.date));

    // Limit the loop:
    // 1. Until balance is zero (Loan Closed)
    // OR
    // 2. Until current date (Don't project future interest in a statement)
    while (iteratorDate <= today && balance > 0) {
         // Interest Date (e.g. 15th of month)
         const interestDateStr = format(iteratorDate, "yyyy-MM-dd");
         
         // 2. Charge Interest
         // Standard: Annual Rate / 12
         // Todo: If user wants specific monthly int input, we need that flag. Assuming Annual for now.
         const monthlyRate = (loan.interestRate / 12) / 100;
         const interestAmount = Math.round(balance * monthlyRate); // Rounding for clean numbers
         
         balance += interestAmount;

         entries.push({
             date: interestDateStr,
             particulars: `Interest Applied`,
             type: "Interest",
             debit: interestAmount,
             credit: 0,
             balance: balance,
             interestComponent: interestAmount
         });

         // 3. Find payments in this cycle (e.g. same month matches)
         // Matches if Month and Year are same as iteratorDate
         const cycleTxns = allTransactions.filter(t => isSameMonth(parseISO(t.date), iteratorDate));
         
         for (const txn of cycleTxns) {
             balance -= txn.amount;
             
             // Principal Comp = Paid - Interest (simplified)
             // Actually, since interest is already added to balance, the entire payment reduces balance.
             // But for reporting "how much was principal", it is Payment - Interest accrued.
             const princComp = txn.amount - interestAmount;
             
             entries.push({
                 date: txn.date,
                 particulars: `Payment Received (${txn.type})`,
                 type: "EMI",
                 debit: 0,
                 credit: txn.amount,
                 balance: balance,
                 refNo: txn.refNo || txn.id,
                 interestComponent: interestAmount, // Showing what it covered
                 principalComponent: princComp
             });
         }

         iteratorDate = addMonths(iteratorDate, 1);
         
         // Break if too far in future
         if (differenceInMonths(iteratorDate, today) > 6 && balance <= 0) break;
         if (differenceInMonths(iteratorDate, today) > 60) break; // Hard limit 5 years
    }
    
    return entries;
}
