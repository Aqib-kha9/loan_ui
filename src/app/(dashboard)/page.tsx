"use client";

import { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { logActivity } from "@/lib/activity-logger";
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
  CheckCircle2,
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
  Trash2,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoanAccount } from "@/lib/mock-data";
import { mapLoanToFrontend } from "@/lib/mapper";
import { generateLedger } from "@/lib/ledger-utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { PERMISSIONS } from "@/lib/constants/permissions";
import AccessDenied from "@/components/auth/access-denied";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function QuickPaymentContent() {
  // Re-trigger build
  const { user, checkPermission, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const initialLoanId = searchParams.get("loan");

  // Permission Guard
  const canViewDashboard = checkPermission(PERMISSIONS.VIEW_DASHBOARD);
  const canCollect = checkPermission(PERMISSIONS.CREATE_PAYMENT);


  // State
  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Misc State
  const [showReceipt, setShowReceipt] = useState(false);
  const [activeTab, setActiveTab] = useState("ledger");
  const [ledgerHistory, setLedgerHistory] = useState<any[]>([]);

  // Dynamic Payment State
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [isManualBreakup, setIsManualBreakup] = useState(false); // New dedicated state
  const [payments, setPayments] = useState([{ mode: "cash", amount: "" }]);
  const [narrative, setNarrative] = useState("");

  // ... (inside render) ...


  const [contributionDate, setContributionDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualPrincipal, setManualPrincipal] = useState("");
  const [manualInterest, setManualInterest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-update Payment Amount when Manual P/I changes (Single Mode only)
  useEffect(() => {
    if (isManualBreakup && payments.length === 1) {
      const mP = parseFloat(manualPrincipal || "0");
      const mI = parseFloat(manualInterest || "0");
      const total = mP + mI;
      if (total > 0) {
        setPayments([{ ...payments[0], amount: total.toString() }]);
      }
    }
  }, [manualPrincipal, manualInterest, isManualBreakup]);

  // Sidebar Logic
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const isCollapsed = !!selectedId && !isSidebarHovered;

  // Settings & Templates
  const { companySettings, printTemplate } = useSettings();
  const selectedTemplate = TEMPLATE_REGISTRY.find(t => t.id === printTemplate) || TEMPLATE_REGISTRY[0];
  const TemplateComponent = selectedTemplate.receiptComponent;

  // Settings & Templates
  const [lastPaymentData, setLastPaymentData] = useState<any[]>([]);
  const [lastPaymentMetadata, setLastPaymentMetadata] = useState<any>(null); // For balance on receipt
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Receipt_${selectedId || 'New'}`,
  });

  // Fetch Loans
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await fetch('/api/loans');
        const data = await res.json();
        if (data.success) {
          const mappedLoans = data.loans.map((l: any) => mapLoanToFrontend(l));
          setLoans(mappedLoans);
        }
      } catch (error) {
        console.error("Failed to fetch loans:", error);
        // toast.error("Failed to fetch loans"); 
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchLoans();
    }
  }, [user]);

  // Handle Query Param Selection
  useEffect(() => {
    if (initialLoanId && loans.length > 0 && !selectedId) {
      const targetLoan = loans.find(l => l.loanNumber === initialLoanId);
      if (targetLoan) {
        handleSelectCustomer(targetLoan);
      }
    }
  }, [initialLoanId, loans, selectedId]);

  if (isAuthLoading) return null;

  if (!canViewDashboard && !canCollect) {
    return <AccessDenied message="You do not have permission to access the dashboard." />;
  }

  // Filter List
  const filteredLoans = loans.filter(l =>
    (l.customerName.toLowerCase().includes(query.toLowerCase()) ||
      l.loanNumber.toLowerCase().includes(query.toLowerCase())) &&
    l.status !== 'Closed' // Filter out fully paid/closed loans
  ).sort((a, b) => {
    // Sort by due date (earliest first)
    const dateA = a.nextPaymentDate ? new Date(a.nextPaymentDate).getTime() : Number.MAX_SAFE_INTEGER;
    const dateB = b.nextPaymentDate ? new Date(b.nextPaymentDate).getTime() : Number.MAX_SAFE_INTEGER;
    return dateA - dateB;
  });

  const selectedLoan = loans.find(l => l.loanNumber === selectedId) || null;

  const handleSelectCustomer = async (loan: LoanAccount) => {
    setSelectedId(loan.loanNumber);
    // Use nextPaymentAmount if available and > 0, else emiAmount. Default to emiAmount if 0 (e.g. fully paid but want to pay more?)
    // Actually if 0, default to empty? No, keep emiAmount as standard reference or 0.
    const defaultAmount = (loan.nextPaymentAmount && loan.nextPaymentAmount > 0) ? loan.nextPaymentAmount : loan.emiAmount;
    setPayments([{ mode: "cash", amount: defaultAmount.toString() }]);
    setNarrative(""); // Reset
    setManualPrincipal(""); // Reset
    setManualInterest(""); // Reset
    setIsManualBreakup(false); // Reset Manual Toggle
    setActiveTab("ledger"); // Reset tab on switch

    // Fetch Unified Ledger
    try {
      setLedgerHistory([]); // Clear previous
      const res = await fetch(`/api/loans/${loan.loanNumber}/statement`);
      const data = await res.json();
      if (data.success && data.statement) {
        const apiLedger = data.statement.ledger.map((t: any) => ({
          date: t.date,
          particulars: t.particulars,
          refNo: t.refNo || t.ref || '-',
          debit: t.debit,
          credit: t.credit,
          balance: t.balance,
          type: t.type,
          principalComponent: t.principalComponent,
          interestComponent: t.interestComponent,
          isPayment: t.isPayment
        }));
        setLedgerHistory(apiLedger);
      } else {
        console.warn("Could not load unified ledger for Quick Collect.");
      }
    } catch (err) {
      console.error("Failed to fetch ledger for Quick Collect", err);
    }
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



  // NOTE: This currently only updates local state. 
  // To persist payments, we would need to POST to an API.
  const handlePayment = async () => {
    if (!selectedLoan) return;

    // Validate all amounts
    const validPayments = payments.filter(p => !isNaN(parseFloat(p.amount)) && parseFloat(p.amount) > 0);

    if (validPayments.length === 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const totalCollected = validPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    if (validPayments.length !== payments.length) {
      toast.error("Please complete all payment fields");
      return;
    }

    // MANUAL SPLIT VALIDATION
    if (isManualBreakup) {
      const mP = parseFloat(manualPrincipal || "0");
      const mI = parseFloat(manualInterest || "0");
      const tolerance = 1.0; // ₹1 tolerance for rounding

      if (Math.abs((mP + mI) - totalCollected) > tolerance) {
        toast.error(`Mismatch! P (${mP}) + I (${mI}) must equal Total (₹${totalCollected})`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const toastId = toast.loading("Processing Payment...");

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanNumber: selectedId, // matches loanId in backend
          payments: validPayments,
          date: contributionDate,
          // NOTE: API expects narrative, and manual splits
          // If manual splits are provided, check if total matches amount
          // IF user enters P=X and I=Y, we can optionally sum them to get Amount if mode amount is empty?
          // For now, let's keep it simple: User enters Total Amount in 'payments', and optionally P/I splits for ledger.
          manualPrincipal: manualPrincipal || undefined,
          manualInterest: manualInterest || undefined,
          narrative: narrative
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Payment failed";
        toast.error(errorMsg, { id: toastId });

        // If loan is closed or settled, force refresh to update UI state
        if (errorMsg.includes("Closed") || errorMsg.includes("fully settled")) {
          setTimeout(() => window.location.reload(), 1500);
        }
        return;
      }

      // Success
      const totalCollected = validPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      toast.success(`Collected ₹${totalCollected.toLocaleString()}`, { id: toastId });

      // Capture Payment Data for Receipt (before clearing form)
      setLastPaymentData([...validPayments]); // Store copy
      setLastPaymentMetadata({
        totalBalance: data.newBalance || (data.currentPrincipal + data.accumulatedInterest) || 0,
        principalPaid: isManualBreakup ? manualPrincipal : undefined,
        interestPaid: isManualBreakup ? manualInterest : undefined
      });

      // Reset Form
      setPayments([{ mode: "cash", amount: "" }]);
      setNarrative("");
      setIsSplitMode(false);
      setShowReceipt(true);

    } catch (error) {
      console.error("Payment API Error:", error);
      toast.error("Network error processing payment");
    } finally {
      setIsSubmitting(false);
    }
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
              {isLoading && (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-xs">Loading loans...</span>
                </div>
              )}

              {!isLoading && filteredLoans.length === 0 && !isCollapsed && (
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
                    {loan.photoUrl ? (
                      <AvatarImage src={loan.photoUrl} alt={loan.customerName} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="flex h-full w-full items-center justify-center text-[10px] font-bold text-primary-foreground bg-primary">
                      {loan.customerName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 z-10 animate-in fade-in slide-in-from-left-2 duration-300">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className={cn("font-bold truncate text-sm transition-colors", selectedId === loan.loanNumber ? "text-primary" : "text-foreground")}>{loan.customerName}</p>
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0 rounded-full flex items-center gap-1",
                          loan.status === 'Active' ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' :
                            loan.status === 'Overdue' ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20' :
                              'text-muted-foreground bg-muted'
                        )}>
                          {loan.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate font-mono tracking-tight opacity-70 mb-1">{loan.loanNumber}</p>
                      <div className="flex justify-between items-end mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded-sm border border-border/50">
                            EMI: ₹{loan.emiAmount?.toLocaleString() ?? 0}
                          </span>
                        </div>

                        {/* Status Logic: If Next Date is Future, show PAID. Else show DUE */}
                        {(() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const nextDate = loan.nextPaymentDate ? new Date(loan.nextPaymentDate) : null;
                          if (nextDate) nextDate.setHours(0, 0, 0, 0);

                          const isPaid = !nextDate || nextDate > today || loan.status === 'Closed';

                          if (isPaid && loan.status !== 'Overdue') {
                            return (
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 className="h-3 w-3" /> {loan.status === 'Closed' ? 'CLOSED' : 'PAID'}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div className="flex flex-col items-end">
                              <span className={cn("text-[8px] font-bold uppercase tracking-widest mb-[1px]", loan.status === 'Overdue' ? "text-red-600" : "text-muted-foreground")}>
                                {loan.status === 'Overdue' ? 'Overdue' : 'Due'}
                              </span>
                              <p className={cn(
                                "text-xs font-bold font-mono",
                                loan.status === 'Overdue' ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                              )}>
                                ₹{(loan.nextPaymentAmount || 0).toLocaleString()}
                              </p>
                            </div>
                          );
                        })()}
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

                <div className="h-9 w-9 hidden md:block">
                  <Avatar className="h-full w-full rounded-lg ring-1 ring-border/50">
                    {selectedLoan.photoUrl ? (
                      <AvatarImage src={selectedLoan.photoUrl} alt={selectedLoan.customerName} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                      {selectedLoan.customerName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h1 className="text-base font-bold leading-none tracking-tight">{selectedLoan.customerName}</h1>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5">
                    {selectedLoan.mobile || "No Mobile"} •
                    {(() => {
                      const txns = selectedLoan.transactions || [];
                      // Find latest payment (excluding this session's if needed, but simplest is latest)
                      if (txns.length === 0) return "No payments yet";
                      const latest = txns.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
                      const diffTime = Math.abs(new Date().getTime() - new Date(latest.date).getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      if (diffDays === 0) return "Paid today";
                      if (diffDays === 1) return "Paid yesterday";
                      return `Last paid ${diffDays}d ago`;
                    })()}
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
                          <th className="px-4 py-3 border-b border-border/50 w-[30%] min-w-[180px]">Particulars</th>
                          <th className="px-4 py-3 border-b border-border/50">Ref No.</th>
                          <th className="px-4 py-3 border-b border-border/50 text-right">Principal</th>
                          <th className="px-4 py-3 border-b border-border/50 text-right text-red-600">Interest</th>
                          <th className="px-4 py-3 border-b border-border/50 text-right text-emerald-600">Total Paid</th>
                          <th className="px-6 py-3 border-b border-border/50 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30 bg-white dark:bg-zinc-950">
                        {ledgerHistory.map((entry, idx) => (
                          <tr key={idx} className="hover:bg-muted/5 transition-colors group">
                            <td className="px-4 py-3 font-mono text-muted-foreground/80">{new Date(entry.date).toLocaleDateString('en-GB')}</td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-foreground/90 truncate max-w-[250px]">{entry.particulars}</div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground font-mono text-[10px]">
                              {entry.refNo || '-'}
                            </td>
                            <td className={cn("px-4 py-3 text-right font-mono text-[11px]", (entry.principalComponent || 0) < 0 ? "text-red-500" : "text-muted-foreground")}>
                              {entry.principalComponent ? Number(entry.principalComponent).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-[11px] text-red-600">
                              {entry.interestComponent ? Number(entry.interestComponent).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                              {entry.credit > 0 ? Number(entry.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                            </td>
                            <td className="px-6 py-3 text-right font-mono font-bold text-foreground bg-muted/5">
                              {entry.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                      <div className="bg-white p-5 rounded-xl border shadow-sm ring-1 ring-black/5 dark:bg-zinc-900/50 space-y-6">

                        {/* 1. Key Metrics (Highlight) */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted/20 p-3 rounded-lg border border-border/50">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Loan Amount</p>
                            <p className="text-xl font-bold text-foreground">₹{selectedLoan.totalLoanAmount.toLocaleString()}</p>
                          </div>
                          <div className="bg-muted/20 p-3 rounded-lg border border-border/50">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">EMI Amount</p>
                            <p className="text-xl font-bold text-primary">₹{selectedLoan.emiAmount.toLocaleString()}</p>
                          </div>
                        </div>

                        <Separator className="bg-border/50" />

                        {/* 2. Detailed Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-4">

                          {/* Row 1: Config */}
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Loan ID</p>
                            <p className="text-sm font-mono font-medium">{selectedLoan.loanNumber}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Scheme</p>
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{selectedLoan.loanScheme} / {selectedLoan.interestType}</Badge>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Frequency</p>
                            <p className="text-sm font-medium">{selectedLoan.repaymentFrequency}</p>
                          </div>

                          {/* Row 2: Terms */}
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Interest Rate</p>
                            <p className="text-sm font-medium">
                              {selectedLoan.interestRateUnit === 'Monthly'
                                ? `${selectedLoan.interestRate}% Monthly (${(selectedLoan.interestRate * 12).toFixed(2)}% Yearly)`
                                : `${selectedLoan.interestRate}% Yearly (${(selectedLoan.interestRate / 12).toFixed(2)}% Monthly)`}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Tenure</p>
                            <p className="text-sm font-medium">{selectedLoan.indefiniteTenure ? 'Indefinite' : `${selectedLoan.tenureMonths} ${selectedLoan.tenureUnit || 'Months'}`}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Disbursal Date</p>
                            <p className="text-sm font-medium">{selectedLoan.disbursedDate ? new Date(selectedLoan.disbursedDate).toLocaleDateString('en-GB') : '-'}</p>
                          </div>

                          {/* Address Row */}
                          <div className="col-span-2 md:col-span-3">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Address</p>
                            <p className="text-sm font-medium leading-relaxed text-foreground/80">{selectedLoan.address || "No Address Provided"}</p>
                          </div>

                          {/* Row 3: Progress */}
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Total Payable</p>
                            <p className="text-sm font-bold text-foreground">
                              {selectedLoan.indefiniteTenure ? 'Variable' : `₹${(selectedLoan.totalPayable || 0).toLocaleString()}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Total Paid</p>
                            <p className="text-sm font-bold text-emerald-600">₹{(selectedLoan.totalPaid || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Next Due</p>
                            <p className="text-sm font-medium">
                              {selectedLoan.nextPaymentDate ? new Date(selectedLoan.nextPaymentDate).toLocaleDateString('en-GB') : 'Completed'}
                            </p>
                          </div>
                        </div>

                        <Separator className="bg-border/50" />

                        {/* 3. Outstanding Summary (Dynamic) */}
                        <div className="bg-red-50/50 dark:bg-red-950/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30 space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Outstanding Balance</span>
                            <span className="font-semibold">
                              ₹{(ledgerHistory.length > 0 ? ledgerHistory[ledgerHistory.length - 1].balance : (selectedLoan.currentPrincipal ?? selectedLoan.totalLoanAmount)).toLocaleString()}
                            </span>
                          </div>

                          {/* Accrued Interest (Only for Reducing/Indefinite) */}
                          {(selectedLoan.interestType === 'Reducing' || selectedLoan.indefiniteTenure) && (selectedLoan.accumulatedInterest || 0) > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Accrued Interest</span>
                              <span className="font-semibold text-blue-600">+ ₹{(selectedLoan.accumulatedInterest || 0).toLocaleString()}</span>
                            </div>
                          )}

                          {/* Outstanding Penalty */}
                          {(selectedLoan.outstandingPenalty || 0) > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Penalty</span>
                              <span className="font-semibold text-red-600">+ ₹{(selectedLoan.outstandingPenalty || 0).toLocaleString()}</span>
                            </div>
                          )}

                          <div className="border-t border-red-200/50 dark:border-red-800/30 pt-2 flex justify-between items-center">
                            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Total to Close</span>
                            <span className="text-lg font-bold text-red-700">
                              ₹{Math.max(0, ledgerHistory.length > 0 ? ledgerHistory[ledgerHistory.length - 1].balance : (selectedLoan.currentPrincipal ?? selectedLoan.totalLoanAmount)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Original Loan Details (Collapsed/Small) */}
                      <div className="pt-2">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                          <span>Original Loan:</span>
                          <span>₹{selectedLoan.totalLoanAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* DOCKED FOOTER */}
            <div className="h-auto border-t bg-white dark:bg-zinc-950 p-2 flex flex-col md:flex-row items-center justify-between z-40 gap-3 shrink-0 overflow-x-auto">
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary dark:bg-primary/20">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0">
                    {/* Dynamic Label */}
                    {(selectedLoan.nextPaymentAmount || 0) <= 0
                      ? "Status"
                      : (new Date(selectedLoan.nextPaymentDate || '') < new Date() ? "Overdue Since" : "Next Due On")
                    }
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xl font-bold tracking-tight",
                      (selectedLoan.nextPaymentAmount || 0) <= 0 ? "text-emerald-600" : "text-foreground"
                    )}>
                      {/* Dynamic Amount */}
                      {(selectedLoan.nextPaymentAmount || 0) <= 0
                        ? "All Caught Up"
                        : `₹${(selectedLoan.nextPaymentAmount || selectedLoan.emiAmount).toLocaleString()}`
                      }
                    </span>

                    {/* Due Date or Overdue Badge */}
                    {(selectedLoan.nextPaymentAmount || 0) > 0 && selectedLoan.nextPaymentDate && (
                      new Date(selectedLoan.nextPaymentDate!) < new Date() ? (
                        <Badge variant="secondary" className="h-4 px-1 text-[9px] font-bold rounded-md bg-red-100/50 text-red-600 border-red-100 hover:bg-red-100">
                          {Math.ceil((new Date().getTime() - new Date(selectedLoan.nextPaymentDate!).getTime()) / (1000 * 3600 * 24))}d Late
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded-sm">
                          {new Date(selectedLoan.nextPaymentDate!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>


              <div className="flex flex-col md:flex-row items-end md:items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                {checkPermission(PERMISSIONS.CREATE_PAYMENT) ? (
                  <>
                    {/* SPLIT TOGGLE (Payment Modes) */}
                    <div className="flex items-center gap-2 mb-2 md:mb-0">
                      <label htmlFor="split-mode" className="text-xs font-bold text-muted-foreground cursor-pointer select-none">Multi-Mode</label>
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

                    {/* MANUAL P/I TOGGLE (New) */}
                    <div className="flex items-center gap-2 mb-2 md:mb-0">
                      <label htmlFor="manual-breakup" className="text-xs font-bold text-muted-foreground cursor-pointer select-none">Manual P/I</label>
                      <Switch
                        id="manual-breakup"
                        checked={isManualBreakup}
                        onCheckedChange={(checked) => {
                          setIsManualBreakup(checked);
                          if (!checked) {
                            setManualPrincipal("");
                            setManualInterest("");
                          }
                        }}
                        className="scale-75"
                        data-state={isManualBreakup ? "checked" : "unchecked"}
                      />
                    </div>

                    {/* Manual P/I Split Inputs (Conditional) */}
                    {isManualBreakup && (
                      <div className="flex items-center gap-2 mb-2 md:mb-0 animate-in slide-in-from-left-2 duration-300">
                        <div className="flex items-center gap-1 bg-white/50 dark:bg-zinc-900/50 rounded-md border px-2 h-9 ring-1 ring-black/5 focus-within:ring-primary/20">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Prin</span>
                          <Input
                            placeholder="0"
                            className="h-8 w-[80px] text-sm border-none bg-transparent p-0 focus-visible:ring-0 font-bold"
                            value={manualPrincipal}
                            onChange={(e) => setManualPrincipal(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-1 bg-white/50 dark:bg-zinc-900/50 rounded-md border px-2 h-9 ring-1 ring-black/5 focus-within:ring-primary/20">
                          <span className="text-[10px] font-bold text-emerald-600/70 uppercase">Int</span>
                          <Input
                            placeholder="0"
                            className="h-8 w-[80px] text-sm border-none bg-transparent p-0 focus-visible:ring-0 font-bold text-emerald-700"
                            value={manualInterest}
                            onChange={(e) => setManualInterest(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div className={cn(
                      "flex gap-2 bg-muted/40 p-1 pr-1.5 pl-2 rounded-md border ring-1 ring-black/5 focus-within:ring-primary/20 transition-all w-full md:w-auto",
                      isSplitMode ? "flex-col items-end h-auto gap-1" : "flex-col md:flex-row items-stretch md:items-center"
                    )}>

                      {selectedLoan.status !== 'Closed' && selectedLoan.status !== 'Rejected' && (!ledgerHistory.length || ledgerHistory[ledgerHistory.length - 1].balance > 0) ? (
                        <>
                          {/* Payment Date (Backdated) */}
                          <div className="flex items-center gap-1 w-full md:w-auto border-b md:border-b-0 border-border/50 pb-1 md:pb-0 mb-1 md:mb-0 shrink-0">
                            <Input
                              type="date"
                              className="h-7 text-xs border-transparent bg-transparent hover:bg-white/50 focus:bg-white focus:border-input transition-colors w-full md:w-[135px] p-0 px-2"
                              value={contributionDate}
                              onChange={(e) => setContributionDate(e.target.value)}
                              max={new Date().toISOString().split('T')[0]} // Prevent future dates
                              min={selectedLoan.disbursedDate} // Prevent pre-disbursement
                            />
                            {!isSplitMode && <div className="hidden md:block h-4 w-[1px] bg-border mx-1" />}
                          </div>

                          {/* Narrative Input (New) */}
                          <div className={cn("flex items-center transition-all w-full md:w-auto mb-1 md:mb-0 shrink-0", isSplitMode ? "w-full" : "w-auto")}>
                            <Input
                              placeholder="Remark / Particulars (Optional)"
                              className="h-7 text-xs border-transparent bg-transparent hover:bg-white/50 focus:bg-white focus:border-input transition-colors w-full md:w-[220px]"
                              value={narrative}
                              onChange={(e) => setNarrative(e.target.value)}
                            />
                            {!isSplitMode && <div className="hidden md:block h-4 w-[1px] bg-border mx-2" />}
                          </div>

                          {payments.map((payment, index) => {
                            // If not split mode, only show first
                            if (!isSplitMode && index > 0) return null;

                            return (
                              <div key={index} className="flex items-center w-full md:w-auto justify-end animate-in slide-in-from-right-2 duration-300">
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

                            {/* Preclose Button */}
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={isSubmitting || (selectedLoan.status as string) === 'Closed' || (selectedLoan.status as string) === 'Rejected' || (selectedLoan.currentPrincipal ?? 1) <= 0}
                              className="h-7 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
                              onClick={() => {
                                // Calculate Total Due based on Ledger (Single Source of Truth)
                                let totalDue = 0;

                                // Prefer Ledger History (Fresh & Accurate) matches "Total to Close" display
                                if (ledgerHistory.length > 0) {
                                  const ledgerBalance = ledgerHistory[ledgerHistory.length - 1].balance;
                                  totalDue = ledgerBalance;
                                } else {
                                  // Fallback to Loan Object (Potentially Stale)
                                  totalDue = (selectedLoan.currentPrincipal || 0) + (selectedLoan.accumulatedInterest || 0);
                                }

                                // Add Penalty (if any) - Assuming it's not in Ledger Balance yet
                                totalDue += (selectedLoan.outstandingPenalty || 0);

                                setPayments([{ mode: "cash", amount: Math.ceil(totalDue).toString() }]);
                                setNarrative("Loan Preclosure / Foreclosure");
                                setIsSplitMode(false);
                              }}
                            >
                              {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Preclose"}
                            </Button>

                            <Button
                              size="sm"
                              disabled={isSubmitting || (selectedLoan.status as string) === 'Closed' || (selectedLoan.status as string) === 'Rejected' || (selectedLoan.currentPrincipal ?? 1) <= 0}
                              className={cn("text-xs font-bold shadow-sm", isSplitMode ? "ml-auto h-7 px-4" : "h-7 px-3")}
                              onClick={handlePayment}
                            >
                              {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                              Collect {isSplitMode && "All"}
                            </Button>
                          </div>
                        </>
                      ) : (
                        /* Closed/Rejected State */
                        <div className="flex items-center justify-center p-3 w-full bg-muted/20 rounded-md border border-dashed text-xs text-muted-foreground font-medium">
                          Loan is {selectedLoan.status}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Permission Denied State */
                  <p className="text-xs text-muted-foreground italic pr-4">You do not have permission to collect payments.</p>
                )}
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
        <Dialog open={showReceipt} onOpenChange={(open) => {
          setShowReceipt(open);
          if (!open) {
            // User closed the receipt. NOW we refresh to show updated ledger.
            window.location.reload();
          }
        }}>
          <DialogContent className="max-w-[fit-content] w-auto p-0 bg-transparent border-none shadow-none text-transparent">
            <DialogTitle className="sr-only">Receipt Preview</DialogTitle>

            <div className="relative bg-white dark:bg-zinc-950 text-foreground rounded-lg shadow-2xl overflow-hidden max-w-[95vw] md:max-w-5xl w-full flex flex-col">
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
                        amount: lastPaymentData.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toString(),
                        paymentMode: lastPaymentData.map(p => p.mode.toUpperCase()).join(' + '),
                        remainingBalance: lastPaymentMetadata?.totalBalance || 0,
                        principal: lastPaymentMetadata?.principalPaid,
                        interest: lastPaymentMetadata?.interestPaid
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
    </div >
  );
}

export default function QuickPaymentPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <QuickPaymentContent />
    </Suspense>
  );
}
