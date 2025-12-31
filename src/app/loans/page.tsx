"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { MOCK_LOANS } from "@/lib/mock-data";
import {
    ArrowRight,
    IndianRupee,
    Search,
    Plus,
    Calendar,
    Percent,
    Briefcase,
    User,
    Car,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoansPage() {
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLoans = MOCK_LOANS.filter((loan) => {
        const matchesStatus = filter === "all" ? true : loan.status.toLowerCase() === filter;
        const matchesSearch =
            loan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    // Helper to get icon based on loan type
    const getLoanIcon = (type: string) => {
        switch (type) {
            case "Business": return Briefcase;
            case "Vehicle": return Car;
            default: return User;
        }
    }

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Loan Portfolio</h2>
                    <p className="text-muted-foreground mt-1">Manage and track all customer loan accounts.</p>
                </div>
                <Button asChild className="shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all hover:scale-105 active:scale-95">
                    <Link href="/loans/new">
                        <Plus className="mr-2 h-4 w-4" /> Disburse New Loan
                    </Link>
                </Button>
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setFilter}>
                    <TabsList className="grid w-full grid-cols-4 md:w-[450px]">
                        <TabsTrigger value="all">All Loans</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="closed">Closed</TabsTrigger>
                        <TabsTrigger value="npa">Overdue</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full md:w-96 ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by Name or Loan ID..."
                        className="pl-9 bg-background/50 backdrop-blur"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Loan Grid */}
            {filteredLoans.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredLoans.map((loan) => {
                        const Icon = getLoanIcon(loan.loanType);
                        const progress = (loan.emisPaid / loan.tenureMonths) * 100;

                        return (
                            <Card key={loan.loanNumber} className="group hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary/80 overflow-hidden">
                                <CardHeader className="pb-3 bg-muted/5">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3 items-center">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-bold">{loan.customerName}</CardTitle>
                                                <p className="text-xs font-mono text-muted-foreground">{loan.loanNumber}</p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={loan.status === 'Active' ? 'default' : loan.status === 'Closed' ? 'secondary' : 'destructive'}
                                            className="uppercase text-[10px] tracking-wider"
                                        >
                                            {loan.status}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-4 pb-2 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-0.5">
                                            <p className="text-xs text-muted-foreground font-medium">Principal Amount</p>
                                            <p className="font-bold flex items-center gap-1 text-lg">
                                                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                                {loan.totalLoanAmount.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="space-y-0.5 text-right">
                                            <p className="text-xs text-muted-foreground font-medium">Monthly EMI</p>
                                            <p className="font-bold flex items-center justify-end gap-1 text-lg text-emerald-600">
                                                <IndianRupee className="h-4 w-4" />
                                                {loan.emiAmount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground border-y py-3 border-dashed">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{new Date(loan.disbursedDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-full dark:bg-amber-900/20 dark:text-amber-100">
                                            <Percent className="h-3 w-3" />
                                            <span className="font-bold text-[10px]">{loan.interestRate}% Interest</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 ">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className={cn(progress >= 100 ? "text-emerald-600" : "text-muted-foreground")}>Repayment Progress</span>
                                            <span>{loan.emisPaid} / {loan.tenureMonths} Months</span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-1000 ease-out rounded-full",
                                                    progress >= 100 ? "bg-emerald-500" : "bg-primary"
                                                )}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-2 pb-4">
                                    <Button variant="ghost" className="w-full group/btn hover:bg-primary/5 hover:text-primary justify-between" asChild>
                                        <Link href={`/loans/${loan.loanNumber}`}>
                                            <span className="font-semibold">View Ledger</span>
                                            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight">No loans found</h3>
                    <p className="text-muted-foreground max-w-sm mt-2">
                        We couldn't find any loan accounts matching your filters. Try adjusting your search term.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => { setFilter("all"); setSearchTerm(""); }}>
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    );
}
