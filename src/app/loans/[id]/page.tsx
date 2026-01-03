"use client";

import { useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useSettings } from "@/components/providers/settings-provider";
import { getTemplate } from "@/components/templates/registry";
import { getLoanDetails } from "@/lib/mock-data";
import { generateLedger } from "@/lib/ledger-utils";
import { ArrowLeft, Printer, Download, IndianRupee, Calendar, User, Phone, MapPin } from "lucide-react";

export default function LoanLedgerPage() {
    const params = useParams();
    const id = params.id as string;
    const loan = getLoanDetails(id);

    // Settings & Template Logic
    const { companySettings, printTemplate } = useSettings();
    const selectedTemplateConfig = getTemplate(printTemplate);
    const StatementComponent = selectedTemplateConfig?.statementComponent;

    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Ledger_${loan?.loanNumber || id}`,
    });

    if (!loan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold text-muted-foreground">Loan Not Found</h2>
                <Button asChild>
                    <Link href="/loans">Return to Portfolio</Link>
                </Button>
            </div>
        );
    }

    // Ledger Calculation (On-screen view logic)
    // Use centralized utility
    const ledgerEntries = generateLedger(loan);
    const displayEntries = ledgerEntries.map((entry, index) => ({
        id: entry.refNo === '-' ? `SYS-${index}` : entry.refNo || `TXN-${index}`,
        date: entry.date,
        particular: entry.particulars,
        type: entry.type,
        debit: entry.debit,
        credit: entry.credit,
        balance: entry.balance
    }));

    // Calculate Totals for Print
    const totalInterest = ledgerEntries.reduce((sum, t) => sum + (t.type === 'Interest' ? t.debit : 0), 0);
    const totalPaid = ledgerEntries.reduce((sum, t) => sum + t.credit, 0);
    const closingBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0;

    // Data Structure for the Print Template
    const statementData = {
        customerName: loan.customerName,
        loanAccountNo: loan.loanNumber,
        address: loan.address,
        mobile: loan.mobile,
        sanctionDate: loan.disbursedDate,
        loanAmount: loan.totalLoanAmount.toString(),
        interestRate: loan.interestRate + "%",
        interestPaidInAdvance: loan.interestPaidInAdvance,
        totalInterest,
        totalPaid,
        closingBalance,
        transactions: ledgerEntries.map(t => ({
            date: t.date,
            type: t.type,
            amount: t.credit > 0 ? t.credit : t.debit,
            isPayment: t.credit > 0,
            ref: t.refNo,
            refNo: t.refNo,
            principalComponent: t.principalComponent,
            interestComponent: t.interestComponent,
            penalty: 0,
            balanceAfter: t.balance
        }))
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            {/* Action Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="group" asChild>
                        <Link href="/loans">
                            <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold tracking-tight">{loan.customerName}</h2>
                            <Badge variant="outline" className="text-xs">{loan.status}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm font-mono mt-0.5">Loan A/c: {loan.loanNumber}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="hidden md:flex flex-col items-end mr-4 text-xs text-muted-foreground">
                        <span>Print Template:</span>
                        <span className="font-medium text-primary">{selectedTemplateConfig?.name}</span>
                    </div>
                    <Button variant="outline" onClick={() => handlePrint()}>
                        <Printer className="mr-2 h-4 w-4" /> Print Ledger
                    </Button>
                    <Button>
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </div>

            {/* Loan Overview Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/20 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex justify-between">
                            Total Principal
                            <Briefcase className="h-4 w-4 text-primary/50" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary flex items-center">
                            <IndianRupee className="h-6 w-6" />
                            {loan.totalLoanAmount.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Disbursed on {new Date(loan.disbursedDate).toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex justify-between">
                            Outstanding Balance
                            <IndianRupee className="h-4 w-4 text-muted-foreground/50" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600 flex items-center">
                            <IndianRupee className="h-6 w-6" />
                            {/* Mock calculation: Total - Paid EMIs */}
                            {(loan.totalLoanAmount - (loan.emisPaid * loan.emiAmount)).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {loan.tenureMonths - loan.emisPaid} EMIs remaining
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex justify-between">
                            Customer Info
                            <User className="h-4 w-4 text-muted-foreground/50" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {loan.mobile}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground truncate" title={loan.address}>
                            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                            {loan.address}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ledger Table Section */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Ledger Transactions</CardTitle>
                    <CardDescription>Detailed history of disbursals and repayments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[120px]">Date</TableHead>
                                <TableHead>Particulars</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right text-emerald-600">Credit (In)</TableHead>
                                <TableHead className="text-right text-red-600">Debit (Out)</TableHead>
                                <TableHead className="text-right font-bold w-[150px]">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayEntries.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-medium text-xs font-mono">{new Date(entry.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="font-medium text-sm">{entry.particular}</div>
                                        {entry.type !== 'Disbursal' && entry.type !== 'Interest' && <div className="text-[10px] text-muted-foreground font-mono">Ref: {entry.id}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] font-normal">{entry.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-medium text-emerald-600">
                                        {entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-medium text-red-600">
                                        {entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-bold font-mono">
                                        ₹{entry.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* HIDDEN PRINT COMPONENT */}
            <div className="hidden">
                {StatementComponent && statementData && (
                    <div ref={componentRef}>
                        <StatementComponent
                            data={statementData}
                            company={companySettings}
                        />
                        {/* Optional Footer matching /statements */}
                        <div className="hidden print:block mt-8 text-center text-[10px] text-muted-foreground print:text-black/50">
                            <p>Generated via FinCorp ERP • {new Date().toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Icon for cards
function Briefcase({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
}
