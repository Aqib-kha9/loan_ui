"use client";

import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useSettings } from "@/components/providers/settings-provider";
import { TEMPLATE_REGISTRY } from "@/components/templates/registry";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Search,
  IndianRupee,
  Printer,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  MapPin,
  Calendar,
  Wallet,
  History,
  X
} from "lucide-react";
import { getLoanDetails, LoanAccount } from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function QuickPaymentPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<LoanAccount | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);

  // Settings & Templates
  const { companySettings, printTemplate } = useSettings();
  const selectedTemplate = TEMPLATE_REGISTRY.find(t => t.id === printTemplate) || TEMPLATE_REGISTRY[0];
  const TemplateComponent = selectedTemplate.receiptComponent;

  // Print Logic
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Receipt_${data?.loanNumber || 'New'}`,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const result = getLoanDetails(query);
    if (result) {
      setData(result);
      setPaymentAmount(result.emiAmount.toString());
      toast.success("Customer loaded successfully");
    } else {
      setData(null);
      toast.error("Loan account not found");
    }
  };

  const handlePayment = () => {
    if (!data) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    toast.success("Payment received successfully");
    setShowReceipt(true);
  };

  const clearSession = () => {
    setData(null);
    setQuery("");
    setPaymentAmount("");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950/50 flex flex-col font-sans">

      {/* 1. TOP NAVIGATION BAR */}
      <header className="h-16 border-b bg-white dark:bg-zinc-900 px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">Quick Collect</h1>
            <p className="text-xs text-muted-foreground">Counter Payment Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Today&apos;s Collection</p>
            <p className="text-lg font-bold font-mono text-emerald-600">₹42,500</p>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-4 max-w-7xl w-full">

        {/* SEARCH BAR (Always Visible) */}
        <div className="mb-4 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative flex shadow-sm rounded-full overflow-hidden bg-white dark:bg-zinc-900 border border-primary/10 focus-within:border-primary transition-all">
            <div className="pl-4 pr-3 flex items-center justify-center text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <Input
              className="h-10 border-none shadow-none text-base px-0 placeholder:text-muted-foreground/50 focus-visible:ring-0"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <Button type="submit" size="sm" className="rounded-none px-6 font-semibold h-auto">
              Search
            </Button>
          </form>
        </div>

        {/* CONTENT: EITHER EMPTY STATE OR CUSTOMER DASHBOARD */}
        {data ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* LEFT COLUMN: CUSTOMER PROFILE (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  Customer Details
                  <Badge variant={data.status === 'Active' ? 'default' : 'secondary'}>{data.status}</Badge>
                </h2>
                <Button variant="ghost" size="sm" onClick={clearSession} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4 mr-2" /> Clear Session
                </Button>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className="h-24 w-24 border-4 border-muted">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${data.customerName}&background=random&size=128`} />
                      <AvatarFallback className="text-2xl">{data.customerName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <h3 className="text-2xl font-bold">{data.customerName}</h3>
                        <p className="text-muted-foreground font-mono flex items-center gap-2 mt-1">
                          {data.loanNumber}
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                          <Smartphone className="h-4 w-4 text-gray-400" /> {data.mobile}
                        </p>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Total Loan Amount</p>
                          <p className="font-semibold text-lg">₹{data.totalLoanAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Monthly EMI</p>
                          <p className="font-semibold text-lg text-primary">₹{data.emiAmount.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Address</p>
                          <p className="font-medium">{data.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" /> Last Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {data.transactions?.slice(0, 3).map((txn) => (
                      <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 text-green-700 p-2 rounded-full">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{txn.type}</p>
                            <p className="text-xs text-muted-foreground">{txn.date}</p>
                          </div>
                        </div>
                        <p className="font-bold font-mono">₹{txn.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: PAYMENT FORM (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xl font-semibold mb-2">Process Payment</h2>
              <Card className="border-t-4 border-t-primary shadow-lg">
                <CardHeader className="bg-muted/10 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-primary" />
                    Receive EMI
                  </CardTitle>
                  <CardDescription>Enter the amount received from customer</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="amount" className="text-base">Amount (₹)</Label>
                        <span
                          className="text-sm font-medium text-primary cursor-pointer hover:underline"
                          onClick={() => setPaymentAmount(data.emiAmount.toString())}
                        >
                          Autofill EMI: ₹{data.emiAmount}
                        </span>
                      </div>
                      <Input
                        id="amount"
                        type="number"
                        className="h-14 text-2xl font-bold px-4"
                        placeholder="0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg bg-muted/5">
                        <p className="text-xs text-muted-foreground uppercase font-bold text-center mb-1">Current Due</p>
                        <p className="text-xl font-bold text-center text-destructive">₹{data.emiAmount}</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-muted/5">
                        <p className="text-xs text-muted-foreground uppercase font-bold text-center mb-1">Mode</p>
                        <p className="text-xl font-bold text-center text-foreground">Cash</p>
                      </div>
                    </div>
                  </div>

                  <Button size="lg" className="w-full text-lg h-12 font-bold" onClick={handlePayment}>
                    Accept Payment <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                </CardContent>
                <CardFooter className="bg-muted/20 text-xs text-muted-foreground justify-center py-3">
                  <p><Printer className="h-3 w-3 inline mr-1" /> Receipt will be generated automatically upon confirmation.</p>
                </CardFooter>
              </Card>
            </div>

          </div>
        ) : (
          /* EMPTY STATE: INSTRUCTIONAL */
          <div className="mt-20 text-center opacity-80 max-w-lg mx-auto">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Ready to Collect</h3>
            <p className="text-muted-foreground mt-2 text-lg">
              Enter the customer's Loan Number or Name above to verify details and accept payment.
            </p>
            <div className="mt-8 flex justify-center gap-4 text-sm text-muted-foreground">
              <span className="bg-white dark:bg-zinc-900 border px-3 py-1 rounded shadow-sm">Try "LN001"</span>
              <span className="bg-white dark:bg-zinc-900 border px-3 py-1 rounded shadow-sm">Try "Rahul"</span>
            </div>
          </div>
        )}

      </main>

      {/* RECEIPT MODAL */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-7xl w-full h-[90vh] flex flex-col p-0 gap-0 bg-zinc-100 dark:bg-zinc-900">
          <div className="p-4 border-b bg-white dark:bg-zinc-950 flex justify-between items-center shadow-sm z-10">
            <DialogTitle>Transaction Receipt</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowReceipt(false)}>Close</Button>
              <Button onClick={() => handlePrint && handlePrint()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-8 flex justify-center bg-gray-500/10">
            <div className="bg-white shadow-xl w-full max-w-[210mm] min-h-[297mm] p-0" ref={componentRef}>
              {data && (
                <TemplateComponent
                  data={{
                    ...data,
                    amount: paymentAmount,
                    customerName: data.customerName,
                    loanAccountNo: data.loanNumber
                  }}
                  company={companySettings}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
