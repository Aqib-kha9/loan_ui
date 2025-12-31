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
    CalendarClock
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

        // Guarantor Info
        guarantorName: "",
        guarantorMobile: "",

        // Loan Config
        loanType: "Personal",
        loanAmount: "50000",
        interestRate: "12",
        tenureMonths: "12",
        processingFeePercent: "1",
        repaymentFrequency: "Monthly",
        startDate: new Date().toISOString().split("T")[0],

        // Bank Details
        bankAccountNo: "",
        ifscCode: "",
        bankName: ""
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
        const R = parseFloat(formData.interestRate) || 0;
        const N = parseFloat(formData.tenureMonths) || 0;
        const PF_Percent = parseFloat(formData.processingFeePercent) || 0;

        if (P > 0 && R > 0 && N > 0) {
            // Flat Rate Calculation (Common in small finance)
            // Total Interest = P * (R/100) * (N/12)
            const totalInterest = (P * R * (N / 12)) / 100;
            const totalPayable = P + totalInterest;
            const emi = totalPayable / N;

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
    }, [formData.loanAmount, formData.interestRate, formData.tenureMonths, formData.processingFeePercent]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting Loan Application:", { ...formData, ...calculations });
        toast.success(`Loan Application for ${formData.firstName} submitted successfully!`);
        // Reset or redirect logic would go here
    };

    const getLoanIcon = (type: string) => {
        switch (type) {
            case "Business": return Briefcase;
            case "Vehicle": return Car;
            case "Mortgage": return Home;
            case "Education": return GraduationCap;
            default: return User;
        }
    };

    const LoanIcon = getLoanIcon(formData.loanType);

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
                                <Label>Loan Category</Label>
                                <Select value={formData.loanType} onValueChange={val => handleChange("loanType", val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Personal"><div className="flex items-center gap-2"><User className="h-4 w-4" /> Personal Loan</div></SelectItem>
                                        <SelectItem value="Business"><div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Business Loan</div></SelectItem>
                                        <SelectItem value="Vehicle"><div className="flex items-center gap-2"><Car className="h-4 w-4" /> Vehicle Loan</div></SelectItem>
                                        <SelectItem value="Mortgage"><div className="flex items-center gap-2"><Home className="h-4 w-4" /> Mortgage Loan</div></SelectItem>
                                        <SelectItem value="Education"><div className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Education Loan</div></SelectItem>
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
                                <Label>Interest Rate (% p.a) <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={formData.interestRate}
                                        onChange={e => handleChange("interestRate", e.target.value)}
                                        className="pr-8"
                                    />
                                    <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Tenure (Months) <span className="text-red-500">*</span></Label>
                                <Select value={formData.tenureMonths} onValueChange={val => handleChange("tenureMonths", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select tenure" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[6, 12, 18, 24, 36, 48, 60, 84].map(m => (
                                            <SelectItem key={m} value={m.toString()}>{m} Months</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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

                    {/* SECTION 3: BANK & GUARANTOR */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Co-Applicant / Guarantor</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Guarantor Name</Label>
                                    <Input placeholder="Full Name" value={formData.guarantorName} onChange={e => handleChange("guarantorName", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Guarantor Mobile</Label>
                                    <Input type="tel" placeholder="Mobile Number" value={formData.guarantorMobile} onChange={e => handleChange("guarantorMobile", e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2"><Landmark className="h-4 w-4" /> Bank Details (For Transfer)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Account Number</Label>
                                    <Input placeholder="0000000000" value={formData.bankAccountNo} onChange={e => handleChange("bankAccountNo", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>IFSC Code</Label>
                                    <Input className="uppercase" placeholder="HDFC0001234" value={formData.ifscCode} onChange={e => handleChange("ifscCode", e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Live Summary */}
                <div className="space-y-6">
                    <Card className="sticky top-24 border-2 border-primary shadow-xl bg-card/95 backdrop-blur z-10">
                        <CardHeader className="bg-primary/5 pb-6">
                            <Badge className="w-fit mb-2 bg-primary/20 text-primary hover:bg-primary/20 border-none">
                                <LoanIcon className="w-3 h-3 mr-1" /> {formData.loanType} Loan
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
                                    <span>Interest ({formData.interestRate}%)</span>
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
