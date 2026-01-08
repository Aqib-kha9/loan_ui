"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Check,
    LayoutTemplate,
    Palette,
    Moon,
    Sun,
    Monitor,
    Sparkles,
    Building2,
    Save,
    CheckCircle,
    FileText,
    Receipt,
    Eye,
    Globe,
    ChevronRight,
    Search,
    CreditCard,
    Smartphone,
    Mail,
    Type
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/components/providers/settings-provider";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useReactToPrint } from "react-to-print";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Templates Registry
import { TEMPLATE_REGISTRY } from "@/components/templates/registry";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { companySettings, updateCompanySettings, printTemplate, setPrintTemplate } = useSettings();

    const [mounted, setMounted] = useState(false);
    const [colorTheme, setColorTheme] = useState("zinc");
    const [formData, setFormData] = useState(companySettings);
    const [previewMode, setPreviewMode] = useState<"receipt" | "statement" | "disbursal">("receipt");

    // Print Logic
    const printRef = useRef<HTMLDivElement>(null);
    const [tempPrintComponent, setTempPrintComponent] = useState<React.ReactNode>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Preview_${previewMode}`,
        onAfterPrint: () => setTempPrintComponent(null)
    });

    const triggerPreviewPrint = (Component: any) => {
        let data: any = receiptData;
        if (previewMode === "statement") data = statementData;
        if (previewMode === "disbursal") data = disbursalData;

        setTempPrintComponent(
            <Component
                data={data}
                company={formData}
            />
        );
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    useEffect(() => {
        setMounted(true);
        const currentTheme = document.documentElement.getAttribute("data-theme") || "zinc";
        setColorTheme(currentTheme);
        setFormData(companySettings);
    }, [companySettings]);

    const changeColorTheme = (newColor: string) => {
        const root = document.documentElement;
        root.setAttribute("data-theme", newColor);
        setColorTheme(newColor);
    };

    const handleSaveCompany = () => {
        updateCompanySettings(formData);
        toast.success("Settings saved successfully.");
    }

    // Mock data for previews
    const receiptData = {
        customerName: "Rahul Sharma",
        loanAccountNo: "LN-2024-001",
        amount: "15500",
        emisPaid: 5,
        tenureMonths: 12
    };

    const statementData = {
        customerName: "Rahul Sharma",
        loanAccountNo: "LN-2024-001",
        address: "123, Gandhi Nagar, Delhi",
        mobile: "+91 9876543210",
        sanctionDate: "01/01/2024",
        loanAmount: "500000",
        interestRate: "12%",
        transactions: [
            { date: "01/01/2024", type: "Loan Disbursed", amount: "500000", ref: "DISB001" },
            { date: "01/02/2024", type: "EMI Payment", amount: "15500", ref: "EMI001" },
            { date: "01/03/2024", type: "EMI Payment", amount: "15500", ref: "EMI002" },
        ]
    };

    const disbursalData = {
        loanAccountNo: "LN-2024-001",
        customerName: "Rahul Sharma",
        address: "123, Gandhi Nagar, Delhi - 110001",
        mobile: "+91 9876543210",
        disbursedDate: "2024-01-01",
        loanAmount: 500000,
        interestRate: 12,
        tenureMonths: 24,
        emiAmount: 23537,
        processingFee: 5000,
        netDisbursal: 495000,
        loanScheme: 'EMI',
        interestPaidInAdvance: false,
        paymentModes: [
            { type: "IMPS", amount: "200000", reference: "IMPS123456" },
            { type: "NEFT", amount: "295000", reference: "NEFT123456" }
        ]
    };

    const allThemes = [
        { type: "Standard", id: "zinc", name: "Zinc", color: "bg-zinc-600", desc: "Classic" },
        { type: "Standard", id: "slate", name: "Slate", color: "bg-slate-600", desc: "Pro" },
        { type: "Standard", id: "blue", name: "Blue", color: "bg-blue-600", desc: "Corp" },
        { type: "Standard", id: "violet", name: "Violet", color: "bg-violet-600", desc: "Vibe" },
        { type: "Standard", id: "rose", name: "Rose", color: "bg-rose-600", desc: "Play" },
        { type: "Standard", id: "orange", name: "Orange", color: "bg-orange-600", desc: "Warm" },
        { type: "Standard", id: "green", name: "Green", color: "bg-emerald-600", desc: "Eco" },
        { type: "Pro", id: "midnight", name: "Midnight", color: "bg-[#1e293b]", desc: "Deep Navy Tint" },
        { type: "Pro", id: "forest", name: "Forest", color: "bg-[#052e16]", desc: "Deep Green Tint" },
        { type: "Pro", id: "wine", name: "Wine", color: "bg-[#4a0404]", desc: "Deep Red Tint" },
    ];

    if (!mounted) return null;

    // Helper to get correct mock data
    const getPreviewData = (mode: string) => {
        if (mode === "receipt") return receiptData;
        if (mode === "statement") return statementData;
        return disbursalData;
    };

    return (
        <div className="-m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] h-[calc(100vh-1rem)] overflow-y-auto bg-muted/5 relative">

            {/* Ambient Background Gradient */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50" />
            </div>

            {/* Hidden Print Wrapper */}
            <div style={{ display: "none" }}>
                <div ref={printRef}>
                    {tempPrintComponent}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12 relative z-10 space-y-16">

                {/* Header Actions */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                        <p className="text-muted-foreground mt-2 text-lg">Manage your workspace preferences.</p>
                    </div>
                </div>

                {/* --- COMPANY PROFILE SECTION --- */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" /> Company Profile
                        </h2>
                        <Button onClick={handleSaveCompany} size="sm" className="shadow-lg shadow-primary/20">Save Changes</Button>
                    </div>

                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Split Row: Name */}
                        <div className="grid md:grid-cols-3 gap-8 items-start">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Business Name</Label>
                                <p className="text-sm text-muted-foreground">This will be displayed on all your documents.</p>
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="max-w-md h-11 bg-background"
                                />
                            </div>
                        </div>
                        <Separator />



                        {/* Split Row: Address */}
                        <div className="grid md:grid-cols-3 gap-8 items-start">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Registered Address</Label>
                                <p className="text-sm text-muted-foreground">The full address included in invoices.</p>
                            </div>
                            <div className="md:col-span-2">
                                <Textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="max-w-md min-h-[100px] bg-background resize-none"
                                />
                            </div>
                        </div>
                        <Separator />

                        {/* Split Row: Contact */}
                        <div className="grid md:grid-cols-3 gap-8 items-start">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Contact Details</Label>
                                <p className="text-sm text-muted-foreground">How customers can reach you.</p>
                            </div>
                            <div className="md:col-span-2 grid gap-4 max-w-md">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            className="pl-9 bg-background h-10"
                                            placeholder="Mobile"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="pl-9 bg-background h-10"
                                            placeholder="Email"
                                        />
                                    </div>
                                </div>
                                <div className="relative">
                                    <Type className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={formData.tagline}
                                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                        className="pl-9 bg-background h-10"
                                        placeholder="Tagline (Optional)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- STATEMENT CONFIGURATION SECTION --- */}
                <section className="space-y-6 pt-8">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" /> Statement Configuration
                        </h2>
                    </div>

                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-600">
                        {/* Split Row: Signatory Toggle */}
                        <div className="grid md:grid-cols-3 gap-8 items-start">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Authorized Signatory</Label>
                                <p className="text-sm text-muted-foreground">Show or hide the signatory block on statements.</p>
                            </div>
                            <div className="md:col-span-2 flex items-center gap-4">
                                <Switch
                                    checked={formData.showSignatory}
                                    onCheckedChange={(c) => setFormData({ ...formData, showSignatory: c })}
                                />
                                <span className="text-sm font-medium">{formData.showSignatory ? 'Shown' : 'Hidden'}</span>
                            </div>
                        </div>

                        {formData.showSignatory && (
                            <>
                                <Separator />
                                {/* Split Row: Signatory Text */}
                                <div className="grid md:grid-cols-3 gap-8 items-start">
                                    <div className="space-y-1">
                                        <Label className="text-base font-semibold">Signatory Label</Label>
                                        <p className="text-sm text-muted-foreground">Custom text for the signatory field (e.g., 'Manager', 'Partner').</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input
                                            value={formData.signatoryText}
                                            onChange={(e) => setFormData({ ...formData, signatoryText: e.target.value })}
                                            className="max-w-md h-11 bg-background"
                                            placeholder="Authorized Signatory"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <Separator />
                        <h3 className="text-lg font-medium pt-2">Legal Disclaimers</h3>

                        {/* Computer Generated */}
                        <div className="grid md:grid-cols-3 gap-8 items-start">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Computer Generated Msg</Label>
                                <p className="text-sm text-muted-foreground">"This is a computer generated..."</p>
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center gap-4">
                                    <Switch checked={formData.showComputerGenerated} onCheckedChange={(c) => setFormData({ ...formData, showComputerGenerated: c })} />
                                    <span className="text-sm font-medium">{formData.showComputerGenerated ? 'Shown' : 'Hidden'}</span>
                                </div>
                                {formData.showComputerGenerated && (
                                    <Input value={formData.computerGeneratedText} onChange={(e) => setFormData({ ...formData, computerGeneratedText: e.target.value })} className="bg-background" />
                                )}
                            </div>
                        </div>

                        {/* End of Statement */}
                        <div className="grid md:grid-cols-3 gap-8 items-start">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Statement End Marker</Label>
                                <p className="text-sm text-muted-foreground">"END OF STATEMENT"</p>
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center gap-4">
                                    <Switch checked={formData.showStatementEnd} onCheckedChange={(c) => setFormData({ ...formData, showStatementEnd: c })} />
                                    <span className="text-sm font-medium">{formData.showStatementEnd ? 'Shown' : 'Hidden'}</span>
                                </div>
                                {formData.showStatementEnd && (
                                    <Input value={formData.statementEndText} onChange={(e) => setFormData({ ...formData, statementEndText: e.target.value })} className="bg-background" />
                                )}
                            </div>
                        </div>

                        {/* Certification */}
                        <div className="grid md:grid-cols-3 gap-8 items-start">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Certification Text</Label>
                                <p className="text-sm text-muted-foreground">"I/We hereby certify..."</p>
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center gap-4">
                                    <Switch checked={formData.showCertification} onCheckedChange={(c) => setFormData({ ...formData, showCertification: c })} />
                                    <span className="text-sm font-medium">{formData.showCertification ? 'Shown' : 'Hidden'}</span>
                                </div>
                                {formData.showCertification && (
                                    <Textarea value={formData.certificationText} onChange={(e) => setFormData({ ...formData, certificationText: e.target.value })} className="bg-background h-20" />
                                )}
                            </div>
                        </div>

                        {/* Jurisdiction */}
                        <div className="grid md:grid-cols-3 gap-8 items-start">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Jurisdiction Clause</Label>
                                <p className="text-sm text-muted-foreground">Legal jurisdiction location.</p>
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center gap-4">
                                    <Switch checked={formData.showJurisdiction} onCheckedChange={(c) => setFormData({ ...formData, showJurisdiction: c })} />
                                    <span className="text-sm font-medium">{formData.showJurisdiction ? 'Shown' : 'Hidden'}</span>
                                </div>
                                {formData.showJurisdiction && (
                                    <Input value={formData.jurisdictionText} onChange={(e) => setFormData({ ...formData, jurisdictionText: e.target.value })} className="bg-background" />
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- APPEARANCE SECTION --- */}
                <section className="space-y-6 pt-8">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Palette className="h-5 w-5 text-primary" /> Branding & Appearance
                        </h2>
                    </div>

                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {/* Split Row: Mode */}
                        <div className="grid md:grid-cols-3 gap-8 items-start">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Interface Theme</Label>
                                <p className="text-sm text-muted-foreground">Select your preferred brightness mode.</p>
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex gap-4 p-1 bg-muted/20 w-fit rounded-xl">
                                    {['light', 'dark', 'system'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setTheme(mode)}
                                            className={cn(
                                                "w-32 h-20 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all hover:bg-muted/50",
                                                theme === mode ? "border-primary bg-background shadow-sm" : "border-transparent text-muted-foreground"
                                            )}
                                        >
                                            {mode === 'light' && <Sun className="h-5 w-5" />}
                                            {mode === 'dark' && <Moon className="h-5 w-5" />}
                                            {mode === 'system' && <Monitor className="h-5 w-5" />}
                                            <span className="capitalize text-xs font-semibold">{mode}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Separator />

                        {/* Split Row: Accent Color */}
                        <div className="grid md:grid-cols-3 gap-8 items-start">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Accent Color</Label>
                                <p className="text-sm text-muted-foreground">Primary color for buttons and highlights.</p>
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex flex-wrap gap-3">
                                    {allThemes.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => changeColorTheme(c.id)}
                                            className={cn(
                                                "h-10 px-4 rounded-full border transition-all flex items-center gap-2 text-sm font-medium",
                                                colorTheme === c.id
                                                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                                                    : "border-border/50 bg-background hover:border-border"
                                            )}
                                        >
                                            <div className={cn("w-3 h-3 rounded-full", c.color)} />
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* --- TEMPLATES SECTION --- */}
                <section className="space-y-6 pt-8 pb-20">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <LayoutTemplate className="h-5 w-5 text-primary" /> Document Templates
                        </h2>
                        <div className="flex bg-muted/20 p-1 rounded-lg">
                            <button
                                onClick={() => setPreviewMode("receipt")}
                                className={cn("px-4 py-1.5 rounded-md text-xs font-bold transition-all", previewMode === 'receipt' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                            >
                                Receipt
                            </button>
                            <button
                                onClick={() => setPreviewMode("statement")}
                                className={cn("px-4 py-1.5 rounded-md text-xs font-bold transition-all", previewMode === 'statement' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                            >
                                Statement
                            </button>
                            <button
                                onClick={() => setPreviewMode("disbursal")}
                                className={cn("px-4 py-1.5 rounded-md text-xs font-bold transition-all", previewMode === 'disbursal' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                            >
                                Disbursal
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {TEMPLATE_REGISTRY.map((template) => {
                            let Component: any;
                            if (previewMode === 'receipt') Component = template.receiptComponent;
                            else if (previewMode === 'statement') Component = template.statementComponent;
                            else Component = template.disbursalComponent;

                            return (
                                <div
                                    key={template.id}
                                    className={cn(
                                        "group rounded-xl border overflow-hidden bg-background transition-all hover:shadow-lg cursor-pointer",
                                        printTemplate === template.id ? "ring-2 ring-primary border-primary" : "border-border/60 hover:border-border"
                                    )}
                                    onClick={() => setPrintTemplate(template.id)}
                                >
                                    <div className="h-48 overflow-hidden bg-muted/10 relative flex justify-center p-4">
                                        <div className="transform scale-[0.4] origin-top shadow-sm bg-white rounded border">
                                            {Component && <ComponentDataWrapper Component={Component} data={getPreviewData(previewMode)} company={formData} />}
                                        </div>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                    </div>
                                    <div className="p-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-sm">{template.name}</h3>
                                            <p className="text-xs text-muted-foreground">{template.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground mr-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    triggerPreviewPrint(Component);
                                                }}
                                                title="Preview Template"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {template.isPro && <Badge variant="secondary" className="text-[10px] h-5">PRO</Badge>}
                                            {printTemplate === template.id && <CheckCircle className="h-5 w-5 text-primary fill-primary/10" />}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}

// Wrapper to separate usage
const ComponentDataWrapper = ({ Component, data, company }: { Component: any, data: any, company: any }) => {
    return <Component data={data} company={company} />;
}
