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
import { ArrowLeft, Printer, Download, IndianRupee, Calendar, User, Phone, MapPin, Receipt, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
            <div className="flex flex-col items-center justify-center h-full w-full space-y-4">
                <h2 className="text-xl font-bold text-muted-foreground">Loan Not Found</h2>
                <Button asChild variant="outline">
                    <Link href="/loans">Return to Portfolio</Link>
                </Button>
            </div>
        );
    }

    // Ledger Calculation (On-screen view logic)
    const ledgerEntries = generateLedger(loan);

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
        sanctionDate: (loan as any).disbursedDate || new Date().toISOString(), // Fallback
        loanAmount: loan.totalLoanAmount.toString(),
        interestRate: loan.interestRate + "%",
        interestPaidInAdvance: (loan as any).interestPaidInAdvance, // Fix Type Error
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
        <div className="-m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] h-[calc(100vh-5rem)] bg-muted/10 flex flex-col overflow-hidden">

            {/* === 1. STICKY HEADER === */}
            <div className="h-13 md:h-14 border-b border-border/50 flex items-center justify-between px-4 bg-white/95 backdrop-blur-xl shrink-0 dark:bg-zinc-950/95 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-1 text-muted-foreground hover:text-foreground" asChild>
                        <Link href="/loans">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold leading-none tracking-tight">{loan.customerName}</h1>
                            <Badge variant={loan.status === 'Active' ? 'default' : 'secondary'} className="text-[9px] h-4 px-1 rounded-sm uppercase tracking-wider">
                                {loan.status}
                            </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{loan.loanNumber} • {loan.loanType}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-semibold hidden sm:flex" onClick={() => handlePrint()}>
                        <Printer className="h-3.5 w-3.5" /> Print
                    </Button>
                    <Link href={`/?loan=${loan.loanNumber}`}>
                        <Button size="sm" className="h-8 gap-2 text-xs font-bold shadow-md shadow-primary/20">
                            <Receipt className="h-3.5 w-3.5" /> Take Payment
                        </Button>
                    </Link>
                </div>
            </div>

            {/* === 2. SCROLLABLE CONTENT === */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="p-4 rounded-xl border bg-white dark:bg-zinc-900 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <IndianRupee className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Principal</p>
                        <p className="text-lg font-bold mt-0.5">₹{loan.totalLoanAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-white dark:bg-zinc-900 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Receipt className="h-8 w-8 text-emerald-600" />
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Paid</p>
                        <p className="text-lg font-bold mt-0.5 text-emerald-600">₹{totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-white dark:bg-zinc-900 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Next EMI</p>
                        <p className="text-lg font-bold mt-0.5 text-blue-600">
                            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl border bg-white dark:bg-zinc-900 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <User className="h-8 w-8 text-orange-600" />
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Balance</p>
                        <p className="text-lg font-bold mt-0.5 text-orange-600">₹{closingBalance.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Ledger Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="rounded-xl border bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b bg-muted/5 flex items-center justify-between">
                                <h3 className="text-sm font-semibold">Transaction History</h3>
                                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground gap-1">
                                    <Download className="h-3 w-3" /> Export CSV
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/5 hover:bg-muted/5">
                                            <TableHead className="w-[100px] text-[10px] uppercase tracking-wider font-bold h-9">Date</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-wider font-bold h-9">Particulars</TableHead>
                                            <TableHead className="text-right text-[10px] uppercase tracking-wider font-bold h-9">Debit</TableHead>
                                            <TableHead className="text-right text-[10px] uppercase tracking-wider font-bold h-9">Credit</TableHead>
                                            <TableHead className="text-right text-[10px] uppercase tracking-wider font-bold h-9">Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ledgerEntries.map((entry, index) => (
                                            <TableRow key={index} className="hover:bg-muted/5 text-xs group">
                                                <TableCell className="font-mono text-muted-foreground h-10 py-1">{new Date(entry.date).toLocaleDateString('en-GB')}</TableCell>
                                                <TableCell className="font-medium h-10 py-1">
                                                    <div className="flex flex-col">
                                                        <span>{entry.particulars}</span>
                                                        <span className="text-[9px] text-muted-foreground font-mono">{entry.refNo !== '-' ? entry.refNo : ''}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right h-10 py-1 text-red-600 font-mono">
                                                    {entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : '-'}
                                                </TableCell>
                                                <TableCell className="text-right h-10 py-1 text-emerald-600 font-mono">
                                                    {entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : '-'}
                                                </TableCell>
                                                <TableCell className="text-right h-10 py-1 font-mono font-semibold">
                                                    ₹{entry.balance.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Details */}
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-white dark:bg-zinc-900 shadow-sm p-4">
                            <h3 className="text-sm font-semibold mb-3 border-b pb-2">Customer Details</h3>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold">{loan.customerName}</p>
                                        <p className="text-[10px] text-muted-foreground">ID: CUST-{id}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold">{loan.mobile}</p>
                                        <p className="text-[10px] text-muted-foreground">Primary Contact</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-wrap break-words w-full">{loan.address}</p>
                                        <p className="text-[10px] text-muted-foreground">Billing Address</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hidden Print Component */}
                <div className="overflow-hidden h-0 w-0 absolute opacity-0 pointer-events-none">
                    <div ref={componentRef}>
                        {StatementComponent && (
                            <StatementComponent
                                data={statementData}
                                company={companySettings}
                            />
                        )}
                    </div>
                </div>

                {/* Bottom Spacer */}
                <div className="h-12 md:hidden"></div>
            </div>
        </div>
    );
}
