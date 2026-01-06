"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    Search,
    Plus,
    Filter,
    Phone,
    MapPin,
    Users,
    FileText,
    ShieldCheck,
    Building2,
    Calendar,
    Printer,
    X,
    MoreHorizontal,
    LayoutGrid,
    List as ListIcon
} from "lucide-react";
import { MOCK_LOANS, LoanAccount } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function ClientsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClient, setSelectedClient] = useState<LoanAccount | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const filteredClients = MOCK_LOANS.filter(client =>
        client.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.mobile.includes(searchTerm)
    );

    return (
        <div className="-m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] h-[calc(100vh-5rem)] flex flex-col bg-muted/5 overflow-hidden">

            {/* STICKY HEADER */}
            <header className="h-16 border-b bg-background/80 backdrop-blur z-20 sticky top-0 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight leading-none">Customers</h1>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">{filteredClients.length} Active Profiles</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative hidden md:block w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search clients..."
                            className="pl-9 h-9 bg-muted/50 border-transparent focus:bg-background focus:border-input transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Separator orientation="vertical" className="h-8 hidden md:block" />

                    {/* View Toggle */}
                    <div className="bg-muted/50 p-1 rounded-lg border hidden md:flex">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-7 w-7 rounded-md", viewMode === "grid" && "bg-white shadow-sm")}
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-7 w-7 rounded-md", viewMode === "list" && "bg-white shadow-sm")}
                            onClick={() => setViewMode("list")}
                        >
                            <ListIcon className="h-4 w-4" />
                        </Button>
                    </div>

                    <Link href="/loans/new">
                        <Button className="h-9 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                            <Plus className="mr-2 h-4 w-4" /> Add Customer
                        </Button>
                    </Link>
                </div>
            </header>

            {/* SCROLLABLE CONTENT */}
            <main className="flex-1 overflow-y-auto p-2 md:p-4">
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredClients.map((client) => (
                            <div
                                key={client.loanNumber}
                                onClick={() => setSelectedClient(client)}
                                className="group relative bg-white dark:bg-zinc-900 rounded-2xl border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                            >
                                {/* Header / Cover */}
                                <div className="h-16 bg-muted/30 border-b relative">
                                    <div className="absolute top-3 right-3">
                                        <Badge variant={client.status === 'Active' ? 'default' : 'secondary'} className="shadow-sm">
                                            {client.status}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-5 pb-5 flex-1 flex flex-col -mt-8">
                                    {/* Avatar */}
                                    <Avatar className="h-16 w-16 border-4 border-white dark:border-zinc-900 shadow-md">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                                            {client.customerName.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="mt-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{client.customerName}</h3>
                                                <p className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-1">
                                                    <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{client.loanNumber}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-3.5 w-3.5" />
                                                <span className="text-foreground font-medium">{client.mobile}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="truncate max-w-[200px]">{client.address}</span>
                                            </div>
                                        </div>

                                        <Separator className="my-4" />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Exposure</p>
                                                <p className="font-bold text-base">₹{client.totalLoanAmount.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground">EMI</p>
                                                <p className="font-bold text-base text-primary">₹{client.emiAmount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm overflow-hidden">
                        {filteredClients.map((client, i) => (
                            <div
                                key={client.loanNumber}
                                onClick={() => setSelectedClient(client)}
                                className={cn(
                                    "flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-colors gap-4",
                                    i !== filteredClients.length - 1 && "border-b"
                                )}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                        {client.customerName.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                    <div>
                                        <p className="font-semibold text-sm">{client.customerName}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{client.loanNumber}</p>
                                    </div>
                                    <div className="text-sm flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                        {client.mobile}
                                    </div>
                                    <div className="text-sm font-medium">
                                        ₹{client.totalLoanAmount.toLocaleString()} <span className="text-muted-foreground font-normal text-xs">Loan</span>
                                    </div>
                                    <div>
                                        <Badge variant="outline" className={cn("text-[10px]", client.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : '')}>
                                            {client.status}
                                        </Badge>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* DETAILS MODAL - PRESERVED & STYLED */}
            <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
                <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col bg-card border-none shadow-2xl">
                    {selectedClient && (
                        <>
                            {/* MODAL HEADER */}
                            <div className="bg-zinc-900 text-white p-6 shrink-0 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent opacity-40 mix-blend-overlay" />
                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="flex gap-5">
                                        <Avatar className="h-20 w-20 border-4 border-white/10 shadow-xl ring-1 ring-black/20">
                                            <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                                                {selectedClient.customerName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="text-3xl font-bold tracking-tight">{selectedClient.customerName}</h2>
                                            <p className="text-zinc-400 flex items-center gap-3 text-sm mt-2 font-medium">
                                                <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck className="h-4 w-4" /> KYC Verified</span>
                                                <span className="opacity-20">|</span>
                                                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-xs">{selectedClient.loanNumber}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 p-0" onClick={() => setSelectedClient(null)}>
                                        <X className="h-6 w-6" />
                                    </Button>
                                </div>
                            </div>

                            {/* TABS & CONTENT */}
                            <Tabs defaultValue="personal" className="flex-1 flex flex-col overflow-hidden bg-muted/5">
                                <div className="border-b px-6 bg-white dark:bg-zinc-900 shadow-sm z-10">
                                    <TabsList className="bg-transparent h-14 w-full justify-start gap-8 p-0">
                                        {['Personal', 'Loan Info', 'Guarantor', 'Documents'].map(tab => (
                                            <TabsTrigger
                                                key={tab}
                                                value={tab.toLowerCase().split(' ')[0]}
                                                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-0 bg-transparent text-muted-foreground font-semibold text-sm hover:text-foreground transition-colors"
                                            >
                                                {tab}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                <div className="flex-1 overflow-y-auto">
                                    <div className="p-8 max-w-5xl mx-auto space-y-8">
                                        <TabsContent value="personal" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                                <InfoItem label="Father's Name" value={selectedClient.fatherName} icon={Users} />
                                                <InfoItem label="Date of Birth" value={selectedClient.dob} icon={Calendar} />
                                                <InfoItem label="Gender" value={selectedClient.gender} />
                                                <InfoItem label="Occupation" value={selectedClient.occupation} />
                                                <InfoItem label="Primary Mobile" value={selectedClient.mobile} icon={Phone} className="bg-primary/5 p-3 rounded-lg border border-primary/10" />
                                                <InfoItem label="Alternate Mobile" value={selectedClient.altMobile || "-"} />
                                                <InfoItem label="Email" value={selectedClient.email || "-"} className="col-span-full" />
                                            </div>
                                            <Separator />
                                            <div className="space-y-4">
                                                <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground"><MapPin className="h-4 w-4" /> Addresses</h4>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="p-5 rounded-xl border bg-white dark:bg-zinc-900 shadow-sm">
                                                        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-muted-foreground font-bold uppercase block w-fit mb-2">Current</span>
                                                        <p className="text-sm font-medium leading-relaxed">{selectedClient.address}</p>
                                                    </div>
                                                    <div className="p-5 rounded-xl border bg-white dark:bg-zinc-900 shadow-sm">
                                                        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-muted-foreground font-bold uppercase block w-fit mb-2">Permanent</span>
                                                        <p className="text-sm font-medium leading-relaxed">{selectedClient.permanentAddress || "Same as Current"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="loan" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="grid grid-cols-2 gap-6">
                                                <Card className="col-span-2 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border-primary/20 shadow-sm">
                                                    <CardContent className="p-8 flex justify-around items-center text-center">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Principal Amount</p>
                                                            <p className="text-4xl font-bold mt-2 tracking-tight">₹{selectedClient.totalLoanAmount.toLocaleString()}</p>
                                                        </div>
                                                        <div className="h-16 w-px bg-primary/20" />
                                                        <div>
                                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Monthly EMI</p>
                                                            <p className="text-4xl font-bold text-primary mt-2 tracking-tight">₹{selectedClient.emiAmount.toLocaleString()}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <InfoItem label="Loan Type" value={selectedClient.loanType} />
                                                <InfoItem label="Current Status" value={selectedClient.status} />
                                                <InfoItem label="Interest Rate" value={`${selectedClient.interestRate}% p.a.`} />
                                                <InfoItem label="Tenure" value={`${selectedClient.tenureMonths} Months`} />
                                                <InfoItem label="Disbursment Date" value={selectedClient.disbursedDate} />
                                                <InfoItem label="EMIs Completed" value={selectedClient.emisPaid.toString()} />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="guarantor" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <Card className="shadow-sm">
                                                <CardHeader className="bg-muted/30 pb-4 border-b">
                                                    <CardTitle className="text-base font-bold">Guarantor Profile</CardTitle>
                                                </CardHeader>
                                                <CardContent className="grid md:grid-cols-2 gap-8 p-6">
                                                    <InfoItem label="Full Name" value={selectedClient.guarantorName} />
                                                    <InfoItem label="Relationship" value={selectedClient.guarantorRelation} />
                                                    <InfoItem label="Mobile Number" value={selectedClient.guarantorMobile} className="bg-muted/20 p-2 rounded" />
                                                    <InfoItem label="Aadhar Number" value={selectedClient.guarantorAadhar || "-"} />
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="documents" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <Card className="shadow-sm">
                                                <CardHeader className="pb-3 border-b bg-muted/30">
                                                    <CardTitle className="text-base flex gap-2 font-bold"><Building2 className="h-4 w-4" /> Banking Info</CardTitle>
                                                </CardHeader>
                                                <CardContent className="grid md:grid-cols-2 gap-6 p-6">
                                                    <InfoItem label="Bank Name" value={selectedClient.bankName || "-"} />
                                                    <InfoItem label="IFSC Code" value={selectedClient.ifscCode || "-"} />
                                                    <InfoItem label="Account Number" value={selectedClient.accountNo || "-"} className="col-span-full font-mono text-xl bg-muted/20 p-3 rounded border border-dashed" />
                                                </CardContent>
                                            </Card>

                                            <Separator />

                                            <div className="space-y-4">
                                                <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground"><FileText className="h-4 w-4" /> KYC Documents</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 border rounded-xl flex items-center gap-4 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                                        <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                            <FileText className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold">Aadhar Card</p>
                                                            <p className="text-xs font-mono text-muted-foreground group-hover:text-blue-600 transition-colors">{selectedClient.aadharNo}</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 border rounded-xl flex items-center gap-4 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                                        <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                            <FileText className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold">PAN Card</p>
                                                            <p className="text-xs font-mono text-muted-foreground group-hover:text-emerald-600 transition-colors">{selectedClient.panNo}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </div>

                                {/* FOOTER ACTIONS */}
                                <div className="p-4 md:px-8 border-t bg-background flex justify-between items-center shrink-0 z-20">
                                    <Button variant="outline" className="font-semibold">Edit Profile</Button>
                                    <div className="flex gap-3">
                                        <Button variant="secondary" className="font-semibold shadow-sm"><Printer className="h-4 w-4 mr-2" /> Print Profile</Button>
                                        <NewLoanDialog client={selectedClient} />
                                    </div>
                                </div>
                            </Tabs>
                        </>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}

function NewLoanDialog({ client }: { client: LoanAccount }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Grant New Loan
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>New Loan Assignment</DialogTitle>
                    <DialogDescription>
                        Assigning a new loan to existing client <b>{client.customerName}</b>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="col-span-2 p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-100 mb-2">
                        <p className="font-semibold">Current Active Loan: {client.loanNumber}</p>
                        <p>Status: {client.status} • EMI: ₹{client.emiAmount}</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Loan Amount (₹)</Label>
                        <Input placeholder="e.g. 50000" type="number" className="font-semibold" />
                    </div>
                    <div className="space-y-2">
                        <Label>Interest Rate (%)</Label>
                        <Input defaultValue="12" type="number" />
                    </div>

                    <div className="space-y-2">
                        <Label>Tenure (Months)</Label>
                        <Input defaultValue="12" type="number" />
                    </div>
                    <div className="space-y-2">
                        <Label>Loan Type</Label>
                        <Input defaultValue="Personal" />
                    </div>

                    <div className="col-span-2 space-y-2 pt-2">
                        <Label>Guarantor Verification</Label>
                        <div className="flex items-center justify-between p-3 border rounded-md">
                            <div className="text-sm">
                                <p className="font-medium">{client.guarantorName}</p>
                                <p className="text-muted-foreground">{client.guarantorRelation}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Verified</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={() => { toast.success("New Loan Assigned!"); setOpen(false); }}>
                        Review & Disburse
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function InfoItem({ label, value, icon: Icon, className }: { label: string, value: string, icon?: any, className?: string }) {
    return (
        <div className={className}>
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 flex items-center gap-1.5 tracking-wider">
                {Icon && <Icon className="h-3 w-3" />}
                {label}
            </p>
            <p className="text-base font-medium text-foreground">{value}</p>
        </div>
    );
}
