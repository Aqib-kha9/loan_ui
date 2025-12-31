"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
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
    Printer,
    CheckCircle,
    FileText,
    Receipt,
    Eye,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    Type,
    Smartphone
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/components/providers/settings-provider";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useReactToPrint } from "react-to-print";

// Templates Registry
import { TEMPLATE_REGISTRY } from "@/components/templates/registry";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { companySettings, updateCompanySettings, printTemplate, setPrintTemplate } = useSettings();

    const [mounted, setMounted] = useState(false);
    const [colorTheme, setColorTheme] = useState("zinc");
    const [formData, setFormData] = useState(companySettings);
    const [previewMode, setPreviewMode] = useState<"receipt" | "statement">("receipt");

    // Print Logic
    const printRef = useRef<HTMLDivElement>(null);
    const [tempPrintComponent, setTempPrintComponent] = useState<React.ReactNode>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Preview_${previewMode}`,
        onAfterPrint: () => setTempPrintComponent(null)
    });

    const triggerPreviewPrint = (Component: any) => {
        setTempPrintComponent(
            <Component
                data={previewMode === "receipt" ? receiptData : statementData}
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
        toast.success("Company profile saved successfully!");
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

    const allThemes = [
        { type: "Standard", id: "zinc", name: "Zinc", color: "bg-zinc-600", desc: "Default Grey" },
        { type: "Standard", id: "slate", name: "Slate", color: "bg-slate-600", desc: "Professional" },
        { type: "Standard", id: "blue", name: "Blue", color: "bg-blue-600", desc: "Corporate" },
        { type: "Standard", id: "violet", name: "Violet", color: "bg-violet-600", desc: "Creative" },
        { type: "Standard", id: "rose", name: "Rose", color: "bg-rose-600", desc: "Playful" },
        { type: "Standard", id: "orange", name: "Orange", color: "bg-orange-600", desc: "Warm" },
        { type: "Standard", id: "green", name: "Green", color: "bg-emerald-600", desc: "Nature" },
        { type: "Pro", id: "midnight", name: "Midnight", color: "bg-[#1e293b]", desc: "Deep Navy Tint" },
        { type: "Pro", id: "forest", name: "Forest", color: "bg-[#052e16]", desc: "Deep Green Tint" },
        { type: "Pro", id: "wine", name: "Wine", color: "bg-[#4a0404]", desc: "Deep Red Tint" },
    ];

    const TemplatePreviewCard = ({
        template,
        currentMode
    }: { template: any, currentMode: "receipt" | "statement" }) => {
        const Component = currentMode === 'receipt' ? template.receiptComponent : template.statementComponent;

        return (
            <div
                className={cn(
                    "group relative rounded-xl border-2 overflow-hidden transition-all duration-300 bg-zinc-100 dark:bg-zinc-900 flex flex-col h-full",
                    printTemplate === template.id
                        ? "border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02]"
                        : "border-transparent hover:border-muted-foreground/30 hover:shadow-md"
                )}
            >
                {/* Selection Click Area */}
                <div className="absolute inset-0 z-0 cursor-pointer" onClick={() => setPrintTemplate(template.id)}></div>

                <div className="p-4 border-b bg-white dark:bg-black flex justify-between items-center shrink-0 z-10 relative pointer-events-none">
                    <div className="flex flex-col">
                        <h3 className="font-bold flex items-center gap-2 text-sm">
                            <template.icon className="h-4 w-4 text-muted-foreground" /> {template.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{template.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {template.isPro && <Badge variant="secondary" className="text-[10px] px-1 h-5 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 border-none">PRO</Badge>}
                        {printTemplate === template.id && <CheckCircle className="text-primary h-5 w-5 fill-primary/10" />}
                    </div>
                </div>

                {/* Consistent Scaled Container */}
                <div className="h-[320px] w-full overflow-hidden bg-gray-100/50 dark:bg-gray-900/50 relative flex justify-center p-4">
                    <div className="transform scale-[0.45] origin-top shadow-xl pointer-events-none bg-white transition-transform group-hover:scale-[0.47] duration-500">
                        <Component
                            data={currentMode === "receipt" ? receiptData : statementData}
                            company={formData}
                        />
                    </div>

                    {/* Hover Actions Overlay */}
                    <div className="absolute inset-0 z-20 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none backdrop-blur-[1px]">
                        <Button
                            variant="default"
                            size="sm"
                            className="pointer-events-auto shadow-lg bg-primary hover:bg-primary/90"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPrintTemplate(template.id);
                            }}
                        >
                            <Check className="mr-2 h-4 w-4" /> Select This
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="pointer-events-auto shadow-lg bg-white/90 hover:bg-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                triggerPreviewPrint(Component);
                            }}
                        >
                            <Eye className="mr-2 h-4 w-4" /> Preview
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    if (!mounted) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20 p-6">
            {/* Hidden Print Area */}
            <div style={{ display: "none" }}>
                <div ref={printRef}>
                    {tempPrintComponent}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <SettingsIcon className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Configuration</h2>
                    <p className="text-muted-foreground">Customize your ERP experience.</p>
                </div>
            </div>

            <Tabs defaultValue="company" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mb-8 bg-muted/50 p-1">
                    <TabsTrigger value="company">Profile</TabsTrigger>
                    <TabsTrigger value="appearance">Theme</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                {/* --- COMPANY TAB --- */}
                <TabsContent value="company" className="mt-0 space-y-6">
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" /> Company Identity
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    These details will appear on all your printed documents, receipts, and reports.
                                </p>
                            </div>
                            <Separator />
                            <div className="bg-amber-50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-200 p-4 rounded-lg text-xs leading-relaxed border border-amber-100 dark:border-amber-900/20">
                                Tip: Ensure your GSTIN and official address are correct for invoice compliance.
                            </div>
                        </div>

                        <Card className="lg:col-span-2 shadow-sm border-muted/60">
                            <CardContent className="p-6 grid gap-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                                            <Building2 className="h-3 w-3" /> Company Name
                                        </Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="font-semibold text-lg bg-muted/5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                                            <CreditCard className="h-3 w-3" /> GSTIN / Reg No
                                        </Label>
                                        <Input
                                            value={formData.gstin}
                                            onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                            className="font-mono bg-muted/5"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                                        <Type className="h-3 w-3" /> Tagline / Slogan
                                    </Label>
                                    <Input
                                        value={formData.tagline}
                                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                        placeholder="e.g. Trusted Financial Partner"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                                        <MapPin className="h-3 w-3" /> Registered Address
                                    </Label>
                                    <Textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows={3}
                                        className="resize-none"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                                            <Smartphone className="h-3 w-3" /> Contact Mobile
                                        </Label>
                                        <Input
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                                            <Mail className="h-3 w-3" /> Contact Email
                                        </Label>
                                        <Input
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t p-4 bg-muted/5">
                                <Button onClick={handleSaveCompany} size="lg" className="px-8 shadow-lg shadow-primary/20">
                                    <Save className="mr-2 h-4 w-4" /> Save Attributes
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- APPEARANCE TAB --- */}
                <TabsContent value="appearance" className="space-y-8 mt-0">
                    <Card className="border-muted/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Monitor className="h-5 w-5 text-primary" /> Interface Theme</CardTitle>
                            <CardDescription>Choose how the application looks to you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <section className="space-y-4">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Brightness Mode</Label>
                                <div className="grid grid-cols-3 gap-4 max-w-lg">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all", theme === 'light' ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted")}
                                    >
                                        <Sun className="h-6 w-6" /> <span className="text-sm font-medium">Light</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all", theme === 'dark' ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted")}
                                    >
                                        <Moon className="h-6 w-6" /> <span className="text-sm font-medium">Dark</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('system')}
                                        className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all", theme === 'system' ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted")}
                                    >
                                        <Monitor className="h-6 w-6" /> <span className="text-sm font-medium">System</span>
                                    </button>
                                </div>
                            </section>
                            <Separator />
                            <section className="space-y-4">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Accent Color</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {allThemes.map((c) => (
                                        <button key={c.id} onClick={() => changeColorTheme(c.id)} className={cn("relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:bg-muted text-center group", colorTheme === c.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted/40 bg-zinc-50 dark:bg-zinc-900/50")}>
                                            {c.type === "Pro" && <span className="absolute top-2 right-2 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5"><Sparkles className="h-2 w-2" /> PRO</span>}
                                            <div className={cn("w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-transform group-hover:scale-110", c.color)}>{colorTheme === c.id && <Check className="text-white h-4 w-4" />}</div>
                                            <div>
                                                <p className="font-medium text-sm">{c.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- TEMPLATES TAB --- */}
                <TabsContent value="templates" className="mt-0 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900/50 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-blue-900/50 rounded-lg shadow-sm text-blue-600 dark:text-blue-400">
                                <LayoutTemplate className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Document Templates</h3>
                                <p className="text-sm text-muted-foreground">Select a professional design for your receipts and statements.</p>
                            </div>
                        </div>

                        <div className="flex items-center bg-white dark:bg-black/20 p-1.5 rounded-full border shadow-sm">
                            <button
                                onClick={() => setPreviewMode("receipt")}
                                className={cn("px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2", previewMode === 'receipt' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted")}
                            >
                                <Receipt className="h-3.5 w-3.5" /> Payment Receipt
                            </button>
                            <button
                                onClick={() => setPreviewMode("statement")}
                                className={cn("px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2", previewMode === 'statement' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted")}
                            >
                                <FileText className="h-3.5 w-3.5" /> Loan Statement
                            </button>
                        </div>
                    </div>

                    <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6 pb-20">
                        {TEMPLATE_REGISTRY.map((template) => (
                            <TemplatePreviewCard
                                key={template.id}
                                template={template}
                                currentMode={previewMode}
                            />
                        ))}
                    </div>

                </TabsContent>
            </Tabs>
        </div>
    );
}

function SettingsIcon({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
}
