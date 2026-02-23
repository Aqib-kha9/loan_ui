"use client";

import { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { generateLedger, LedgerEntry } from "@/lib/ledger-utils";
import { mapLoanToFrontend } from "@/lib/mapper";
import { LoanAccount } from "@/lib/mock-data";
import { ArrowLeft, Download, IndianRupee, Calendar, User, Phone, MapPin, Receipt, Loader2, Trash2, Printer, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { PERMISSIONS } from "@/lib/constants/permissions";
import AccessDenied from "@/components/auth/access-denied";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { useSettings } from "@/components/providers/settings-provider";
import { DisbursementReceipt } from "@/components/templates/DisbursementReceipt";

export default function LoanLedgerPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    // State
    const [loan, setLoan] = useState<LoanAccount | null>(null); // Type updated
    const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [revertTxnTarget, setRevertTxnTarget] = useState<any>(null);
    const [isReverting, setIsReverting] = useState(false);
    const { checkPermission, isLoading: isAuthLoading } = useAuth();
    const { companySettings } = useSettings();
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrintReceipt = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: `Disbursement_Receipt_${id}`,
        pageStyle: `
            @page {
                size: A4;
                margin: 0mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                }
            }
        `
    });

    // Fetch Loan Data & Statement
    useEffect(() => {
        const fetchLoanAndLedger = async () => {
            try {
                // 1. Fetch Loan Details
                const res = await fetch(`/api/loans/${id}`);
                const data = await res.json();

                if (data.success) {
                    const mappedLoan = mapLoanToFrontend(data.loan);
                    setLoan(mappedLoan);

                    // 2. Fetch Unified Statement (Ledger)
                    // We use the loanNumber from the mapped loan to be safe, or just the ID if API supports it.
                    // The Statement API route is /api/loans/[id]/statement. 
                    // Let's use the ID from params which is what the loop uses.
                    const statementRes = await fetch(`/api/loans/${id}/statement`);
                    const statementData = await statementRes.json();

                    if (statementData.success && statementData.statement) {
                        // Map API Ledger to Frontend LedgerEntry
                        // API Entry: { date, particulars, debit, credit, balance, ... }
                        // Frontend expects: { date, particulars, debit, credit, balance, refNo, ... }
                        const apiLedger = statementData.statement.ledger.map((t: any) => ({
                            date: t.date,
                            particulars: t.particulars,
                            refNo: t.refNo || t.ref || '-',
                            txnId: t.txnId,
                            debit: t.debit,
                            credit: t.credit,
                            balance: t.balance,
                            type: t.type,
                            principalComponent: t.principalComponent,
                            interestComponent: t.interestComponent,
                            principalBalance: t.principalBalance,
                            interestBalance: t.interestBalance,
                            isPayment: t.isPayment
                        }));
                        setLedgerEntries(apiLedger);
                    } else {
                        // Fallback or Empty?
                        setLedgerEntries([]);
                        console.warn("Could not load unified ledger.");
                    }

                } else {
                    toast.error(data.error || "Failed to load loan details");
                }
            } catch (error) {
                console.error("Error fetching loan:", error);
                toast.error("Error loading loan details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchLoanAndLedger();
        }
    }, [id]);

    if (isAuthLoading) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (!checkPermission(PERMISSIONS.VIEW_LOANS)) {
        return <AccessDenied message="You do not have permission to view loan details." />;
    }

    // Fetch Loan Data

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this loan? This action cannot be undone.")) return;

        try {
            const toastId = toast.loading("Deleting loan...");
            const res = await fetch(`/api/loans/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                toast.success("Loan deleted successfully", { id: toastId });
                router.push('/loans');
            } else {
                toast.error(data.error || "Failed to delete loan", { id: toastId });
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("An error occurred while deleting the loan");
        }
    };

    const handleRevertPayment = async () => {
        if (!revertTxnTarget || !loan) return;
        setIsReverting(true);
        const toastId = toast.loading("Reverting transaction...");
        try {
            const res = await fetch(`/api/payments/revert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loanNumber: loan.loanNumber, txnId: revertTxnTarget.txnId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message || "Payment reverted successfully", { id: toastId });
                setRevertTxnTarget(null);
                window.location.reload();
            } else {
                toast.error(data.error || "Failed to revert payment", { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred", { id: toastId });
        } finally {
            setIsReverting(false);
        }
    };

    const handleExportCSV = () => {
        if (!ledgerEntries.length || !loan) return;

        const headers = ["Date", "Particulars", "Ref No", "Debit", "Credit", "Balance"];
        const rows = ledgerEntries.map(entry => [
            new Date(entry.date).toLocaleDateString("en-GB"), // DD/MM/YYYY
            `"${entry.particulars}"`, // Quote to handle commas
            entry.refNo,
            entry.debit > 0 ? entry.debit : 0,
            entry.credit > 0 ? entry.credit : 0,
            entry.balance
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `LoanLedger_${loan.loanNumber}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground mt-2">Loading ledger...</p>
            </div>
        );
    }

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

    // Calculate Totals for Print
    const totalInterest = ledgerEntries.reduce((sum, t) => sum + (t.type === 'Interest' ? t.debit : 0), 0);
    const totalPaid = ledgerEntries.reduce((sum, t) => sum + t.credit, 0);
    const closingBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0;

    // Use mapped fields directly
    const customerName = loan.customerName;

    // Data Structure for the Print Template
    const statementData = {
        customerName: loan.customerName,
        loanAccountNo: loan.loanNumber,
        address: loan.address,
        mobile: loan.mobile,
        sanctionDate: (loan as any).disbursedDate || new Date().toISOString(),
        loanAmount: loan.totalLoanAmount.toString(),
        interestRate: loan.interestRate + "%",
        interestPaidInAdvance: !!loan.interestPaidInAdvance,
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
                            <Badge variant={(loan.status as string)?.toLowerCase() === 'active' ? 'default' : 'secondary'} className="text-[9px] h-4 px-1 rounded-sm uppercase tracking-wider">
                                {loan.status || 'Active'}
                            </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{loan.loanNumber} • {loan.loanType}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 text-xs font-bold"
                        onClick={() => handlePrintReceipt()}
                    >
                        <Printer className="h-3.5 w-3.5" /> Receipt
                    </Button>

                    {/* Add Payment Generic Link - Protected */}
                    {checkPermission(PERMISSIONS.CREATE_PAYMENT) && (
                        <Link href={`/?loan=${loan.loanNumber}`}>
                            <Button size="sm" className="h-8 gap-2 text-xs font-bold shadow-md shadow-primary/20">
                                <Receipt className="h-3.5 w-3.5" /> Take Payment
                            </Button>
                        </Link>
                    )}

                    {/* Delete Loan Button - Protected */}
                    {checkPermission(PERMISSIONS.DELETE_LOAN) && (
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 ml-2 shadow-sm"
                            onClick={handleDelete}
                            title="Delete Loan"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
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
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Outstanding Principal</p>
                        {/* Calculate derived principal from ledger to ensure consistency */}
                        <p className="text-lg font-bold mt-0.5">
                            ₹{(loan.totalLoanAmount - ledgerEntries.reduce((sum, t) => sum + (t.principalComponent || 0), 0)).toLocaleString()}
                        </p>
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
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Accrued Interest</p>
                        <p className="text-lg font-bold mt-0.5 text-blue-600">
                            ₹{totalInterest.toLocaleString()}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl border bg-white dark:bg-zinc-900 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <User className="h-8 w-8 text-orange-600" />
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Balance</p>
                        {(() => {
                            const lastTxn = ledgerEntries[ledgerEntries.length - 1];
                            const interestBal = lastTxn?.interestBalance ?? 0;

                            if (interestBal < 0) {
                                return (
                                    <div className="mt-0.5">
                                        <p className="text-lg font-bold text-orange-600">₹{closingBalance.toLocaleString()}</p>
                                        <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
                                            <div className="flex justify-between">
                                                <span>Prin:</span>
                                                <span>₹{Number(lastTxn?.principalBalance || closingBalance).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-emerald-600 font-medium">
                                                <span>Adv. Int:</span>
                                                <span>-₹{Number(Math.abs(interestBal)).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            return <p className="text-lg font-bold mt-0.5 text-orange-600">₹{closingBalance.toLocaleString()}</p>
                        })()}
                    </div>
                </div>

                {/* Ledger & Details Sections omitted for brevity but should be same as previous */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Ledger Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="rounded-xl border bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b bg-muted/5 flex items-center justify-between">
                                <h3 className="text-sm font-semibold">Transaction History</h3>
                                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground gap-1" onClick={handleExportCSV}>
                                    <Download className="h-3 w-3" /> Export CSV
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/5 hover:bg-muted/5">
                                            <TableHead className="w-[100px] text-[10px] uppercase tracking-wider font-bold h-9">Date</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-wider font-bold h-9">Particulars</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-wider font-bold h-9">Ref No.</TableHead>
                                            <TableHead className="text-right text-[10px] uppercase tracking-wider font-bold h-9">Principal</TableHead>
                                            <TableHead className="text-right text-[10px] uppercase tracking-wider font-bold h-9 text-red-600">Interest</TableHead>
                                            <TableHead className="text-right text-[10px] uppercase tracking-wider font-bold h-9 text-emerald-600">Total Paid</TableHead>
                                            <TableHead className="text-right text-[10px] uppercase tracking-wider font-bold h-9 text-muted-foreground/70">Prin. Bal</TableHead>
                                            <TableHead className="text-right text-[10px] uppercase tracking-wider font-bold h-9">Int. Due</TableHead>
                                            {checkPermission(PERMISSIONS.REVERT_PAYMENT) && (
                                                <TableHead className="text-right text-[10px] uppercase tracking-wider font-bold h-9 w-[60px]">Action</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ledgerEntries.map((entry, index) => (
                                            <TableRow key={index} className="hover:bg-muted/5 text-xs group">
                                                <TableCell className="font-mono text-muted-foreground h-10 py-1">{new Date(entry.date).toLocaleDateString('en-GB')}</TableCell>
                                                <TableCell className="font-medium h-10 py-1">
                                                    {entry.particulars}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-mono text-[10px]">
                                                    {entry.refNo || '-'}
                                                </TableCell>
                                                <TableCell className={cn("text-right h-10 py-1 font-mono text-[11px]", (entry.principalComponent || 0) < 0 ? "text-red-500" : "text-muted-foreground")}>
                                                    {entry.principalComponent ? Number(entry.principalComponent).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right h-10 py-1 font-mono text-[11px] text-red-600">
                                                    {entry.interestComponent ? Number(entry.interestComponent).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right h-10 py-1 font-mono font-bold text-emerald-600">
                                                    {(entry.credit > 0 || entry.isPayment) ? Number(entry.credit || entry.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right h-10 py-1 font-mono text-muted-foreground/70">
                                                    {(entry.principalBalance ?? entry.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="text-right h-10 py-1 font-mono font-bold">
                                                    {(entry.interestBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                {checkPermission(PERMISSIONS.REVERT_PAYMENT) && (
                                                    <TableCell className="text-right h-10 py-1 pr-4">
                                                        {entry.isPayment && entry.txnId && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                onClick={(e) => { e.stopPropagation(); setRevertTxnTarget(entry); }}
                                                                title="Revert Payment"
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                )}
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
                                        <p className="text-xs font-semibold">{loan.mobile || 'N/A'}</p>
                                        <p className="text-[10px] text-muted-foreground">Primary Contact</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-wrap break-words w-full">{loan.address || 'N/A'}</p>
                                        <p className="text-[10px] text-muted-foreground">Billing Address</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white dark:bg-zinc-900 shadow-sm p-4">
                            <h3 className="text-sm font-semibold mb-3 border-b pb-2">Financial Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-0.5">Interest Rate</p>
                                    <p className="text-sm font-semibold">
                                        {loan.interestRateUnit === 'Monthly'
                                            ? `${loan.interestRate}% Monthly`
                                            : `${loan.interestRate}% Yearly`}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-medium">
                                        {loan.interestRateUnit === 'Monthly'
                                            ? `${(loan.interestRate * 12).toFixed(2)}% Yearly`
                                            : `${(loan.interestRate / 12).toFixed(2)}% Monthly`}
                                    </p>
                                </div>
                                <Separator className="my-1" />
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-0.5">Scheme & Frequency</p>
                                    <p className="text-xs font-semibold">{loan.loanScheme} • {loan.repaymentFrequency}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-0.5">Sanction Date</p>
                                    <p className="text-xs font-semibold">{new Date(loan.disbursedDate).toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Spacer */}
                <div className="h-12 md:hidden"></div>
            </div>

            {/* Hidden Receipt Component */}
            <div className="hidden">
                {loan && (
                    <DisbursementReceipt
                        ref={receiptRef}
                        data={{
                            loanAccountNo: loan.loanNumber,
                            customerName: loan.customerName,
                            address: loan.address,
                            mobile: loan.mobile,
                            disbursedDate: loan.disbursedDate,
                            loanAmount: loan.totalLoanAmount,
                            interestRate: loan.interestRateUnit === 'Monthly'
                                ? `${loan.interestRate}% Monthly (${(loan.interestRate * 12).toFixed(2)}% Yearly)`
                                : `${loan.interestRate}% Yearly (${(loan.interestRate / 12).toFixed(2)}% Monthly)`,
                            tenureMonths: loan.tenureMonths,
                            emiAmount: loan.emiAmount,
                            processingFee: loan.processingFee || 0,
                            netDisbursal: loan.netDisbursal || loan.totalLoanAmount,
                            loanScheme: loan.loanScheme || 'EMI',
                            interestPaidInAdvance: loan.interestPaidInAdvance,
                            firstMonthInterest: loan.firstMonthInterest,
                            paymentModes: loan.paymentModes || []
                        }}
                        company={{
                            name: companySettings?.name || "FinCorp",
                            address: companySettings?.address || "",
                            phone: companySettings?.mobile || "",
                            email: companySettings?.email || "",
                            website: companySettings?.website || "",
                            logoUrl: companySettings?.logoUrl
                        }}
                    />
                )}
            </div>

            {/* Revert Modal */}
            {revertTxnTarget && (
                <Dialog open={!!revertTxnTarget} onOpenChange={(open) => !open && !isReverting && setRevertTxnTarget(null)}>
                    <DialogContent className="sm:max-w-[425px] border-destructive/50">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                Revert Payment Transaction
                            </DialogTitle>
                            <DialogDescription className="py-2">
                                Are you sure you want to revert this payment of <span className="font-bold text-foreground">₹{Number(revertTxnTarget.credit || revertTxnTarget.amount).toLocaleString('en-IN')}</span>?
                                <br /><br />
                                <span className="font-bold text-foreground">This action will:</span>
                                <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-left">
                                    <li>Remove this payment from the ledger history.</li>
                                    <li>Rollback the repayment schedule to its prior state.</li>
                                    <li>Automatically recalculate due interest and future balances.</li>
                                </ul>
                                <br />
                                <span className="font-bold text-red-500">Only do this if the entry was a mistake.</span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setRevertTxnTarget(null)} disabled={isReverting}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleRevertPayment}
                                disabled={isReverting}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {isReverting ? "Reverting..." : "Yes, Revert Payment"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
