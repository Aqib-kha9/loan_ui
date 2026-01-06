"use client";

import { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useSettings } from "@/components/providers/settings-provider";
import { TEMPLATE_REGISTRY } from "@/components/templates/registry";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Printer,
  Download,
  ArrowLeft,
  ArrowRight,
  Check,
  Smartphone,
  Calendar,
  Wallet,
  Building2,
  MoreVertical,
  Briefcase,
  User,
  History,
  FileText,
  Info,
  CreditCard,
  Banknote,
  Plus,
  X,
  Trash2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLoanDetails, LoanAccount, MOCK_LOANS } from "@/lib/mock-data";
import { generateLedger } from "@/lib/ledger-utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function QuickPaymentPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Misc State
  const [showReceipt, setShowReceipt] = useState(false);
  const [activeTab, setActiveTab] = useState("ledger");
  const [ledgerHistory, setLedgerHistory] = useState<any[]>([]);

  // Dynamic Payment State
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [payments, setPayments] = useState([{ mode: "cash", amount: "" }]);

  // Sidebar Logic
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const isCollapsed = !!selectedId && !isSidebarHovered;

  // Settings & Templates
  const { companySettings, printTemplate } = useSettings();
  const selectedTemplate = TEMPLATE_REGISTRY.find(t => t.id === printTemplate) || TEMPLATE_REGISTRY[0];
  const TemplateComponent = selectedTemplate.receiptComponent;

  // Print Logic
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Receipt_${selectedId || 'New'}`,
  });

  // Filter List
  const filteredLoans = MOCK_LOANS.filter(l =>
    l.customerName.toLowerCase().includes(query.toLowerCase()) ||
    l.loanNumber.toLowerCase().includes(query.toLowerCase())
  );

  const selectedLoan = filteredLoans.find(l => l.loanNumber === selectedId) || null;

  const handleSelectCustomer = (loan: LoanAccount) => {
    setSelectedId(loan.loanNumber);
    setPayments([{ mode: "cash", amount: loan.emiAmount.toString() }]);
    setActiveTab("ledger"); // Reset tab on switch
    setLedgerHistory(generateLedger(loan));
  };

  const clearSelection = () => {
    setSelectedId(null);
  };

  const addPaymentRow = () => {
    setPayments([...payments, { mode: "cash", amount: "" }]);
  };

  const removePaymentRow = (index: number) => {
    if (payments.length > 1) {
      const newPayments = [...payments];
      newPayments.splice(index, 1);
      setPayments(newPayments);
    }
  };

  const updatePaymentRow = (index: number, field: 'mode' | 'amount', value: string) => {
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    setPayments(newPayments);
  };

  const handlePayment = () => {
    if (!selectedLoan) return;

    // Validate all amounts
    const validPayments = payments.filter(p => !isNaN(parseFloat(p.amount)) && parseFloat(p.amount) > 0);

    if (validPayments.length === 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (validPayments.length !== payments.length) {
      toast.error("Please complete all payment fields");
      return;
    }

    // Add entries to ledger
    let runningBalance = ledgerHistory.length > 0 ? ledgerHistory[ledgerHistory.length - 1].balance : 0;
    const newEntries = validPayments.map((p, index) => {
      const amount = parseFloat(p.amount);
      runningBalance -= amount;
      return {
        date: new Date().toISOString(),
        particulars: `Payment Received (${isSplitMode && payments.length > 1 ? `Split ${index + 1} - ` : ''}${p.mode})`,
        type: 'Repayment',
        credit: amount,
        debit: 0,
        balance: runningBalance,
        refNo: `TXN-${Math.floor(Math.random() * 10000)}`
      };
    });

    setLedgerHistory([...ledgerHistory, ...newEntries]);

    const totalCollected = validPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    toast.success(`Collected ₹${totalCollected.toLocaleString()} via ${validPayments.length} mode${validPayments.length > 1 ? 's' : ''}`);

    // Reset
    setPayments([{ mode: "cash", amount: "" }]);
    setIsSplitMode(false);
    setShowReceipt(true);
  };

  return (
    <div className="-m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] h-[calc(100vh-1rem)] flex flex-col md:flex-row bg-white dark:bg-zinc-950 overflow-hidden relative">

      {/* === LEFT PANE: LIST === */}
      <div
        className={cn(
          "flex-col h-full bg-white dark:bg-zinc-950 border-r z-20 transition-all duration-500 ease-in-out relative group/sidebar shadow-xl md:shadow-none shrink-0",
          selectedId ? "hidden md:flex" : "flex w-full",
          isCollapsed ? "md:w-[4.5rem]" : "md:w-[320px]"
        )}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >

        {/* Content Container */}
        <div className="flex flex-col h-full w-full overflow-hidden">

          {/* Search Header */}
          <div className={cn(
            "border-b border-border/50 bg-white/50 backdrop-blur-md dark:bg-zinc-900/80 sticky top-0 z-10 shrink-0 transition-all duration-300",
            isCollapsed ? "p-2 items-center justify-center flex flex-col gap-2" : "p-3 md:p-4"
          )}>
            <div className={cn("flex items-center transition-all", isCollapsed ? "justify-center mb-0" : "justify-between mb-4")}>
              {!isCollapsed && (
                <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary shrink-0" />
                  <span>Collections</span>
                </h2>
              )}
              {isCollapsed && <Wallet className="h-6 w-6 text-primary shrink-0" />}

              <Badge variant="secondary" className={cn("text-[10px] h-5 px-1.5 transition-all", isCollapsed ? "hidden" : "flex")}>
                {filteredLoans.length} Due
              </Badge>
            </div>

            {/* Search Input */}
            <div className={cn(
              "relative group w-full transition-all duration-300 overflow-hidden",
              isCollapsed ? "h-0 opacity-0" : "h-9 opacity-100"
            )}>
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="h-9 pl-9 text-sm transition-all shadow-none w-full bg-transparent border-muted-foreground/20 focus-visible:bg-white focus-visible:ring-primary/20"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="divide-y divide-border/30">
              {filteredLoans.length === 0 && !isCollapsed && (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-xs">No customers found</p>
                </div>
              )}

              {filteredLoans.map((loan) => (
                <button
                  key={loan.loanNumber}
                  onClick={() => handleSelectCustomer(loan)}
                  className={cn(
                    "w-full flex items-center transition-all hover:bg-muted/50 dark:hover:bg-white/5 group",
                    isCollapsed ? "justify-center p-2 mb-2" : "text-left gap-3 p-3 pl-[16px]",
                    selectedId === loan.loanNumber
                      ? (isCollapsed ? "relative" : "bg-primary/5 border-l-4 border-l-primary pl-[12px]")
                      : (isCollapsed ? "" : "border-l-4 border-l-transparent")
                  )}
                  title={isCollapsed ? loan.customerName : undefined}
                >
                  {/* Selection Indicator for Collapsed Mode */}
                  {isCollapsed && selectedId === loan.loanNumber && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" />
                  )}

                  <Avatar className={cn(
                    "transition-all duration-300 shrink-0 border-none items-center justify-center",
                    isCollapsed ? "h-10 w-10 ring-2 ring-primary/20 shadow-md" : "h-9 w-9 bg-primary shadow-sm"
                  )}>
                    <AvatarFallback className="flex h-full w-full items-center justify-center text-[10px] font-bold text-primary-foreground bg-primary">
                      {loan.customerName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 z-10 animate-in fade-in slide-in-from-left-2 duration-300">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className={cn("font-bold truncate text-sm transition-colors", selectedId === loan.loanNumber ? "text-primary" : "text-foreground")}>{loan.customerName}</p>
                        <span className={cn("text-[10px] font-medium px-1.5 py-0 rounded-full flex items-center gap-1", loan.status === 'Active' ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground')}>
                          {loan.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate font-mono tracking-tight opacity-70 mb-1">{loan.loanNumber}</p>
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] text-muted-foreground">EMI: ₹{loan.emiAmount}</p>
                        <p className="text-xs font-bold text-destructive">₹{loan.emiAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Safe Area Spacer */}
          <div className="h-safe-area-bottom md:hidden" />
        </div>
      </div>


      {/* === RIGHT PANE: DETAIL PRO === */}
      <div className={cn(
        "flex-1 flex-col bg-white dark:bg-zinc-950 relative overflow-hidden h-full",
        !selectedId ? "hidden md:flex" : "flex"
      )}>

        {selectedLoan ? (
          <>
            {/* Header */}
            <div className="h-14 md:h-16 border-b border-border/50 flex items-center justify-between px-4 bg-white/95 backdrop-blur-xl shrink-0 dark:bg-zinc-950/95 sticky top-0 z-30">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-muted-foreground" onClick={clearSelection}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center text-primary shadow-sm hidden md:flex">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-base font-bold leading-none tracking-tight">{selectedLoan.customerName}</h1>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5">
                    {selectedLoan.mobile} • Last paid 15d ago
                  </p>
                </div>
              </div>

              {/* Stylish Tabs */}
              <div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="bg-muted/50 p-0.5 rounded-lg border border-border/50 h-8">
                    <TabsTrigger value="ledger" className="rounded-md px-3 py-1 text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                      Ledger
                    </TabsTrigger>
                    <TabsTrigger value="details" className="rounded-md px-3 py-1 text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                      Details
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto bg-muted/5 scroll-smooth relative">

              {activeTab === 'ledger' && (
                <div className="min-h-full flex flex-col">
                  <div className="flex-1">
                    <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                      <thead className="bg-white/95 dark:bg-zinc-900/95 text-muted-foreground font-semibold uppercase tracking-wider sticky top-0 z-20 backdrop-blur-md shadow-sm">
                        <tr>
                          <th className="px-4 py-3 border-b border-border/50">Date</th>
                          <th className="px-4 py-3 border-b border-border/50 w-[40%] min-w-[200px]">Particulars</th>
                          <th className="px-4 py-3 border-b border-border/50">Type</th>
                          <th className="px-4 py-3 border-b border-border/50 text-right text-emerald-600">Credit</th>
                          <th className="px-4 py-3 border-b border-border/50 text-right text-red-600">Debit</th>
                          <th className="px-6 py-3 border-b border-border/50 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30 bg-white dark:bg-zinc-950">
                        {ledgerHistory.map((entry, idx) => (
                          <tr key={idx} className="hover:bg-muted/5 transition-colors group">
                            <td className="px-4 py-3 font-mono text-muted-foreground/80">{new Date(entry.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-foreground/90 truncate max-w-[250px]">{entry.particulars}</div>
                              {entry.type === 'EMI' && <div className="text-[10px] text-muted-foreground mt-0.5 font-mono opacity-70">Ref: {entry.refNo || `TXN-${idx}`}</div>}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-[10px] font-normal border-border bg-muted/20 text-muted-foreground">{entry.type}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-medium text-emerald-600 group-hover:bg-emerald-50/10">
                              {entry.credit > 0 ? `+ ${entry.credit.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-medium text-red-600 group-hover:bg-red-50/10">
                              {entry.debit > 0 ? `- ${entry.debit.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-6 py-3 text-right font-mono font-bold text-foreground bg-muted/5">
                              {entry.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="h-4" />
                </div>
              )}

              {activeTab === 'details' && (
                <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">

                  {/* Identity Card */}
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
                      <User className="h-3 w-3 text-primary" /> Identity Proof
                    </h3>
                    <div className="bg-white p-5 rounded-xl border shadow-sm ring-1 ring-black/5 dark:bg-zinc-900/50 space-y-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold mb-0.5">Full Name</p>
                        <p className="text-base font-bold tracking-tight">{selectedLoan.customerName}</p>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-0.5">Address</p>
                          <p className="text-sm leading-relaxed text-foreground/80">{selectedLoan.address}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-0.5">Mobile</p>
                          <p className="text-sm font-mono font-medium">{selectedLoan.mobile}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Loan Terms Card */}
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
                      <Banknote className="h-3 w-3 text-primary" /> Financials
                    </h3>
                    <div className="bg-white p-5 rounded-xl border shadow-sm ring-1 ring-black/5 dark:bg-zinc-900/50 space-y-3">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-muted-foreground font-medium">Principal</span>
                        <span className="font-bold text-base text-foreground">₹{selectedLoan.totalLoanAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-red-600/80">Interest ({selectedLoan.interestRate}%)</span>
                        <span className="font-bold text-red-600 text-sm">+ ₹{((selectedLoan.totalLoanAmount * (selectedLoan.interestRate / 100) * (selectedLoan.tenureMonths / 12))).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 text-muted-foreground">
                        <span className="text-sm font-medium">Processing Fee (1%)</span>
                        <span className="font-bold text-sm">- ₹{(selectedLoan.totalLoanAmount * 0.01).toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Net Disbursal</span>
                          <span className="font-bold text-lg text-emerald-700 tracking-tight">₹{(selectedLoan.totalLoanAmount - (selectedLoan.totalLoanAmount * 0.01)).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Total Repayable</span>
                        <span className="font-mono font-bold text-base">₹{((selectedLoan.totalLoanAmount) + (selectedLoan.totalLoanAmount * (selectedLoan.interestRate / 100) * (selectedLoan.tenureMonths / 12))).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* DOCKED FOOTER */}
            <div className="h-auto border-t bg-white dark:bg-zinc-950 p-2 flex flex-row items-center justify-between z-40 gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary dark:bg-primary/20">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0">Total Due</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-foreground tracking-tight">₹{selectedLoan.emiAmount.toLocaleString()}</span>
                    {((selectedLoan as any).daysLate || 0) > 0 && (
                      <Badge variant="secondary" className="h-4 px-1 text-[9px] font-bold rounded-md bg-red-100/50 text-red-600 border-red-100 hover:bg-red-100">
                        {(selectedLoan as any).daysLate}d Late
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-1 justify-end">

                {/* SPLIT TOGGLE */}
                <div className="flex items-center gap-2 mr-2">
                  <label htmlFor="split-mode" className="text-xs font-bold text-muted-foreground cursor-pointer select-none">Split</label>
                  <Switch
                    id="split-mode"
                    checked={isSplitMode}
                    onCheckedChange={(checked) => {
                      setIsSplitMode(checked);
                      if (!checked && payments.length > 1) {
                        setPayments([payments[0]]);
                      }
                    }}
                    className="scale-75"
                  />
                </div>

                <div className={cn(
                  "flex gap-2 bg-muted/40 p-1 pr-1.5 pl-2 rounded-md border ring-1 ring-black/5 focus-within:ring-primary/20 transition-all flex-1 md:flex-none justify-end",
                  isSplitMode ? "flex-col items-end h-auto gap-1" : "items-center"
                )}>

                  {payments.map((payment, index) => {
                    // If not split mode, only show first
                    if (!isSplitMode && index > 0) return null;

                    return (
                      <div key={index} className="flex items-center w-full justify-end animate-in slide-in-from-right-2 duration-300">
                        {isSplitMode && index > 0 && <div className="h-[1px] w-full bg-border/50 absolute top-0" />}

                        {/* Mode Select */}
                        <Select
                          value={payment.mode}
                          onValueChange={(val) => updatePaymentRow(index, 'mode', val)}
                        >
                          <SelectTrigger className="h-7 w-[110px] text-xs font-medium border-none bg-transparent shadow-none focus:ring-0 px-2 text-muted-foreground mr-2">
                            <SelectValue placeholder="Mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                            <SelectItem value="wallet">Wallet</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="h-4 w-[1px] bg-border mr-2" />
                        <span className="text-muted-foreground font-bold text-sm">₹</span>

                        {/* Amount Input */}
                        <Input
                          className="border-none bg-transparent shadow-none w-full md:w-[80px] text-base font-bold p-0 focus-visible:ring-0 h-7 text-right"
                          placeholder="0"
                          value={payment.amount}
                          onChange={(e) => updatePaymentRow(index, 'amount', e.target.value)}
                        />

                        {/* Remove Button (Only for Split Mode & >1 Row) */}
                        {isSplitMode && payments.length > 1 && (
                          <Button size="icon" variant="ghost" className="h-6 w-6 ml-1 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removePaymentRow(index)}>
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}

                  {/* Actions Row */}
                  <div className={cn("flex items-center gap-2", isSplitMode ? "w-full justify-between mt-1 pt-1 border-t border-dashed border-border/50" : "")}>
                    {isSplitMode && (
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] gap-1 text-primary hover:text-primary/80 -ml-1" onClick={addPaymentRow}>
                        <Plus className="h-3 w-3" /> Add Mode
                      </Button>
                    )}

                    {!isSplitMode && <div className="h-4 w-[1px] bg-border mx-1" />}

                    <Button size="sm" className={cn("text-xs font-bold shadow-sm", isSplitMode ? "ml-auto h-7 px-4" : "h-7 px-3")} onClick={handlePayment}>
                      Collect {isSplitMode && "All"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* EMPTY STATE */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/5">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative h-24 w-24 rounded-2xl bg-white border shadow-sm flex items-center justify-center dark:bg-zinc-900">
                <Wallet className="h-10 w-10 text-primary/80" />
              </div>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">Select Customer</h3>
            <p className="text-muted-foreground max-w-xs mt-2 text-sm">
              Select from the list to view Ledger & take payment.
            </p>
          </div>
        )}
        {/* Receipt Dialog */}
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="max-w-[fit-content] w-auto p-0 bg-transparent border-none shadow-none text-transparent">
            <DialogTitle className="sr-only">Receipt Preview</DialogTitle>

            <div className="relative bg-white dark:bg-zinc-950 rounded-lg shadow-2xl overflow-hidden max-w-[95vw] md:max-w-5xl w-full flex flex-col">
              <div className="flex justify-end p-4 border-b bg-muted/20 print:hidden gap-3">
                <Button
                  onClick={() => {
                    const originalTitle = document.title;
                    document.title = `Receipt_${selectedLoan?.loanNumber}_${selectedLoan?.customerName?.replace(/\s+/g, '_')}`;
                    handlePrint();
                    setTimeout(() => document.title = originalTitle, 1000);
                  }}
                  variant="outline"
                  className="gap-2 font-bold"
                >
                  <Download className="h-4 w-4" /> Save PDF
                </Button>
                <Button onClick={handlePrint} className="gap-2 font-bold shadow-sm">
                  <Printer className="h-4 w-4" /> Print
                </Button>
              </div>

              <div className="p-0 overflow-auto max-h-[85vh] bg-gray-100/50 dark:bg-zinc-900/50 flex justify-center">
                <div className="origin-top scale-[0.6] sm:scale-[0.6]">
                  <div ref={componentRef} className="shadow-2xl">
                    <TemplateComponent
                      data={{
                        customerName: selectedLoan?.customerName || '',
                        loanAccountNo: selectedLoan?.loanNumber || '',
                        amount: payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toString(),
                        paymentMode: payments.map(p => p.mode.toUpperCase()).join(' + '),
                      }}
                      company={companySettings}
                    />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
