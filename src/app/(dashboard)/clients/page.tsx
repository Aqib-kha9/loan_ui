"use client";

import { useState, useEffect, useRef } from "react";
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
    List as ListIcon,
    Upload,
    Trash2,
    AlertCircle
} from "lucide-react";
import { LoanAccount } from "@/lib/mock-data";
import { mapLoanToFrontend } from "@/lib/mapper";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { PERMISSIONS } from "@/lib/constants/permissions";
import AccessDenied from "@/components/auth/access-denied";


export default function ClientsPage() {
    const { user, checkPermission, isLoading: authLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClient, setSelectedClient] = useState<LoanAccount | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeletingClient, setIsDeletingClient] = useState(false);

    const handleDeleteClient = async () => {
        if (!selectedClient) return;

        setIsDeletingClient(true);
        const toastId = toast.loading("Deleting profile...");
        try {
            const res = await fetch(`/api/clients/${selectedClient.clientId}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to delete");

            toast.success("Profile deleted successfully", { id: toastId });
            setIsDeleteDialogOpen(false);
            window.location.reload();
        } catch (err: any) {
            toast.error(err.message, { id: toastId });
        } finally {
            setIsDeletingClient(false);
        }
    };
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [clients, setClients] = useState<LoanAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await fetch('/api/loans');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.loans)) {
                        const mappedClients = data.loans.map((l: any) => mapLoanToFrontend(l));
                        setClients(mappedClients);
                    } else {
                        setClients([]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch clients", error);
                toast.error("Failed to load clients");
                setClients([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchClients();
    }, []);

    if (authLoading) return null;
    if (!checkPermission(PERMISSIONS.VIEW_CLIENTS)) return <AccessDenied message="You do not have permission to view clients." />;

    const filteredClients = clients.filter(client =>
        client.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.mobile.includes(searchTerm)
    );

    return (
        <div className="-m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] h-[calc(100vh-1rem)] flex flex-col bg-muted/5 overflow-hidden">

            {/* STICKY HEADER */}
            <header className="h-16 border-b bg-background/80 backdrop-blur z-20 sticky top-0 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight leading-none">Customers</h1>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">{filteredClients.length} Total Profiles</p>
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

                    {checkPermission(PERMISSIONS.CREATE_CLIENT) && (
                        <Link href="/loans/new">
                            <Button className="h-9 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                                <Plus className="mr-2 h-4 w-4" /> Add Customer
                            </Button>
                        </Link>
                    )}
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
                                        <AvatarImage src={client.photoUrl} alt={client.customerName} className="object-cover" />
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
                                    <AvatarImage src={client.photoUrl} alt={client.customerName} className="object-cover" />
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
                <DialogContent className="w-[95vw] sm:max-w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden flex flex-row bg-background border-border shadow-2xl rounded-xl outline-none">
                    {selectedClient && (
                        <Tabs defaultValue="personal" orientation="vertical" className="flex w-full h-full">

                            {/* LEFT SIDEBAR */}
                            <div className="w-80 bg-muted/40 border-r border-border p-6 flex flex-col shrink-0">
                                <div className="flex flex-col items-center text-center mb-8">
                                    <Avatar className="h-28 w-28 border-4 border-background shadow-md mb-4 bg-background">
                                        <AvatarImage src={selectedClient.photoUrl} alt={selectedClient.customerName} className="object-cover" />
                                        <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold">
                                            {selectedClient.customerName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-xl font-bold tracking-tight text-foreground">{selectedClient.customerName}</h2>
                                    <p className="text-sm text-muted-foreground font-mono mt-1 mb-4">{selectedClient.loanNumber}</p>

                                    <div className="flex gap-2 justify-center">
                                        <Badge variant={selectedClient.status === 'Active' ? 'default' : 'secondary'} className="px-3 rounded-full">
                                            {selectedClient.status}
                                        </Badge>
                                        <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold border border-primary/20">
                                            <ShieldCheck className="h-3 w-3" /> VERIFIED
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1 w-full flex-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Menu</p>
                                    <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-1 w-full items-stretch">
                                        {['Personal', 'Loan Info'].map(tab => (
                                            <TabsTrigger
                                                key={tab}
                                                value={tab.toLowerCase().split(' ')[0]}
                                                className="justify-start px-4 py-2.5 h-auto text-sm font-medium rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted transition-all"
                                            >
                                                {tab}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                <div className="mt-auto pt-6 border-t border-border">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-3 px-2">Actions</p>
                                    <div className="grid gap-2">
                                        {checkPermission(PERMISSIONS.EDIT_CLIENT) && (
                                            <EditProfileDialog client={selectedClient} onUpdate={(updated) => {
                                                // Optimistic update or refresh logic
                                                setSelectedClient({ ...selectedClient, ...updated });
                                                // Trigger global refresh if needed, for now modifying local state
                                                window.location.reload(); // Simple reload to resync everything for now
                                            }} />
                                        )}


                                        {checkPermission(PERMISSIONS.DELETE_CLIENT) && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full justify-start font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                                onClick={() => setIsDeleteDialogOpen(true)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Profile
                                            </Button>
                                        )}

                                        {checkPermission(PERMISSIONS.CREATE_LOAN) && (
                                            <Link href={`/loans/new?clientId=${selectedClient.clientId}`} passHref>
                                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold justify-start">
                                                    <Plus className="mr-2 h-4 w-4" /> Grant New Loan
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT CONTENT */}
                            <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
                                <div className="absolute top-4 right-4 z-50">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted" onClick={() => setSelectedClient(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8">
                                    <TabsContent value="personal" className="space-y-8 mt-0 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div>
                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                                <Users className="h-5 w-5 text-primary" /> Contact Information
                                            </h3>
                                            <Card className="p-0 overflow-hidden bg-card border-border shadow-sm">
                                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                                                    <div className="p-6">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mobile Number</label>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className="text-lg font-mono font-medium">{selectedClient.mobile}</span>

                                                        </div>
                                                    </div>
                                                    <div className="p-6">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                                                        <p className="mt-1 text-lg font-medium">{selectedClient.email || "-"}</p>
                                                    </div>
                                                </div>
                                                <div className="p-6 border-t border-border bg-muted/20">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Residence Address</label>
                                                    <p className="mt-1 text-base leading-relaxed max-w-2xl">{selectedClient.address} </p>
                                                </div>
                                            </Card>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                                <ShieldCheck className="h-5 w-5 text-primary" /> Identity Proofs
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Card className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
                                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-muted-foreground uppercase">Aadhar Number</p>
                                                        <p className="text-base font-mono font-bold">{selectedClient.aadharNo}</p>
                                                    </div>
                                                </Card>
                                                <Card className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
                                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-muted-foreground uppercase">PAN Number</p>
                                                        <p className="text-base font-mono font-bold">{selectedClient.panNo}</p>
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="loan" className="space-y-6 mt-0 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <Card className="bg-primary text-primary-foreground border-none shadow-lg">
                                            <CardContent className="p-8 flex justify-around items-center text-center">
                                                <div>
                                                    <p className="text-xs opacity-80 uppercase font-bold tracking-wider">Principal Amount</p>
                                                    <p className="text-4xl font-bold mt-2 tracking-tight">₹{selectedClient.totalLoanAmount.toLocaleString()}</p>
                                                </div>
                                                <div className="h-16 w-px bg-primary-foreground/20" />
                                                <div>
                                                    <p className="text-xs opacity-80 uppercase font-bold tracking-wider">{selectedClient.repaymentFrequency || 'Monthly'} EMI</p>
                                                    <p className="text-4xl font-bold mt-2 tracking-tight">₹{selectedClient.emiAmount.toLocaleString()}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoItem label="Scheme" value={`${selectedClient.loanScheme} / ${selectedClient.interestType}`} className="p-4 border rounded-xl bg-card" />
                                            <InfoItem label="Repayment Freq." value={selectedClient.repaymentFrequency || 'Monthly'} className="p-4 border rounded-xl bg-card" />

                                            <InfoItem
                                                label="Interest Rate"
                                                value={selectedClient.interestRateUnit === 'Monthly'
                                                    ? `${selectedClient.interestRate}% Monthly (${(selectedClient.interestRate * 12).toFixed(2)}% Yearly)${selectedClient.interestPaidInAdvance ? ' (Adv.)' : ''}`
                                                    : `${selectedClient.interestRate}% Yearly (${(selectedClient.interestRate / 12).toFixed(2)}% Monthly)${selectedClient.interestPaidInAdvance ? ' (Adv.)' : ''}`}
                                                className="p-4 border rounded-xl bg-card"
                                            />

                                            <InfoItem
                                                label="Tenure"
                                                value={selectedClient.indefiniteTenure ? "Indefinite" : `${selectedClient.tenureMonths} ${selectedClient.tenureUnit || 'Months'}`}
                                                className="p-4 border rounded-xl bg-card"
                                            />

                                            <InfoItem
                                                label="Disbursal Date"
                                                value={selectedClient.disbursedDate ? new Date(selectedClient.disbursedDate).toLocaleDateString('en-GB') : '-'}
                                                className="p-4 border rounded-xl bg-card"
                                                icon={Calendar}
                                            />

                                            <InfoItem
                                                label="Current Status"
                                                value={selectedClient.status}
                                                className={cn("p-4 border rounded-xl bg-card", selectedClient.status === 'Active' ? 'text-emerald-600' : 'text-muted-foreground')}
                                            />
                                        </div>
                                    </TabsContent>
                                </div>
                            </div>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>

            {selectedClient && (
                <DeleteConfirmationDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    onConfirm={handleDeleteClient}
                    isDeleting={isDeletingClient}
                />
            )}
        </div>
    );
}

function NewLoanDialog({ client }: { client: LoanAccount }) {
    const [open, setOpen] = useState(false);
    const [loanScheme, setLoanScheme] = useState("EMI");
    const [interestType, setInterestType] = useState("Reducing");
    const [repaymentFreq, setRepaymentFreq] = useState("Monthly");
    const [interestPaidInAdvance, setInterestPaidInAdvance] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Grant New Loan
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>New Loan Assignment</DialogTitle>
                    <DialogDescription>
                        Assigning a new loan to existing client <b>{client.customerName}</b>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4 overflow-y-auto max-h-[70vh] pr-2">

                    {/* Active Loan Info */}
                    <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                        <p className="font-semibold">Current Active Loan: {client.loanNumber}</p>
                        <p>Status: {client.status} • EMI: ₹{client.emiAmount}</p>
                    </div>

                    {/* Loan Scheme */}
                    <div className="space-y-3">
                        <Label>Loan Scheme</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                className={cn(
                                    "cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-all",
                                    loanScheme === 'EMI' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:border-primary/50'
                                )}
                                onClick={() => setLoanScheme("EMI")}
                            >
                                <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center", loanScheme === 'EMI' ? 'border-primary' : 'border-muted-foreground')}>
                                    {loanScheme === 'EMI' && <div className="h-2 w-2 rounded-full bg-primary" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">EMI Based</p>
                                    <p className="text-xs text-muted-foreground">Principal + Interest monthly</p>
                                </div>
                            </div>

                            <div
                                className={cn(
                                    "cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-all",
                                    loanScheme === 'InterestOnly' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:border-primary/50'
                                )}
                                onClick={() => setLoanScheme("InterestOnly")}
                            >
                                <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center", loanScheme === 'InterestOnly' ? 'border-primary' : 'border-muted-foreground')}>
                                    {loanScheme === 'InterestOnly' && <div className="h-2 w-2 rounded-full bg-primary" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Interest Only</p>
                                    <p className="text-xs text-muted-foreground">Bullet Repayment</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {loanScheme === 'InterestOnly' && (
                        <div className="flex items-center space-x-3 rounded-xl border p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200/50 dark:border-yellow-700/30">
                            <input
                                id="advance-interest-modal"
                                type="checkbox"
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary accent-primary"
                                checked={interestPaidInAdvance}
                                onChange={(e) => setInterestPaidInAdvance(e.target.checked)}
                            />
                            <div className="flex flex-col">
                                <Label htmlFor="advance-interest-modal" className="text-sm font-bold cursor-pointer">Collect Interest in Advance</Label>
                                <span className="text-xs text-muted-foreground/80">Deduct first month's interest from disbursement.</span>
                            </div>
                        </div>
                    )}

                    {/* Principal */}
                    <div className="space-y-2">
                        <Label>Loan Amount (₹)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">₹</span>
                            <Input placeholder="50000" type="number" className="pl-8 text-lg font-bold" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Interest Rate (%)</Label>
                            <div className="relative">
                                <Input defaultValue="12" type="number" className="pr-8" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Tenure (Months)</Label>
                            <Input defaultValue="12" type="number" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Interest Type</Label>
                            {/* Simple Select implementation for the modal since native select is easier to style consistently here quickly or reuse Shadcn Select if imported */}
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={interestType}
                                onChange={(e) => setInterestType(e.target.value)}
                            >
                                <option value="Flat">Flat Rate</option>
                                <option value="Reducing">Reducing Balance</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Repayment Freq.</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={repaymentFreq}
                                onChange={(e) => setRepaymentFreq(e.target.value)}
                            >
                                <option value="Monthly">Monthly</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Daily">Daily</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Processing Fee (%)</Label>
                        <div className="relative">
                            <Input defaultValue="2" type="number" className="pr-8" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">%</span>
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

function DeleteConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    isDeleting
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isDeleting: boolean;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] border-destructive/50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        Delete Customer Profile
                    </DialogTitle>
                    <DialogDescription className="py-2">
                        Are you sure you want to delete this customer?
                        <br /><br />
                        <span className="font-bold text-foreground">This action implies:</span>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                            <li>Permanent deletion of personal profile.</li>
                            <li>Removal of photo from cloud storage.</li>
                            <li>Deletion of ALL loan history and records.</li>
                        </ul>
                        <br />
                        <span className="font-bold text-red-500">This action cannot be undone.</span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isDeleting ? "Deleting..." : "Yes, Delete Permanently"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EditProfileDialog({ client, onUpdate }: { client: LoanAccount, onUpdate: (data: any) => void }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: client.customerName.split(' ')[0],
        lastName: client.customerName.split(' ').slice(1).join(' '),
        mobile: client.mobile,
        email: client.email || "",
        address: client.address,
        photoUrl: client.photoUrl || "",
        aadhar: client.aadharNo || "", // Assuming mapped to aadharNo
        pan: client.panNo || ""       // Assuming mapped to panNo
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, photoUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!client.clientId) {
            toast.error("Error: Missing Client ID");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/clients/${client.clientId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update");

            toast.success("Profile updated successfully");
            onUpdate({
                customerName: `${formData.firstName} ${formData.lastName}`.trim(),
                mobile: formData.mobile,
                email: formData.email,
                address: formData.address,
                photoUrl: data.client.photoUrl, // Use returned URL from server (Cloudinary)
                aadharNo: formData.aadhar,
                panNo: formData.pan
            });
            setOpen(false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full justify-start font-semibold">
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update personal details for {client.customerName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    {/* Image Upload UI */}
                    <div className="flex flex-col items-center justify-center space-y-3 mb-2">
                        <Avatar className="h-24 w-24 border-4 border-muted">
                            <AvatarImage src={formData.photoUrl} className="object-cover" />
                            <AvatarFallback className="text-2xl font-bold">
                                {formData.firstName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Change Photo
                            </Button>
                            {formData.photoUrl && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setFormData({ ...formData, photoUrl: '' })}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Mobile Number</Label>
                        <Input value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
