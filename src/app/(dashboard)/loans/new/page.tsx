"use client";

import { useState, useEffect } from "react";
import { logActivity } from "@/lib/activity-logger";
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

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useSettings } from "@/components/providers/settings-provider"; // Hook to get company settings
import { DisbursementReceipt } from "@/components/templates/DisbursementReceipt";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Printer,
    Download,
    Camera,
    Image as ImageIcon,
    X,
    Repeat
} from "lucide-react";

// Dynamic Registry Import
import { getTemplate } from "@/components/templates/registry";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export default function NewLoanPage() {
    const { companySettings, printTemplate } = useSettings();
    const { checkPermission, isLoading } = useAuth();
    const router = useRouter();

    // Auth Check
    useEffect(() => {
        if (!isLoading && !checkPermission('create_loan')) {
            toast.error("Unauthorized Access: You cannot create loans.");
            router.push('/dashboard');
        }
    }, [isLoading, checkPermission, router]);

    const [showReceipt, setShowReceipt] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Disbursement_Receipt_${new Date().getTime()}`,
        pageStyle: `
            @page {
                size: A4;
                margin: 0mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                }
                .print-content {
                    margin: 20mm auto !important;
                    box-shadow: none !important;
                    border: none !important;
                    transform: scale(0.98);
                    transform-origin: top center;
                }
            }
        `
    });

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
        loanScheme: "EMI", // "EMI" or "InterestOnly"
        interestPaidInAdvance: false,
        interestType: "Flat", // Flat or Reducing
        interestRateUnit: "Yearly", // Yearly or Monthly
        loanAmount: "50000",
        interestRate: "12",
        tenureMonths: "12",
        tenureUnit: "Months", // New
        processingFeePercent: "1",
        repaymentFrequency: "Monthly",

        startDate: new Date().toISOString().split("T")[0],

        // Payment Mode Splits
        paymentModes: [
            { type: "Cash", amount: "", reference: "" }
        ],
        indefiniteTenure: false, // New field

        // Lifecycle 2.0
        gracePeriodDays: "0",
        penaltyConfig: { type: "Fixed", value: "0" },
        holidayHandling: "Ignore",
        advancePaymentAction: "ReduceNextEMI"
    });

    const [calculations, setCalculations] = useState<{
        emi: number;
        totalInterest: number;
        totalPayable: number;
        processingFeeAmount: number;
        netDisbursal: number;
        firstMonthInterest: number;
        schedule?: any[];
    }>({
        emi: 0,
        totalInterest: 0,
        totalPayable: 0,
        processingFeeAmount: 0,
        netDisbursal: 0,
        firstMonthInterest: 0,
        schedule: []
    });

    // --- Image Upload Logic ---
    const [customerImage, setCustomerImage] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDiskUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomerImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast.error("Could not access camera. Please check permissions.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                // Set canvas dimensions to match video
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;

                // Draw video frame to canvas
                context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);

                // Get data URL
                const dataUrl = canvasRef.current.toDataURL('image/jpeg');
                setCustomerImage(dataUrl);
                stopCamera();
            }
        }
    };


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

        if (P > 0 && R > 0 && (N > 0 || formData.indefiniteTenure)) {
            let emi = 0;
            let totalInterest = 0;
            let totalPayable = 0;
            let firstMonthInterest = 0;

            let frequencyDivisor = 12;
            if (formData.repaymentFrequency === "Weekly") frequencyDivisor = 52;
            if (formData.repaymentFrequency === "Daily") frequencyDivisor = 365;

            // Calculate Periodic Rate
            // r = periodic rate (e.g. weekly rate)
            // R = Yearly Rate
            let annualRate = R;
            if (formData.interestRateUnit === "Monthly") annualRate = R * 12;

            const periodicRate = annualRate / frequencyDivisor / 100;

            // Calculate ACTUAL Number of Installments (N_effective)
            // The input 'N' is tenure duration
            const tUnit = formData.tenureUnit || 'Months';
            let numberOfInstallments = N;

            if (formData.repaymentFrequency === 'Weekly') {
                if (tUnit === 'Months') numberOfInstallments = (N / 12) * 52;
                else if (tUnit === 'Weeks') numberOfInstallments = N;
                else if (tUnit === 'Days') numberOfInstallments = N / 7;
            } else if (formData.repaymentFrequency === 'Daily') {
                if (tUnit === 'Months') numberOfInstallments = (N / 12) * 365;
                else if (tUnit === 'Weeks') numberOfInstallments = N * 7;
                else if (tUnit === 'Days') numberOfInstallments = N;
            } else {
                // Monthly
                if (tUnit === 'Months') numberOfInstallments = N;
                else if (tUnit === 'Weeks') numberOfInstallments = N / 4.33;
                else if (tUnit === 'Days') numberOfInstallments = N / 30;
            }

            numberOfInstallments = Math.ceil(numberOfInstallments); // Round up to whole installment

            if (formData.loanScheme === "InterestOnly") {
                // Interest Only
                firstMonthInterest = P * periodicRate;
                emi = firstMonthInterest;

                // If Indefinite, total interest is not calculable, set to 0
                if (formData.indefiniteTenure) {
                    totalInterest = 0;
                    totalPayable = 0;
                } else {
                    totalInterest = firstMonthInterest * numberOfInstallments;
                    totalPayable = P + totalInterest;
                }

            } else {
                // EMI Based
                if (formData.interestType === "Flat") {
                    // Total Interest = P * AnnualRate * (Tenure in Years)
                    let tenureInYears = N / 12; // Default if Months
                    if (tUnit === 'Weeks') tenureInYears = N / 52;
                    if (tUnit === 'Days') tenureInYears = N / 365;

                    totalInterest = (P * annualRate * tenureInYears) / 100;
                    totalPayable = P + totalInterest;
                    emi = totalPayable / numberOfInstallments;
                } else {
                    // Reducing Balance
                    if (periodicRate === 0) emi = P / numberOfInstallments;
                    else emi = (P * periodicRate * Math.pow(1 + periodicRate, numberOfInstallments)) / (Math.pow(1 + periodicRate, numberOfInstallments) - 1);

                    totalPayable = emi * numberOfInstallments;
                    totalInterest = totalPayable - P;
                }
                firstMonthInterest = P * periodicRate;
            }

            const processingFeeAmount = (P * PF_Percent) / 100;
            let netDisbursal = P - processingFeeAmount;

            // Handle Interest Paid In Advance
            if (formData.loanScheme === "InterestOnly" && formData.interestPaidInAdvance) {
                netDisbursal -= firstMonthInterest;
            }

            setCalculations({
                emi: Math.round(emi),
                totalInterest: Math.round(totalInterest),
                totalPayable: Math.round(totalPayable),
                processingFeeAmount: Math.round(processingFeeAmount),
                netDisbursal: Math.round(netDisbursal),
                firstMonthInterest: Math.round(firstMonthInterest)
            });
        } else {
            setCalculations({ emi: 0, totalInterest: 0, totalPayable: 0, processingFeeAmount: 0, netDisbursal: 0, firstMonthInterest: 0 });
        }
    }, [formData.loanAmount, formData.interestRate, formData.tenureMonths, formData.processingFeePercent, formData.interestType, formData.interestRateUnit, formData.loanScheme, formData.interestPaidInAdvance, formData.indefiniteTenure, formData.repaymentFrequency, formData.tenureUnit]);

    // Added: Frequency Effect to auto-set Unit
    useEffect(() => {
        if (formData.repaymentFrequency === 'Weekly') handleChange('tenureUnit', 'Weeks');
        else if (formData.repaymentFrequency === 'Daily') handleChange('tenureUnit', 'Days');
        else if (formData.repaymentFrequency === 'Monthly') handleChange('tenureUnit', 'Months');
    }, [formData.repaymentFrequency]);



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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate splits match net disbursal
        if (!isSplitMatch) {
            toast.warning(`Payment Mismatch! The splits differ by ₹${(calculations.netDisbursal - totalSplitAmount).toFixed(2)}`, {
                description: "Please adjust payment modes to match the Net Disbursal amount.",
                duration: 5000,
            });
            return;
        }

        // BasicClient-side validation can go here

        try {
            const toastId = toast.loading("Processing Loan Application...");

            const response = await fetch('/api/loans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    customerImage // Include the base64 image
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Failed to create loan", { id: toastId });
                return;
            }

            // Success
            toast.success(`Loan Disbursed Successfully! Loan ID: ${data.loan.loanId}`, { id: toastId });

            // Log Activity (Optional: Backend does it too, but this updates UI store if any)
            logActivity({
                type: 'Loan',
                title: 'Loan Disbursed',
                entityName: `${formData.firstName} ${formData.lastName}`,
                amount: -parseFloat(formData.loanAmount || '0'), // Negative for Money Out
                action: 'Disbursed',
                description: `Loan ${data.loan.loanId} created for ${formData.firstName} ${formData.lastName} (₹${parseInt(formData.loanAmount || '0').toLocaleString()}).`,
                user: 'Admin User'
            });

            console.log("Loan Created:", data);
            setShowReceipt(true);

        } catch (error) {
            console.error("Submission Error:", error);
            toast.error("Something went wrong. Please try again.");
        }
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
                        <span suppressHydrationWarning>{new Date().toLocaleDateString('en-GB')}</span>
                    </Badge>
                    <Badge variant="secondary" className="text-sm py-1.5 px-4 font-mono font-medium opacity-80">
                        <span suppressHydrationWarning>ID: APP-{Math.floor(Math.random() * 10000)}</span>
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

                        {/* 1.1 Customer Photo */}
                        <Card className="shadow-sm border-muted-foreground/10 overflow-hidden bg-card/50 backdrop-blur-sm">
                            <CardHeader className="bg-muted/30 pb-4 pt-5 border-b border-border/40">
                                <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
                                    <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center dark:bg-purple-900/40 dark:text-purple-400">
                                        <Camera className="h-4 w-4" />
                                    </div>
                                    Customer Photo <span className="text-xs font-normal text-muted-foreground ml-2">(Optional)</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center justify-center gap-6">

                                    {/* Preview Area */}
                                    <div className="relative h-48 w-48 rounded-full border-4 border-dashed border-muted bg-muted/30 flex items-center justify-center overflow-hidden shrink-0 group">
                                        {customerImage ? (
                                            <>
                                                <img src={customerImage} alt="Customer" className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCustomerImage(null)} title="Remove Photo">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <User className="h-20 w-20 text-muted-foreground/50" />
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    {!isCameraOpen ? (
                                        <div className="flex flex-wrap items-center justify-center gap-4">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleDiskUpload}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="gap-2"
                                            >
                                                <ImageIcon className="h-4 w-4" /> Upload from Disk
                                            </Button>
                                            <span className="text-xs text-muted-foreground font-medium">- OR -</span>
                                            <Button
                                                type="button"
                                                onClick={startCamera}
                                                className="gap-2"
                                            >
                                                <Camera className="h-4 w-4" /> Take Picture
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-md space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-muted shadow-lg">
                                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full" onClick={stopCamera}>
                                                    <X className="h-5 w-5" />
                                                </Button>
                                            </div>
                                            <div className="flex justify-center pt-2">
                                                <Button type="button" variant="default" size="lg" className="h-14 w-14 rounded-full border-4 border-muted shadow-lg hover:scale-105 transition-all bg-red-500 hover:bg-red-600" onClick={capturePhoto} title="Capture Photo">
                                                    <Camera className="h-6 w-6 text-white" />
                                                </Button>
                                            </div>
                                            <div className="text-center text-xs text-muted-foreground">
                                                Position the customer in the frame and click the camera button to capture.
                                            </div>
                                        </div>
                                    )}

                                    {/* HIDDEN CANVAS FOR CAPTURE */}
                                    <canvas ref={canvasRef} className="hidden" />

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

                                <div className="sm:col-span-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Loan Type / Scheme <span className="text-red-500">*</span></Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            className={`cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-all ${formData.loanScheme === 'EMI' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:border-primary/50'}`}
                                            onClick={() => handleChange("loanScheme", "EMI")}
                                        >
                                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${formData.loanScheme === 'EMI' ? 'border-primary' : 'border-muted-foreground'}`}>
                                                {formData.loanScheme === 'EMI' && <div className="h-2 w-2 rounded-full bg-primary" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">EMI Based</p>
                                                <p className="text-xs text-muted-foreground">Principal + Interest monthly</p>
                                            </div>
                                        </div>

                                        <div
                                            className={`cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-all ${formData.loanScheme === 'InterestOnly' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:border-primary/50'}`}
                                            onClick={() => handleChange("loanScheme", "InterestOnly")}
                                        >
                                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${formData.loanScheme === 'InterestOnly' ? 'border-primary' : 'border-muted-foreground'}`}>
                                                {formData.loanScheme === 'InterestOnly' && <div className="h-2 w-2 rounded-full bg-primary" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">Interest Only</p>
                                                <p className="text-xs text-muted-foreground">Bullet Repayment</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {formData.loanScheme === 'InterestOnly' && (
                                    <div className="sm:col-span-2 flex items-center space-x-3 rounded-xl border p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200/50 dark:border-yellow-700/30">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="advance-interest"
                                                type="checkbox"
                                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary accent-primary"
                                                checked={formData.interestPaidInAdvance}
                                                onChange={(e) => setFormData(prev => ({ ...prev, interestPaidInAdvance: e.target.checked }))}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <Label htmlFor="advance-interest" className="text-sm font-bold cursor-pointer text-foreground">Collect Interest in Advance</Label>
                                            <span className="text-xs text-muted-foreground/80">Deduct first month's interest (<span className="font-mono font-bold">₹{calculations.firstMonthInterest?.toLocaleString() ?? 0}</span>) from the disbursement amount.</span>
                                        </div>
                                    </div>
                                )}

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
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tenure <span className="text-red-500">*</span></Label>
                                    <div className="flex shadow-sm rounded-md">
                                        <Input
                                            type="number"
                                            className="h-10 rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:border-primary"
                                            placeholder={formData.indefiniteTenure ? "Unlimited" : "Ex. 12"}
                                            value={formData.indefiniteTenure ? "" : formData.tenureMonths}
                                            onChange={e => handleChange("tenureMonths", e.target.value)}
                                            disabled={formData.indefiniteTenure}
                                            required={!formData.indefiniteTenure}
                                        />
                                        <Select value={formData.tenureUnit} onValueChange={val => handleChange("tenureUnit", val)} disabled={formData.indefiniteTenure}>
                                            <SelectTrigger className="w-[110px] rounded-l-none bg-muted/50 h-10 border-l border-input">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Months">Months</SelectItem>
                                                <SelectItem value="Weeks">Weeks</SelectItem>
                                                <SelectItem value="Days">Days</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {formData.loanScheme === 'InterestOnly' && (
                                    <div className="sm:col-span-2 flex items-center space-x-2 mt-[-10px] mb-2">
                                        <input
                                            id="indefinite-tenure"
                                            type="checkbox"
                                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary accent-primary"
                                            checked={formData.indefiniteTenure}
                                            onChange={(e) => setFormData(prev => ({ ...prev, indefiniteTenure: e.target.checked, tenureMonths: e.target.checked ? "0" : prev.tenureMonths }))}
                                        />
                                        <Label htmlFor="indefinite-tenure" className="text-sm cursor-pointer text-muted-foreground">No Fixed Tenure (Indefinite Duration)</Label>
                                    </div>
                                )}

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
                                        <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-wider mb-1">
                                            {formData.loanScheme === 'InterestOnly'
                                                ? `${formData.repaymentFrequency} Interest`
                                                : `${formData.repaymentFrequency} Installment (EMI)`}
                                        </p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold tracking-tight">₹{calculations.emi.toLocaleString()}</span>
                                            <span className="text-sm text-primary-foreground/60">
                                                {formData.repaymentFrequency === 'Monthly' ? '/ month' :
                                                    formData.repaymentFrequency === 'Weekly' ? '/ week' : '/ day'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-4 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 backdrop-blur-sm">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-primary-foreground/70">Principal</span>
                                            <span className="font-semibold">₹{parseInt(formData.loanAmount || '0').toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-primary-foreground/70">Total Interest</span>
                                            <span className="font-semibold text-emerald-200">
                                                {formData.indefiniteTenure ? 'Variable / Indefinite' : `+ ₹${calculations.totalInterest.toLocaleString()}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-primary-foreground/70">Processing Fee</span>
                                            <span className="font-semibold text-red-200">- ₹{calculations.processingFeeAmount.toLocaleString()}</span>
                                        </div>

                                        {formData.loanScheme === "InterestOnly" && formData.interestPaidInAdvance && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-primary-foreground/70">Interest (Advance)</span>
                                                <span className="font-semibold text-red-200">- ₹{calculations.firstMonthInterest.toLocaleString()}</span>
                                            </div>
                                        )}

                                        <Separator className="bg-primary-foreground/10 my-2" />
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-sm font-bold text-primary-foreground/90 uppercase">Net Disbursal</span>
                                            <span className="text-xl font-bold text-primary-foreground">₹{calculations.netDisbursal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-primary-foreground/50 px-1">
                                        <span>Total Payable Amount</span>
                                        <span>{formData.indefiniteTenure ? 'Principal + Monthly Int.' : `₹${calculations.totalPayable.toLocaleString()}`}</span>
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

            {/* Receipt Modal */}
            <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
                <DialogContent className="max-w-[fit-content] w-auto p-0 bg-transparent border-none shadow-none text-transparent">
                    <DialogTitle className="sr-only">Disbursement Receipt</DialogTitle>

                    <div className="relative bg-white dark:bg-zinc-950 rounded-lg shadow-2xl overflow-hidden max-w-[95vw] md:max-w-5xl w-full flex flex-col">
                        {/* Toolbar */}
                        <div className="flex justify-end p-4 border-b bg-muted/20 print:hidden gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowReceipt(false);
                                    toast.success("Receipt Saved, Form Reset");

                                    // Full Form Reset
                                    setFormData({
                                        firstName: "",
                                        lastName: "",
                                        mobile: "",
                                        email: "",
                                        address: "",
                                        aadhar: "",
                                        pan: "",
                                        loanScheme: "EMI",
                                        interestPaidInAdvance: false,
                                        interestType: "Flat",
                                        interestRateUnit: "Yearly",
                                        repaymentFrequency: "Monthly",
                                        loanAmount: "",
                                        interestRate: "",
                                        tenureMonths: "",
                                        tenureUnit: "Months",
                                        startDate: new Date().toISOString().split('T')[0],

                                        processingFeePercent: "1",
                                        paymentModes: [{ type: "Cash", amount: "", reference: "" }],
                                        indefiniteTenure: false,

                                        // Lifecycle 2.0
                                        gracePeriodDays: "0",
                                        penaltyConfig: { type: "Fixed", value: "0" },
                                        holidayHandling: "Ignore",
                                        advancePaymentAction: "ReduceNextEMI"
                                    });
                                    setCustomerImage(null);
                                }}
                                className="gap-2 font-bold shadow-sm text-primary"
                            >
                                <Check className="h-4 w-4 text-green-600" /> Save & Close
                            </Button>
                            <Button onClick={handlePrint} className="gap-2 font-bold shadow-sm">
                                <Printer className="h-4 w-4" /> Print Receipt
                            </Button>
                        </div>

                        {/* Paper Preview */}
                        <div className="p-8 overflow-auto max-h-[85vh] bg-gray-100/50 dark:bg-zinc-900/50 flex justify-center">
                            <div className="origin-top scale-[0.6] sm:scale-60 shadow-2xl">
                                {(() => {
                                    const TemplateComponent = getTemplate(printTemplate).disbursalComponent || getTemplate('classic').disbursalComponent;
                                    return (
                                        <TemplateComponent
                                            ref={componentRef}
                                            data={{
                                                loanAccountNo: `LN-${Math.floor(Math.random() * 10000)}`,
                                                customerName: `${formData.firstName} ${formData.lastName}`,
                                                address: formData.address,
                                                mobile: formData.mobile,
                                                disbursedDate: formData.startDate,

                                                loanAmount: parseFloat(formData.loanAmount),
                                                interestRate: parseFloat(formData.interestRate),
                                                tenureMonths: parseInt(formData.tenureMonths),
                                                emiAmount: calculations.emi,
                                                processingFee: calculations.processingFeeAmount,
                                                netDisbursal: calculations.netDisbursal,

                                                loanScheme: formData.loanScheme,
                                                interestPaidInAdvance: formData.interestPaidInAdvance,
                                                firstMonthInterest: calculations.firstMonthInterest,

                                                paymentModes: formData.paymentModes,
                                                repaymentFrequency: formData.repaymentFrequency,
                                                schedule: calculations.schedule
                                            }}
                                            company={{
                                                ...companySettings,
                                                phone: companySettings.mobile,
                                                website: "www.loanerp.com"
                                            }}
                                        />
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
