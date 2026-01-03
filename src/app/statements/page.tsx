"use client";

import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
    Search,
    Printer,
    Download,
    FileText,
    Calendar as CalendarIcon,
    Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_LOANS, LoanAccount } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ... imports
import { useSettings } from "@/components/providers/settings-provider";
import { getTemplate } from "@/components/templates/registry";
import { generateLedger } from "@/lib/ledger-utils";

export default function StatementsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLoanNumber, setSelectedLoanNumber] = useState<string | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Derive selectedClient from fresh MOCK_LOANS
    const selectedClient = selectedLoanNumber
        ? MOCK_LOANS.find(l => l.loanNumber === selectedLoanNumber)
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
    const filteredClients = searchTerm.length > 1 ? MOCK_LOANS.filter(client =>
        client.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.mobile.includes(searchTerm)
    ) : [];

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

    // Prepare data for template
    const ledgerEntries = selectedClient ? generateLedger(selectedClient) : [];

    // Calculate Totals
    const totalInterest = ledgerEntries.reduce((sum, t) => sum + (t.type === 'Interest' ? t.debit : 0), 0);
    const totalPaid = ledgerEntries.reduce((sum, t) => sum + t.credit, 0);
    const closingBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0;

    const statementData = selectedClient ? {
        customerName: selectedClient.customerName,
        loanAccountNo: selectedClient.loanNumber,
        address: selectedClient.address,
        mobile: selectedClient.mobile,
        sanctionDate: selectedClient.disbursedDate,
        loanAmount: selectedClient.totalLoanAmount.toString(),
        interestRate: selectedClient.interestRate + "%",
        interestPaidInAdvance: selectedClient.interestPaidInAdvance,
        // Pass totals
        totalInterest: totalInterest,
        totalPaid: totalPaid,
        closingBalance: closingBalance,
        transactions: ledgerEntries.map(t => ({
            date: t.date, // Format date in template for consistency
            type: t.type,
            // Pass specific amounts
            amount: t.credit > 0 ? t.credit : t.debit,
            isPayment: t.credit > 0,
            ref: t.refNo,
            refNo: t.refNo,
            principalComponent: t.principalComponent,
            interestComponent: t.interestComponent,
            penalty: 0,
            balanceAfter: t.balance
        }))
    } : null;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 min-h-screen bg-muted/5">
            {/* NO PRINT HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Statement Generation</h1>
                    <p className="text-muted-foreground mt-1">Generate, view, and print detailed loan statements.</p>
                </div>
                <div className="bg-white px-3 py-1 rounded-full border text-xs font-medium text-muted-foreground shadow-sm">
                    Using Template: <span className="text-primary font-bold">{selectedTemplateConfig.name}</span>
                </div>
            </div>

            {/* SEARCH & SELECTION (NO PRINT) */}
            <div className="grid gap-6 md:grid-cols-12 print:hidden">
                {/* SEARCH PANEL */}
                <Card className="md:col-span-4 h-fit">
                    <SectionHeader icon={Search} title="Find Customer" />
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search Name, Loan ID..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>Try:</span>
                            <button className="hover:text-primary hover:underline" onClick={() => setSearchTerm("LN001")}>LN001</button>
                            <span>•</span>
                            <button className="hover:text-primary hover:underline" onClick={() => setSearchTerm("Rahul")}>Rahul</button>
                            <span>•</span>
                            <button className="hover:text-primary hover:underline" onClick={() => setSearchTerm("98765")}>98765</button>
                        </div>

                        {searchTerm.length > 1 && (
                            <div className="border rounded-md divide-y max-h-60 overflow-y-auto bg-background">
                                {filteredClients.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">No customers found</div>
                                ) : (
                                    filteredClients.map(client => (
                                        <div
                                            key={client.loanNumber}
                                            className={cn(
                                                "p-3 cursor-pointer hover:bg-muted/50 flex items-center gap-3 transition-colors",
                                                selectedClient?.loanNumber === client.loanNumber && "bg-primary/5"
                                            )}
                                            onClick={() => {
                                                setSelectedLoanNumber(client.loanNumber);
                                                setSearchTerm("");
                                            }}
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://ui-avatars.com/api/?name=${client.customerName}&background=random`} />
                                                <AvatarFallback>{client.customerName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{client.customerName}</p>
                                                <p className="text-xs text-muted-foreground">{client.loanNumber}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {selectedClient && (
                            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold uppercase text-primary tracking-wider">Selected</span>
                                    <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground" onClick={() => setSelectedLoanNumber(null)}>
                                        Change
                                    </Button>
                                </div>
                                <h3 className="font-bold text-lg">{selectedClient.customerName}</h3>
                                <p className="text-sm text-muted-foreground">{selectedClient.mobile}</p>
                                <p className="text-sm font-mono mt-1">{selectedClient.loanNumber}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* FILTERS PANEL */}
                <Card className="md:col-span-8 h-fit">
                    <SectionHeader icon={Filter} title="Statement Settings" />
                    <CardContent>
                        <div className="flex flex-col lg:flex-row gap-6 items-end">
                            <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Start Date</span>
                                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">End Date</span>
                                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                                <Button variant="ghost" className="text-muted-foreground flex-1 lg:flex-none" onClick={() => { setStartDate(""); setEndDate(""); }}>
                                    Clear
                                </Button>
                                <Separator orientation="vertical" className="h-8 hidden lg:block" />
                                <Button variant="outline" className="flex-1 lg:flex-none" onClick={() => toast.info("PDF Download Started...")}>
                                    <Download className="mr-2 h-4 w-4" /> PDF
                                </Button>
                                <Button onClick={() => handlePrint()} disabled={!selectedClient} className="bg-primary text-primary-foreground shadow-sm flex-1 lg:flex-none">
                                    <Printer className="mr-2 h-4 w-4" /> Print Statement
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* STATEMENT PREVIEW (PRINTABLE) */}
            {selectedClient && statementData && StatementComponent ? (
                <div className="bg-white p-8 shadow-sm border rounded-xl print:shadow-none print:border-none print:p-0 overflow-auto" ref={componentRef}>
                    <StatementComponent
                        data={statementData}
                        company={companySettings}
                    />

                    {/* PRINT FOOTER ADDENDUM if needed */}
                    <div className="hidden print:block mt-8 text-center text-[10px] text-muted-foreground print:text-black/50">
                        <p>Generated via FinCorp ERP • {new Date().toLocaleString()}</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-muted-foreground/20 text-muted-foreground bg-white/50 print:hidden">
                    <FileText className="h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold">No Customer Selected</h3>
                    <p>Search and select a customer to view their statement.</p>
                </div>
            )}
        </div>
    );
}

function SectionHeader({ icon: Icon, title }: { icon: any, title: string }) {
    return (
        <div className="p-6 pb-2 flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold tracking-tight">{title}</h3>
        </div>
    );
}
