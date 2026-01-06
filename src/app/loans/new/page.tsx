"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    Calculator,
    Save,
    UserPlus,
    Briefcase,
    Car,
    Home,
    GraduationCap,
    User,
    Building2,
    Landmark,
    Banknote,
    CalendarClock,
    Plus,
    Trash2,
    AlertCircle,
    Wallet,
    Check,
    Info,
    FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NewLoanPage() {
    const [formData, setFormData] = useState({
        // Customer Info
        firstName: "",
        lastName: "",
        mobile: "",
        email: "",
        address: "",
        aadhar: "",
        pan: "",

        // Loan Config
        // Removed loanType as per request
        interestType: "Flat", // Flat or Reducing
        interestRateUnit: "Yearly", // Yearly or Monthly
        loanAmount: "50000",
        interestRate: "12",
        tenureMonths: "12",
        processingFeePercent: "1",
        repaymentFrequency: "Monthly",
        startDate: new Date().toISOString().split("T")[0],

        // Payment Mode Splits
        paymentModes: [
            { type: "Cash", amount: "", reference: "" }
        ],
    });

    const [calculations, setCalculations] = useState({
        emi: 0,
        totalInterest: 0,
        totalPayable: 0,
        processingFeeAmount: 0,
        netDisbursal: 0
    });

    // Calculate EMI whenever relevant fields change
    useEffect(() => {
        const P = parseFloat(formData.loanAmount) || 0;
        let R = parseFloat(formData.interestRate) || 0;
        const N = parseFloat(formData.tenureMonths) || 0;
        const PF_Percent = parseFloat(formData.processingFeePercent) || 0;

        // Normalize Interest Rate to Yearly if user selected Monthly
        if (formData.interestRateUnit === "Monthly") {
            R = R * 12;
        }

        if (P > 0 && R > 0 && N > 0) {
            let emi = 0;
            let totalInterest = 0;
            let totalPayable = 0;

            if (formData.interestType === "Flat") {
                // Flat Rate Calculation
                // Total Interest = P * (R/100) * (N/12)
                totalInterest = (P * R * (N / 12)) / 100;
                totalPayable = P + totalInterest;
                emi = totalPayable / N;
            } else {
                // Reducing Balance Calculation (Standard EMI Formula)
                // r = monthly interest rate = (R / 12) / 100
                // E = P * r * (1+r)^N / ((1+r)^N - 1)
                const r = (R / 12) / 100;
                emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
                totalPayable = emi * N;
                totalInterest = totalPayable - P;
            }

            const processingFeeAmount = (P * PF_Percent) / 100;
            const netDisbursal = P - processingFeeAmount;

            setCalculations({
                emi: Math.round(emi),
                totalInterest: Math.round(totalInterest),
                totalPayable: Math.round(totalPayable),
                processingFeeAmount: Math.round(processingFeeAmount),
                netDisbursal: Math.round(netDisbursal)
            });
        } else {
            setCalculations({ emi: 0, totalInterest: 0, totalPayable: 0, processingFeeAmount: 0, netDisbursal: 0 });
        }
    }, [formData.loanAmount, formData.interestRate, formData.tenureMonths, formData.processingFeePercent, formData.interestType, formData.interestRateUnit]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePaymentModeChange = (index: number, field: string, value: string) => {
        const newModes = [...formData.paymentModes];
        // @ts-ignore
        newModes[index] = { ...newModes[index], [field]: value };
        setFormData(prev => ({ ...prev, paymentModes: newModes }));
    };

    const addPaymentMode = () => {
        setFormData(prev => ({
            ...prev,
            paymentModes: [...prev.paymentModes, { type: "Cash", amount: "", reference: "" }]
        }));
    };

    const removePaymentMode = (index: number) => {
        if (formData.paymentModes.length > 1) {
            setFormData(prev => ({
                ...prev,
                paymentModes: prev.paymentModes.filter((_, i) => i !== index)
            }));
        }
    };

    const totalSplitAmount = formData.paymentModes.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const isSplitMatch = Math.abs(totalSplitAmount - calculations.netDisbursal) < 1;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting Loan Application:", { ...formData, ...calculations });
        toast.success(`Loan Application for ${formData.firstName} submitted successfully!`);
        // Reset or redirect logic would go here
    };



    return (
        <div className="-m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] h-[calc(100vh-1rem)] flex flex-col bg-muted/5 overflow-hidden animate-in fade-in duration-500">

            {/* STICKY HEADER */}
            <header className="h-16 border-b bg-background/80 backdrop-blur z-20 sticky top-0 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight leading-none text-foreground">New Loan Application</h1>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Register a new customer and configure loan terms.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm py-1.5 px-4 bg-background/50 border-primary/20 text-primary font-medium shadow-sm backdrop-blur">
                        <CalendarClock className="h-3.5 w-3.5 mr-2" />
                        {new Date().toLocaleDateString()}
                    </Badge>
                    <Badge variant="secondary" className="text-sm py-1.5 px-4 font-mono font-medium opacity-80">
                        ID: APP-{Math.floor(Math.random() * 10000)}
                    </Badge>
                </div>
            </header>

            {/* SCROLLABLE CONTENT AREA */}
            <div className="flex-1 overflow-auto p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                    {/* === LEFT COLUMN: FORMS (Span 8) === */}
                    <div className="xl:col-span-8 space-y-8">

                        {/* 1. Customer Identity */}
                        <Card className="shadow-sm border-muted-foreground/10 overflow-hidden bg-card/50 backdrop-blur-sm">
                            <CardHeader className="bg-muted/30 pb-4 pt-5 border-b border-border/40">
                                <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
                                    <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900/40 dark:text-blue-400">
                                        <UserPlus className="h-4 w-4" />
                                    </div>
                                    Customer Identity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid sm:grid-cols-2 gap-x-6 gap-y-5 pt-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">First Name <span className="text-red-500">*</span></Label>
                                    <Input required placeholder="Ex. Rajesh" className="h-10 bg-muted/20" value={formData.firstName} onChange={e => handleChange("firstName", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Name <span className="text-red-500">*</span></Label>
                                    <Input required placeholder="Ex. Kumar" className="h-10 bg-muted/20" value={formData.lastName} onChange={e => handleChange("lastName", e.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mobile Number <span className="text-red-500">*</span></Label>
                                    <Input required type="tel" maxLength={10} placeholder="9876543210" className="h-10 bg-muted/20 font-mono" value={formData.mobile} onChange={e => handleChange("mobile", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</Label>
                                    <Input type="email" placeholder="rahul@example.com" className="h-10 bg-muted/20" value={formData.email} onChange={e => handleChange("email", e.target.value)} />
                                </div>

                                <Separator className="sm:col-span-2 my-2 bg-border/40" />

                                <div className="sm:col-span-2 space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Residential Address <span className="text-red-500">*</span></Label>
                                    <Textarea required placeholder="Flat No, Street, City, State, Pincode" className="min-h-[80px] bg-muted/20 resize-none" value={formData.address} onChange={e => handleChange("address", e.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Aadhar Number</Label>
                                    <Input maxLength={12} placeholder="#### #### ####" className="h-10 bg-muted/20 font-mono" value={formData.aadhar} onChange={e => handleChange("aadhar", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">PAN Card</Label>
                                    <Input maxLength={10} className="h-10 bg-muted/20 uppercase font-mono" placeholder="ABCDE1234F" value={formData.pan} onChange={e => handleChange("pan", e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Loan Configuration */}
                        <Card className="shadow-sm border-muted-foreground/10 overflow-hidden ring-1 ring-primary/5 bg-card/50 backdrop-blur-sm">
                            <CardHeader className="bg-primary/5 pb-4 pt-5 border-b border-primary/10">
                                <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-primary">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                        <Banknote className="h-4 w-4" />
                                    </div>
                                    Loan Configuration
                                </CardTitle>
                                <CardDescription>Define the financial terms of the loan.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid sm:grid-cols-2 gap-x-6 gap-y-6 pt-6 bg-gradient-to-b from-primary/[0.02] to-transparent">

                                {/* Principal Row */}
                                <div className="sm:col-span-2 space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Loan Principal <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">₹</span>
                                        <Input
                                            type="number"
                                            className="text-2xl font-bold h-14 pl-8 bg-background border-primary/20 shadow-sm focus-visible:ring-primary/20"
                                            placeholder="50000"
                                            value={formData.loanAmount}
                                            onChange={e => handleChange("loanAmount", e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Interest & Rate */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Interest Rate <span className="text-red-500">*</span></Label>
                                    <div className="flex shadow-sm rounded-md">
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                value={formData.interestRate}
                                                onChange={e => handleChange("interestRate", e.target.value)}
                                                className="rounded-r-none h-10 border-r-0 focus-visible:ring-0 focus-visible:border-primary"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
                                        </div>
                                        <Select value={formData.interestRateUnit} onValueChange={val => handleChange("interestRateUnit", val)}>
                                            <SelectTrigger className="w-[100px] rounded-l-none bg-muted/50 h-10 border-l border-input">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yearly">Yearly</SelectItem>
                                                <SelectItem value="Monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tenure (Months) <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        className="h-10"
                                        placeholder="Ex. 12"
                                        value={formData.tenureMonths}
                                        onChange={e => handleChange("tenureMonths", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Interest Type</Label>
                                    <Select value={formData.interestType} onValueChange={val => handleChange("interestType", val)}>
                                        <SelectTrigger className="h-10 bg-muted/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Flat">Flat Rate</SelectItem>
                                            <SelectItem value="Reducing">Reducing Balance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Repayment Frequency</Label>
                                    <Select value={formData.repaymentFrequency} onValueChange={val => handleChange("repaymentFrequency", val)}>
                                        <SelectTrigger className="h-10 bg-muted/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Monthly">Monthly (EMI)</SelectItem>
                                            <SelectItem value="Weekly">Weekly</SelectItem>
                                            <SelectItem value="Daily">Daily</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Processing Fee (%)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="h-10 bg-muted/20 pr-8"
                                            value={formData.processingFeePercent}
                                            onChange={e => handleChange("processingFeePercent", e.target.value)}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Disbursement Date</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={e => handleChange("startDate", e.target.value)}
                                            className="pl-10 h-10 bg-muted/20"
                                        />
                                        <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>

                            </CardContent>
                        </Card>

                        {/* 3. Disbursement Splits */}
                        <Card className="shadow-sm border-muted-foreground/10 overflow-hidden bg-card/50 backdrop-blur-sm">
                            <CardHeader className="bg-muted/30 pb-4 pt-5 border-b border-border/40 flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/40 dark:text-emerald-400">
                                        <Wallet className="h-4 w-4" />
                                    </div>
                                    Disbursement & Splits
                                </CardTitle>
                                {isSplitMatch ? (
                                    <Badge variant="outline" className="bg-emerald-100/50 text-emerald-700 border-emerald-200 flex gap-1.5 items-center">
                                        <Check className="h-3 w-3" /> Matched
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive" className="flex gap-1.5 items-center">
                                        <AlertCircle className="h-3 w-3" /> Diff: {calculations.netDisbursal - totalSplitAmount}
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                {formData.paymentModes.map((mode, index) => (
                                    <div key={index} className="group relative flex flex-col md:flex-row gap-4 items-start md:items-end p-4 rounded-xl border border-muted-foreground/10 bg-card hover:border-primary/20 transition-all shadow-sm">
                                        <div className="space-y-1.5 w-full md:w-[180px]">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Mode</Label>
                                            <Select value={mode.type} onValueChange={val => handlePaymentModeChange(index, "type", val)}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Cash">Cash</SelectItem>
                                                    <SelectItem value="Online Transfer">Online Transfer</SelectItem>
                                                    <SelectItem value="Cheque">Cheque</SelectItem>
                                                    <SelectItem value="UPI">UPI</SelectItem>
                                                    <SelectItem value="Demand Draft">Demand Draft</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5 w-full md:flex-1">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Amount</Label>
                                            <div className="relative">
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">₹</span>
                                                <Input
                                                    type="number"
                                                    className="h-9 pl-6 font-bold"
                                                    placeholder="0"
                                                    value={mode.amount}
                                                    onChange={e => handlePaymentModeChange(index, "amount", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 w-full md:flex-1">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Reference / Note</Label>
                                            <Input
                                                className="h-9"
                                                placeholder="Ref ID / Cheque No"
                                                value={mode.reference}
                                                onChange={e => handlePaymentModeChange(index, "reference", e.target.value)}
                                            />
                                        </div>

                                        {formData.paymentModes.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => removePaymentMode(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/5 h-10"
                                    onClick={addPaymentMode}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Add Another Payment Method
                                </Button>
                            </CardContent>
                        </Card>

                    </div>


                    {/* === RIGHT COLUMN: SUMMARY (Span 4) === */}
                    <div className="xl:col-span-4 lg:col-span-5 h-full">
                        <div className="sticky top-6 space-y-6">

                            {/* Live Calculator Card */}
                            <Card className="border-0 shadow-2xl bg-primary text-primary-foreground overflow-hidden relative">
                                {/* Decorative Background */}
                                <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                <CardHeader className="pb-2 border-b border-primary-foreground/10">
                                    <CardTitle className="flex items-center gap-2 text-xl font-medium text-primary-foreground">
                                        <Calculator className="h-5 w-5 text-primary-foreground/80" /> Loan Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">

                                    <div>
                                        <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-wider mb-1">Monthly Installment (EMI)</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold tracking-tight">₹{calculations.emi.toLocaleString()}</span>
                                            <span className="text-sm text-primary-foreground/60">/ month</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-4 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 backdrop-blur-sm">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-primary-foreground/70">Principal</span>
                                            <span className="font-semibold">₹{parseInt(formData.loanAmount || '0').toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-primary-foreground/70">Total Interest</span>
                                            <span className="font-semibold text-emerald-200">+ ₹{calculations.totalInterest.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-primary-foreground/70">Processing Fee</span>
                                            <span className="font-semibold text-red-200">- ₹{calculations.processingFeeAmount.toLocaleString()}</span>
                                        </div>
                                        <Separator className="bg-primary-foreground/10 my-2" />
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-sm font-bold text-primary-foreground/90 uppercase">Net Disbursal</span>
                                            <span className="text-xl font-bold text-primary-foreground">₹{calculations.netDisbursal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-primary-foreground/50 px-1">
                                        <span>Total Payable Amount</span>
                                        <span>₹{calculations.totalPayable.toLocaleString()}</span>
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full h-12 text-base font-bold bg-background text-foreground hover:bg-background/90 shadow-lg border-0 transition-all active:scale-[0.98]"
                                    >
                                        <Save className="mr-2 h-5 w-5" /> Disburse Loan
                                    </Button>

                                </CardContent>
                            </Card>


                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
