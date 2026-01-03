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
    AlertCircle
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
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">New Loan Application</h2>
                    <p className="text-muted-foreground">Fill in the details to register a new customer and disburse a loan.</p>
                </div>
                <Badge variant="outline" className="text-sm py-1 px-3 bg-background">
                    Application ID: APP-NEW-2024
                </Badge>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Form Inputs */}
                <div className="xl:col-span-2 space-y-8">

                    {/* SECTION 1: CUSTOMER DETAILS */}
                    <Card>
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <UserPlus className="h-5 w-5" /> Customer Identity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-6 pt-6">
                            <div className="space-y-2">
                                <Label>First Name <span className="text-red-500">*</span></Label>
                                <Input required placeholder="e.g. Rahul" value={formData.firstName} onChange={e => handleChange("firstName", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name <span className="text-red-500">*</span></Label>
                                <Input required placeholder="e.g. Sharma" value={formData.lastName} onChange={e => handleChange("lastName", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Mobile Number <span className="text-red-500">*</span></Label>
                                <Input required type="tel" maxLength={10} placeholder="9876543210" value={formData.mobile} onChange={e => handleChange("mobile", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input type="email" placeholder="rahul@example.com" value={formData.email} onChange={e => handleChange("email", e.target.value)} />
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <Label>Current Residential Address <span className="text-red-500">*</span></Label>
                                <Textarea required placeholder="Flat No, Street, City, State, Pincode" value={formData.address} onChange={e => handleChange("address", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Aadhar Number</Label>
                                <Input maxLength={12} placeholder="1234 5678 9012" value={formData.aadhar} onChange={e => handleChange("aadhar", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>PAN Card</Label>
                                <Input maxLength={10} className="uppercase" placeholder="ABCDE1234F" value={formData.pan} onChange={e => handleChange("pan", e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* SECTION 2: LOAN CONFIGURATION */}
                    <Card className="border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden">
                        <CardHeader className="bg-blue-50/50 dark:bg-blue-900/20 pb-4">
                            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <Banknote className="h-5 w-5" /> Loan Configuration
                            </CardTitle>
                            <CardDescription>Configure the loan terms and repayment schedule.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-6 pt-6">
                            <div className="space-y-2">
                                <Label>Interest Type</Label>
                                <Select value={formData.interestType} onValueChange={val => handleChange("interestType", val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Flat">Flat Rate</SelectItem>
                                        <SelectItem value="Reducing">Reducing Balance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Repayment Frequency</Label>
                                <Select value={formData.repaymentFrequency} onValueChange={val => handleChange("repaymentFrequency", val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Monthly">Monthly (EMI)</SelectItem>
                                        <SelectItem value="Weekly">Weekly</SelectItem>
                                        <SelectItem value="Daily">Daily</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator className="sm:col-span-2 lg:hidden" />

                            <div className="space-y-2">
                                <Label>Loan Principal (₹) <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    className="text-lg font-bold text-primary"
                                    placeholder="50000"
                                    value={formData.loanAmount}
                                    onChange={e => handleChange("loanAmount", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Interest Rate <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            type="number"
                                            value={formData.interestRate}
                                            onChange={e => handleChange("interestRate", e.target.value)}
                                            className="pr-8"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                                    </div>
                                    <Select value={formData.interestRateUnit} onValueChange={val => handleChange("interestRateUnit", val)}>
                                        <SelectTrigger className="w-[110px]">
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
                                <Label>Tenure (Months) <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    placeholder="Enter months (e.g. 12)"
                                    value={formData.tenureMonths}
                                    onChange={e => handleChange("tenureMonths", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Processing Fee (%)</Label>
                                <Input
                                    type="number"
                                    value={formData.processingFeePercent}
                                    onChange={e => handleChange("processingFeePercent", e.target.value)}
                                />
                            </div>

                            <div className="sm:col-span-2 pt-2">
                                <div className="space-y-2">
                                    <Label>Disbursement Date</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={e => handleChange("startDate", e.target.value)}
                                            className="pl-10"
                                        />
                                        <CalendarClock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SECTION 2.5: DISBURSEMENT SPLIT */}
                    <Card>
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-base flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Banknote className="h-4 w-4" /> Disbursement Mode & Split
                                </div>
                                {!isSplitMatch && (
                                    <Badge variant="destructive" className="flex gap-1">
                                        <AlertCircle className="h-3 w-3" /> Mismatch: {calculations.netDisbursal - totalSplitAmount}
                                    </Badge>
                                )}
                                {isSplitMatch && (
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                        Matched
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                            {formData.paymentModes.map((mode, index) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-3 items-end">
                                    <div className="space-y-1 w-full sm:w-1/3">
                                        <Label className="text-xs">Mode</Label>
                                        <Select value={mode.type} onValueChange={val => handlePaymentModeChange(index, "type", val)}>
                                            <SelectTrigger>
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
                                    <div className="space-y-1 w-full sm:w-1/3">
                                        <Label className="text-xs">Amount</Label>
                                        <Input
                                            type="number"
                                            placeholder="Amount"
                                            value={mode.amount}
                                            onChange={e => handlePaymentModeChange(index, "amount", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1 w-full sm:w-1/3">
                                        <Label className="text-xs">Reference / Note</Label>
                                        <Input
                                            placeholder="Ref ID / Cheque No"
                                            value={mode.reference}
                                            onChange={e => handlePaymentModeChange(index, "reference", e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="mb-0.5 text-muted-foreground hover:text-red-500"
                                        onClick={() => removePaymentMode(index)}
                                        disabled={formData.paymentModes.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2 text-primary border-primary/20 hover:bg-primary/5"
                                onClick={addPaymentMode}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Split Payment
                            </Button>
                        </CardContent>
                    </Card>


                </div>

                {/* Right Column: Live Summary */}
                <div className="space-y-6">
                    <Card className="sticky top-24 border-2 border-primary shadow-xl bg-card/95 backdrop-blur z-10">
                        <CardHeader className="bg-primary/5 pb-6">
                            <Badge className="w-fit mb-2 bg-primary/20 text-primary hover:bg-primary/20 border-none">
                                {formData.interestType} Rate Loan
                            </Badge>
                            <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                                <Calculator className="h-6 w-6" /> Summary
                            </CardTitle>
                            <CardDescription>Projected repayment schedule</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="flex justify-between items-baseline mb-4">
                                <span className="text-muted-foreground font-medium">{formData.repaymentFrequency} Installment</span>
                                <span className="text-4xl font-bold text-primary">₹{calculations.emi.toLocaleString()}</span>
                            </div>

                            <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Principal Amount</span>
                                    <span className="font-medium">₹{parseInt(formData.loanAmount || '0').toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Interest ({formData.interestRate}% {formData.interestRateUnit === 'Monthly' ? 'p.m' : 'p.a'})</span>
                                    <span>+ ₹{calculations.totalInterest.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Processing Fee ({formData.processingFeePercent}%)</span>
                                    <span>- ₹{calculations.processingFeeAmount.toLocaleString()}</span>
                                </div>
                                <Separator className="my-2 bg-muted-foreground/20" />
                                <div className="flex justify-between font-bold text-base">
                                    <span>Net Disbursal</span>
                                    <span className="text-emerald-600">₹{calculations.netDisbursal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base mt-1">
                                    <span>Total Payable</span>
                                    <span>₹{calculations.totalPayable.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 pb-6">
                            <Button type="submit" size="lg" className="w-full text-lg h-12 shadow-lg shadow-primary/20">
                                <Save className="mr-2 h-5 w-5" /> Disburse Loan
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </form>
        </div>
    );
}
