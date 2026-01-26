"use client";

import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
    Search,
    Printer,
    Download,
    FileText,
    Calendar as CalendarIcon,
    Filter,
    X,
    ChevronRight,
    Home,
    Pencil,
    Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { LoanAccount } from "@/lib/mock-data";
import { mapLoanToFrontend } from "@/lib/mapper";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

// ... imports
import { useSettings } from "@/components/providers/settings-provider";
import { getTemplate } from "@/components/templates/registry";
import { generateLedger } from "@/lib/ledger-utils";
import { useEffect } from "react";
export default function StatementsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLoanNumber, setSelectedLoanNumber] = useState<string | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [loans, setLoans] = useState<LoanAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Loans
    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const res = await fetch('/api/loans');
                const data = await res.json();
                if (data.success) {
                    const mapped = data.loans.map((l: any) => mapLoanToFrontend(l));
                    setLoans(mapped);
                }
            } catch (error) {
                console.error("Failed to fetch loans:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLoans();
    }, []);

    // Derive selectedClient
    const selectedClient = selectedLoanNumber
        ? loans.find(l => l.loanNumber === selectedLoanNumber)
        : null;

    // Get Settings
    const { companySettings, printTemplate } = useSettings();
    const selectedTemplateConfig = getTemplate(printTemplate);
    const StatementComponent = selectedTemplateConfig?.statementComponent;

    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Statement_${selectedClient?.loanNumber || 'Loan'}`,
    });

    // Filter logic for search
    const filteredClients = searchTerm.length > 0 ? loans.filter(client =>
        client.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.mobile.includes(searchTerm)
    ) : loans.slice(0, 10); // Show recent 10 by default

    // Filter logic for transactions
    const getFilteredTransactions = () => {
        if (!selectedClient) return [];
        let txns = selectedClient.transactions || [];

        if (startDate) {
            txns = txns.filter(t => new Date(t.date) >= new Date(startDate));
        }
        if (endDate) {
            txns = txns.filter(t => new Date(t.date) <= new Date(endDate));
        }
        return txns;
    };

    const transactions = getFilteredTransactions();

    // Recalculate balances after any edit/delete
    const recalculateBalances = (entries: any[]) => {
        let runningBalance = 0;
        return entries.map(entry => {
            // For editing, we allow modifying components. 
            // If it's a payment (credit), we use amount.
            // If it's a charge (debit), we sum components.
            let d = entry.debit;
            let c = entry.credit;

            if (entry.isPayment) {
                c = entry.amount || 0;
                d = 0;
            } else {
                // If standard charge, ensure it matches components
                d = (entry.principalComponent || 0) + (entry.interestComponent || 0) + (entry.penalty || 0);
                c = 0;
            }

            runningBalance = runningBalance + d - c;
            return {
                ...entry,
                debit: d,
                credit: c,
                balance: runningBalance
            };
        });
    };

    // Derived: Total Ledger Entries (All for calculation)
    const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);

    // Derived: Display Entries (Filtered + Opening Balance)
    const getDisplayEntries = () => {
        if (ledgerEntries.length === 0) return [];

        let filtered = [...ledgerEntries];
        let openingBalance = 0;

        if (startDate) {
            const start = new Date(startDate);
            // Calculate Opening Balance (Sum of all entries before start date)
            const beforeStart = filtered.filter(t => new Date(t.date) < start);
            openingBalance = beforeStart.reduce((sum, t) => sum + (t.debit || 0) - (t.credit || 0), 0);

            // Filter for display
            filtered = filtered.filter(t => new Date(t.date) >= start);
        }

        if (endDate) {
            const end = new Date(endDate);
            filtered = filtered.filter(t => new Date(t.date) <= end);
        }

        // If filtering is applied, prepend "Opening Balance"
        if (startDate) {
            const openingRow = {
                date: startDate,
                particulars: "OPENING BALANCE B/F",
                type: "Closing",
                debit: 0,
                credit: 0,
                balance: openingBalance,
                isOpening: true
            };
            return [openingRow, ...filtered];
        }

        return filtered;
    };

    const displayEntries = getDisplayEntries();

    const [isEditing, setIsEditing] = useState(false);

    // Initialize Ledger when client is selected
    useEffect(() => {
        if (selectedClient) {
            const generated = generateLedger(selectedClient);
            // Enrich with Penalty if missing or just defaults
            const enrich = generated.map((t, idx) => ({
                id: idx, // stable temp id
                ...t,
                penalty: (t as any).penalty || 0,
                // Ensure components exist
                principalComponent: t.principalComponent || 0,
                interestComponent: t.interestComponent || 0,
                amount: t.credit > 0 ? t.credit : t.debit,
                isPayment: t.credit > 0
            }));
            setLedgerEntries(enrich);
        } else {
            setLedgerEntries([]);
        }
    }, [selectedClient]);

    // Calculate Totals based on current 'displayEntries' state (Period Specific)
    const periodInterest = displayEntries.reduce((sum, t) => sum + (t.type === 'Interest' ? t.debit : 0), 0);
    const periodPaid = displayEntries.reduce((sum, t) => sum + t.credit, 0);
    const periodClosingBalance = displayEntries.length > 0 ? displayEntries[displayEntries.length - 1].balance : 0;

    const statementData = selectedClient ? {
        customerName: selectedClient.customerName,
        loanAccountNo: selectedClient.loanNumber,
        address: selectedClient.address,
        mobile: selectedClient.mobile,
        sanctionDate: selectedClient.disbursedDate,
        loanAmount: selectedClient.totalLoanAmount.toLocaleString(),
        interestRate: selectedClient.interestRateUnit === 'Monthly'
            ? `${selectedClient.interestRate}% Monthly (${(selectedClient.interestRate * 12).toFixed(2)}% Yearly)`
            : `${selectedClient.interestRate}% Yearly (${(selectedClient.interestRate / 12).toFixed(2)}% Monthly)`,
        interestPaidInAdvance: selectedClient.interestPaidInAdvance,
        // Pass totals (Period Sensitive)
        totalInterest: periodInterest,
        totalPaid: periodPaid,
        closingBalance: periodClosingBalance,
        transactions: displayEntries.map(t => ({
            ...t,
            amount: t.credit > 0 ? t.credit : t.debit,
            isPayment: t.credit > 0,
            ref: t.refNo, // For legacy template compat
            balanceAfter: t.balance
        }))
    } : null;

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const handleUpdateEntry = (index: number, field: string, value: any) => {
        let updated = [...ledgerEntries];
        updated[index] = { ...updated[index], [field]: value };

        // If amount changed for payment, or components changed for charge, we need to sync them
        if (updated[index].isPayment) {
            if (field === 'amount') updated[index].credit = value;
        } else {
            // Recalculate debit if components changed
            updated[index].debit = (updated[index].principalComponent || 0) +
                (updated[index].interestComponent || 0) +
                (updated[index].penalty || 0);
        }

        updated = recalculateBalances(updated);
        setLedgerEntries(updated);
        setHasUnsavedChanges(true);
    };

    const handleDeleteEntry = (index: number) => {
        let updated = ledgerEntries.filter((_, i) => i !== index);
        updated = recalculateBalances(updated);
        setLedgerEntries(updated);
        setHasUnsavedChanges(true);
    };

    const [isSaving, setIsSaving] = useState(false);
    const handleSave = async () => {
        if (!selectedLoanNumber) return;
        setIsSaving(true);
        const promise = new Promise(async (resolve, reject) => {
            try {
                const res = await fetch(`/api/loans/${selectedLoanNumber}/reconcile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ledgerEntries })
                });
                const data = await res.json();
                if (data.success) {
                    setHasUnsavedChanges(false);
                    // Re-fetch loans to sync all stats
                    const lRes = await fetch('/api/loans');
                    const lData = await lRes.json();
                    if (lData.success) {
                        const mapped = lData.loans.map((l: any) => mapLoanToFrontend(l));
                        setLoans(mapped);
                    }
                    resolve(data);
                } else {
                    reject(data.error);
                }
            } catch (error) {
                reject(error);
            } finally {
                setIsSaving(false);
            }
        });

        toast.promise(promise, {
            loading: 'Saving changes to database...',
            success: 'Ledger reconciled and saved successfully!',
            error: (err) => `Failed to save: ${err}`
        });
    };

    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const isCollapsed = !!selectedLoanNumber && !isSidebarHovered;

    return (
        <div className="-m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] h-[calc(100vh-1rem)] bg-background flex flex-col md:flex-row overflow-hidden border-t divide-x">

            {/* LEFT SIDEBAR: Search & List */}
            <div
                className={cn(
                    "flex flex-col h-full bg-background z-30 transition-all duration-500 ease-in-out border-r relative group/sidebar shadow-xl md:shadow-none",
                    isCollapsed ? "w-[4.5rem] border-r-primary/10" : "w-full md:w-64 lg:w-72"
                )}
                onMouseEnter={() => setIsSidebarHovered(true)}
                onMouseLeave={() => setIsSidebarHovered(false)}
            >
                {/* Content Container */}
                <div className="flex flex-col h-full w-full overflow-hidden">

                    {/* Sidebar Header */}
                    <div className={cn(
                        "h-14 border-b flex items-center shrink-0 bg-background/50 backdrop-blur transition-all",
                        isCollapsed ? "justify-center px-0" : "justify-between px-4"
                    )}>
                        {!isCollapsed && <h2 className="font-semibold text-sm">Customers</h2>}
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{filteredClients.length}</Badge>
                    </div>

                    {/* Search Bar (Hidden when collapsed) */}
                    <div className={cn(
                        "border-b transition-all duration-300 overflow-hidden",
                        isCollapsed ? "h-0 opacity-0 p-0" : "h-auto opacity-100 p-3"
                    )}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-9 h-9 bg-muted/40 border-transparent focus:bg-background focus:border-input transition-all text-xs"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Customer List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                        {filteredClients.length === 0 && !isCollapsed ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <p className="text-xs">No customers found</p>
                            </div>
                        ) : (
                            filteredClients.map(client => (
                                <div
                                    key={client.loanNumber}
                                    className={cn(
                                        "rounded-md cursor-pointer flex items-center transition-all duration-200 group border border-transparent",
                                        isCollapsed ? "justify-center p-2 mb-2" : "p-3 gap-3 justify-start",
                                        selectedClient?.loanNumber === client.loanNumber
                                            ? "bg-primary/5 border-primary/10 shadow-sm relative"
                                            : "hover:bg-muted/50"
                                    )}
                                    onClick={() => setSelectedLoanNumber(client.loanNumber)}
                                    title={isCollapsed ? client.customerName : undefined}
                                >
                                    {/* Selection Indicator for Collapsed Mode */}
                                    {isCollapsed && selectedClient?.loanNumber === client.loanNumber && (
                                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" />
                                    )}

                                    <Avatar className={cn(
                                        "border-none shrink-0 transition-all items-center justify-center",
                                        isCollapsed ? "h-10 w-10 ring-2 ring-primary/20 shadow-md" : "h-8 w-8"
                                    )}>
                                        <AvatarImage src={client.photoUrl} className="object-cover" />
                                        <AvatarFallback className="bg-primary text-primary-foreground font-bold text-[10px]">
                                            {client.customerName.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    {!isCollapsed && (
                                        <div className="flex-1 min-w-0 fade-in-0 animate-in duration-300">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className={cn(
                                                    "font-medium text-xs truncate leading-none",
                                                    selectedClient?.loanNumber === client.loanNumber ? "text-primary font-semibold" : "text-foreground"
                                                )}>
                                                    {client.customerName}
                                                </p>
                                                {selectedClient?.loanNumber === client.loanNumber && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                <span className="font-mono">{client.loanNumber}</span>
                                                <span>•</span>
                                                <span className="truncate">{client.mobile}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT PANE: Workspace & Preview */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50 relative">

                {selectedClient ? (
                    <>
                        {/* Sticky Header */}
                        <header className="h-14 border-b bg-background/80 backdrop-blur flex items-center justify-between px-4 md:px-6 shrink-0 z-20 sticky top-0 supports-[backdrop-filter]:bg-background/60">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                    <h1 className="font-semibold text-sm leading-none">Statement Preview</h1>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {selectedClient.customerName} • <span className="font-mono">{selectedClient.loanNumber}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-3">
                                {/* Template Selector */}
                                <div className="hidden md:flex items-center bg-muted/40 rounded-md border px-2 h-8">
                                    <span className="text-[10px] text-muted-foreground mr-2 font-medium uppercase tracking-wider">Template</span>
                                    <span className="text-xs font-semibold">{selectedTemplateConfig.name}</span>
                                </div>

                                <Separator orientation="vertical" className="h-6 hidden md:block" />

                                {/* Date Filter (Styled) */}
                                <div className="flex items-center gap-1 bg-background border rounded-md h-8 px-2 shadow-sm hover:border-sidebar-accent transition-colors">
                                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    <input
                                        type="date"
                                        className="text-[10px] bg-transparent border-none focus:outline-none w-20 p-0 text-foreground font-medium"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <span className="text-muted-foreground text-[10px] mx-1">to</span>
                                    <input
                                        type="date"
                                        className="text-[10px] bg-transparent border-none focus:outline-none w-20 p-0 text-foreground font-medium"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                    {(startDate || endDate) && (
                                        <button onClick={() => { setStartDate(''); setEndDate('') }} className="ml-1 text-muted-foreground hover:text-red-500">
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs ml-2" onClick={() => setIsEditing(true)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit Data
                                </Button>

                                <Button size="sm" variant="secondary" className="h-8 gap-1.5 text-xs ml-2" onClick={() => handlePrint()}>
                                    <Download className="h-3.5 w-3.5" />
                                    Download
                                </Button>

                                <Button size="sm" className="h-8 gap-1.5 shadow-sm text-xs ml-2" onClick={() => handlePrint()}>
                                    <Printer className="h-3.5 w-3.5" />
                                    Print
                                </Button>
                            </div>
                        </header>

                        {/* Scrollable Preview Area */}
                        <main className="flex-1 overflow-y-auto p-6 md:p-10 flex items-start justify-center">
                            <div className="w-full max-w-[210mm] transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-4">
                                {statementData && StatementComponent && (
                                    <div className="bg-white shadow-2xl ring-1 ring-black/5 rounded-sm relative group/paper">
                                        {/* Print Wrapper */}
                                        <div className="overflow-hidden h-0 w-0 absolute opacity-0 pointer-events-none">
                                            <div ref={componentRef}>
                                                <StatementComponent
                                                    data={statementData}
                                                    company={companySettings}
                                                />
                                            </div>
                                        </div>

                                        {/* Visual Preview */}
                                        <div className="pointer-events-none select-none group-hover/paper:pointer-events-auto group-hover/paper:select-auto">
                                            <StatementComponent
                                                data={statementData}
                                                company={companySettings}
                                            />
                                        </div>

                                        {/* Overlay Checkmark or Action? No, keep it clean */}
                                    </div>
                                )}
                            </div>

                            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                                <DialogContent className="max-w-[95vw] w-full sm:max-w-7xl max-h-[85vh] overflow-y-auto">
                                    <DialogHeader className="pb-4 border-b">
                                        <DialogTitle className="text-xl">Edit Statement Data</DialogTitle>
                                        <DialogDescription className="text-base">
                                            Modify the transaction details below. These changes will appear on the printed statement.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="rounded-md border mt-4">
                                        <Table>
                                            <TableHeader className="bg-muted/50">
                                                <TableRow>
                                                    <TableHead className="w-[140px] text-sm font-semibold">Date</TableHead>
                                                    <TableHead className="min-w-[250px] text-sm font-semibold">Particulars</TableHead>
                                                    <TableHead className="w-[120px] text-sm font-semibold">Ref No</TableHead>
                                                    <TableHead className="text-right w-[120px] text-sm font-semibold">Amount / Prin.</TableHead>
                                                    <TableHead className="text-right w-[100px] text-sm font-semibold">Interest</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {ledgerEntries.map((entry, index) => (
                                                    <TableRow key={index} className="hover:bg-muted/30 group/row">
                                                        <TableCell className="p-2">
                                                            <Input
                                                                value={entry.date}
                                                                onChange={(e) => handleUpdateEntry(index, 'date', e.target.value)}
                                                                className="h-10 text-sm"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-2">
                                                            <Input
                                                                value={entry.particulars}
                                                                onChange={(e) => handleUpdateEntry(index, 'particulars', e.target.value)}
                                                                className="h-10 text-sm font-medium"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-2">
                                                            <Input
                                                                value={entry.refNo || ''}
                                                                onChange={(e) => handleUpdateEntry(index, 'refNo', e.target.value)}
                                                                className="h-10 text-sm"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-2">
                                                            <Input
                                                                type="number"
                                                                value={entry.isPayment ? entry.amount : entry.principalComponent}
                                                                onChange={(e) => handleUpdateEntry(index, entry.isPayment ? 'amount' : 'principalComponent', parseFloat(e.target.value))}
                                                                className="h-10 text-sm text-right font-mono"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-2">
                                                            <Input
                                                                type="number"
                                                                value={entry.interestComponent}
                                                                onChange={(e) => handleUpdateEntry(index, 'interestComponent', parseFloat(e.target.value))}
                                                                disabled={entry.isPayment}
                                                                className="h-10 text-sm text-right font-mono"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-2 text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/row:opacity-100 transition-opacity"
                                                                onClick={() => handleDeleteEntry(index)}
                                                                title="Delete Row"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t mt-4">
                                        <div className="text-sm text-muted-foreground italic">
                                            {hasUnsavedChanges ? "* You have unsaved changes that will be lost on refresh." : "All changes saved locally."}
                                        </div>
                                        <div className="flex gap-3">
                                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                            <Button
                                                onClick={handleSave}
                                                disabled={!hasUnsavedChanges || isSaving}
                                                className="min-w-[140px]"
                                            >
                                                {isSaving ? "Saving..." : "Save to Database"}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </main>
                    </>
                ) : (
                    /* Empty State - Polished */
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <FileText className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground">Select a Customer</h3>
                        <p className="max-w-xs mt-2 text-sm text-muted-foreground leading-relaxed">
                            Choose a customer from the list to generate, customize, and print their transaction statement.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
