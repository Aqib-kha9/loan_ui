"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
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
    MoreHorizontal,
    Phone,
    MapPin,
    CreditCard,
    Users,
    FileText,
    ShieldCheck,
    Building2,
    Calendar,
    Wallet,
    Printer,
    X
} from "lucide-react";
import { MOCK_LOANS, LoanAccount } from "@/lib/mock-data";

export default function ClientsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClient, setSelectedClient] = useState<LoanAccount | null>(null);

    const filteredClients = MOCK_LOANS.filter(client =>
        client.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.mobile.includes(searchTerm)
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 min-h-screen bg-muted/5">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
                    <p className="text-muted-foreground mt-1">Manage all your loan customers and their detailed profiles.</p>
                </div>
                <Link href="/loans/new">
                    <Button className="shadow-lg"><Plus className="mr-2 h-4 w-4" /> Add New Customer</Button>
                </Link>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="flex gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by Name, Loan ID, Mobile..."
                        className="pl-9 bg-muted/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter Status</Button>
            </div>

            {/* DATA TABLE */}
            <Card className="shadow-md border-0 overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Loan Info</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClients.map((client) => (
                            <TableRow
                                key={client.loanNumber}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => setSelectedClient(client)}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border bg-background">
                                            <AvatarImage src={`https://ui-avatars.com/api/?name=${client.customerName}&background=random`} />
                                            <AvatarFallback>{client.customerName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{client.customerName}</span>
                                            <span className="text-xs text-muted-foreground font-mono">{client.loanNumber}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-sm">
                                        <span className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-muted-foreground" /> {client.mobile}</span>
                                        <span className="flex items-center gap-1.5 truncate max-w-[180px]" title={client.address}>
                                            <MapPin className="h-3 w-3 text-muted-foreground" /> {client.address}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-sm">
                                        <span className="font-medium">₹{client.totalLoanAmount.toLocaleString()}</span>
                                        <span className="text-xs text-muted-foreground">{client.loanType} Loan</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={client.status === 'Active' ? 'default' : client.status === 'Closed' ? 'secondary' : 'destructive'}>
                                        {client.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* DETAILS MODAL (Replaced Sheet) */}
            <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
                <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col bg-card">
                    {selectedClient && (
                        <>
                            {/* MODAL HEADER: CLIENT SUMMARY */}
                            <div className="bg-zinc-900 text-white p-6 shrink-0 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-30" />
                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <Avatar className="h-16 w-16 border-2 border-white/20 shadow-lg">
                                            <AvatarImage src={`https://ui-avatars.com/api/?name=${selectedClient.customerName}&background=random&size=128`} />
                                            <AvatarFallback>{selectedClient.customerName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="text-2xl font-bold">{selectedClient.customerName}</h2>
                                            <p className="text-white/70 flex items-center gap-2 text-sm mt-1">
                                                <ShieldCheck className="h-4 w-4 text-emerald-400" /> KYC Verified
                                                <span className="opacity-50">|</span>
                                                <span className="font-mono bg-white/10 px-1.5 rounded">{selectedClient.loanNumber}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setSelectedClient(null)}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* TABS & CONTENT */}
                            <Tabs defaultValue="personal" className="flex-1 flex flex-col overflow-hidden">
                                <div className="border-b px-6 bg-muted/30">
                                    <TabsList className="bg-transparent h-12 w-full justify-start gap-8 p-0">
                                        <TabsTrigger value="personal" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-0 bg-transparent text-muted-foreground font-medium">Personal</TabsTrigger>
                                        <TabsTrigger value="loan" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-0 bg-transparent text-muted-foreground font-medium">Loan Info</TabsTrigger>
                                        <TabsTrigger value="guarantor" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-0 bg-transparent text-muted-foreground font-medium">Guarantor</TabsTrigger>
                                        <TabsTrigger value="bank" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-0 bg-transparent text-muted-foreground font-medium">Bank & KYC</TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="flex-1 overflow-y-auto bg-muted/5">
                                    <div className="p-6 md:p-8 space-y-8 max-w-3xl mx-auto">

                                        <TabsContent value="personal" className="space-y-6 mt-0 animate-in fade-in duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                                <InfoItem label="Father's Name" value={selectedClient.fatherName} icon={Users} />
                                                <InfoItem label="Date of Birth" value={selectedClient.dob} icon={Calendar} />
                                                <InfoItem label="Gender" value={selectedClient.gender} />
                                                <InfoItem label="Occupation" value={selectedClient.occupation} />
                                                <InfoItem label="Primary Mobile" value={selectedClient.mobile} icon={Phone} />
                                                <InfoItem label="Alternate Mobile" value={selectedClient.altMobile || "-"} />
                                                <InfoItem label="Email" value={selectedClient.email || "-"} className="col-span-full" />
                                            </div>
                                            <Separator />
                                            <div className="space-y-4">
                                                <h4 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" /> Addresses</h4>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="p-4 rounded-lg border bg-background">
                                                        <span className="text-xs text-muted-foreground uppercase block mb-1">Current</span>
                                                        <p className="text-sm">{selectedClient.address}</p>
                                                    </div>
                                                    <div className="p-4 rounded-lg border bg-background">
                                                        <span className="text-xs text-muted-foreground uppercase block mb-1">Permanent</span>
                                                        <p className="text-sm">{selectedClient.permanentAddress || "Same as Current"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="loan" className="space-y-6 mt-0 animate-in fade-in duration-300">
                                            <div className="grid grid-cols-2 gap-6">
                                                <Card className="col-span-2 bg-primary/5 border-primary/20">
                                                    <CardContent className="p-6 flex justify-around items-center text-center">
                                                        <div>
                                                            <p className="text-sm text-muted-foreground uppercase font-bold">Principal Amount</p>
                                                            <p className="text-3xl font-bold mt-1">₹{selectedClient.totalLoanAmount.toLocaleString()}</p>
                                                        </div>
                                                        <div className="h-12 w-px bg-primary/20" />
                                                        <div>
                                                            <p className="text-sm text-muted-foreground uppercase font-bold">Monthly EMI</p>
                                                            <p className="text-3xl font-bold text-primary mt-1">₹{selectedClient.emiAmount.toLocaleString()}</p>
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

                                        <TabsContent value="guarantor" className="space-y-6 mt-0 animate-in fade-in duration-300">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base">Guarantor Profile</CardTitle>
                                                </CardHeader>
                                                <CardContent className="grid md:grid-cols-2 gap-6">
                                                    <InfoItem label="Full Name" value={selectedClient.guarantorName} />
                                                    <InfoItem label="Relationship" value={selectedClient.guarantorRelation} />
                                                    <InfoItem label="Mobile Number" value={selectedClient.guarantorMobile} />
                                                    <InfoItem label="Aadhar Number" value={selectedClient.guarantorAadhar || "-"} />
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="bank" className="space-y-6 mt-0 animate-in fade-in duration-300">
                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-base flex gap-2"><Building2 className="h-4 w-4" /> Banking Info</CardTitle>
                                                </CardHeader>
                                                <CardContent className="grid md:grid-cols-2 gap-6">
                                                    <InfoItem label="Bank Name" value={selectedClient.bankName || "-"} />
                                                    <InfoItem label="IFSC Code" value={selectedClient.ifscCode || "-"} />
                                                    <InfoItem label="Account Number" value={selectedClient.accountNo || "-"} className="col-span-full font-mono text-lg" />
                                                </CardContent>
                                            </Card>

                                            <Separator />

                                            <div className="space-y-4">
                                                <h4 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> KYC Documents</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 border rounded-xl flex items-center gap-4 bg-muted/5">
                                                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold">Aadhar Card</p>
                                                            <p className="text-xs font-mono text-muted-foreground">{selectedClient.aadharNo}</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 border rounded-xl flex items-center gap-4 bg-muted/5">
                                                        <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold">PAN Card</p>
                                                            <p className="text-xs font-mono text-muted-foreground">{selectedClient.panNo}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                    </div>
                                </div>

                                {/* FOOTER ACTIONS */}
                                <div className="p-4 md:px-8 border-t bg-background flex justify-between items-center shrink-0">
                                    <Button variant="outline">Edit Profile</Button>
                                    <div className="flex gap-2">
                                        <Button variant="secondary"><Printer className="h-4 w-4 mr-2" /> Print Profile</Button>
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
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
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

function SectionHeader({ icon: Icon, title }: { icon: any, title: string }) {
    return (
        <div className="flex items-center gap-2 text-primary pb-2 border-b border-dashed">
            <Icon className="h-5 w-5" />
            <h3 className="font-semibold text-sm uppercase tracking-wide">{title}</h3>
        </div>
    );
}

function InfoItem({ label, value, icon: Icon, className }: { label: string, value: string, icon?: any, className?: string }) {
    return (
        <div className={className}>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                {Icon && <Icon className="h-3 w-3" />}
                {label}
            </p>
            <p className="text-base font-medium text-foreground">{value}</p>
        </div>
    );
}
