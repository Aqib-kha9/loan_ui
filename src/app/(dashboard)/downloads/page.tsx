"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer, PenLine, Settings2, X } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { RegionalDisbursal } from "@/components/templates/RegionalDisbursal";
import { RegionalTemplate } from "@/components/templates/RegionalTemplate";
import { PatniReceiptTemplate } from "@/components/templates/PatniReceiptTemplate";
import { useSettings, CompanySettings } from "@/components/providers/settings-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function DownloadsPage() {
    const { companySettings } = useSettings();
    const blankPromissoryRef = useRef<HTMLDivElement>(null);
    const blankVoucherRef = useRef<HTMLDivElement>(null);
    const blankPatniRef = useRef<HTMLDivElement>(null);

    const handlePrintPatni = useReactToPrint({
        contentRef: blankPatniRef,
        documentTitle: `Deposit_Receipt_Template`,
        pageStyle: `
            @page { size: A4; margin: 0mm; }
            @media print { body { -webkit-print-color-adjust: exact; } }
        `
    });

    const handlePrintPromissory = useReactToPrint({
        contentRef: blankPromissoryRef,
        documentTitle: `Promissory_Note_Template`,
        pageStyle: `
            @page {
                size: A4;
                margin: 0mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                }
            }
        `
    });

    const handlePrintVoucher = useReactToPrint({
        contentRef: blankVoucherRef,
        documentTitle: `Payment_Voucher_Template`,
        pageStyle: `
            @page {
                size: A4;
                margin: 0mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                }
            }
        `
    });

    // --- FILL & PRINT LOGIC ---
    const [isFillDialogOpen, setIsFillDialogOpen] = useState(false);
    const [activeTemplate, setActiveTemplate] = useState<'promissory' | 'voucher' | 'cash_voucher' | 'patni' | null>(null);

    const [templateData, setTemplateData] = useState<any>({});

    // --- SETTINGS OVERRIDE LOGIC ---
    const [templateOverrides, setTemplateOverrides] = useState<Record<string, Partial<CompanySettings>>>({});
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
    const [settingsEditTarget, setSettingsEditTarget] = useState<'promissory' | 'voucher' | 'cash_voucher' | 'patni' | null>(null);
    const [currentEditSettings, setCurrentEditSettings] = useState<Partial<CompanySettings>>({});
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('templateCompanyOverrides');
        if (saved) {
            try {
                setTemplateOverrides(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse template overrides", e);
            }
        }
    }, []);

    const saveTemplateOverrides = (newOverrides: Record<string, Partial<CompanySettings>>) => {
        setTemplateOverrides(newOverrides);
        localStorage.setItem('templateCompanyOverrides', JSON.stringify(newOverrides));
    };

    const openSettingsDialog = (type: 'promissory' | 'voucher' | 'cash_voucher' | 'patni') => {
        setSettingsEditTarget(type);
        setCurrentEditSettings(templateOverrides[type] || {});
        setIsSettingsDialogOpen(true);
    };

    const handleSaveSettings = () => {
        if (!settingsEditTarget) return;
        saveTemplateOverrides({
            ...templateOverrides,
            [settingsEditTarget]: currentEditSettings
        });
        setIsSettingsDialogOpen(false);
    };

    const handleClearSettings = () => {
        if (!settingsEditTarget) return;
        const newOverrides = { ...templateOverrides };
        delete newOverrides[settingsEditTarget];
        saveTemplateOverrides(newOverrides);
        setIsSettingsDialogOpen(false);
    };

    const getMergedCompany = (type: 'promissory' | 'voucher' | 'cash_voucher' | 'patni') => {
        return { ...companySettings, ...(templateOverrides[type] || {}) };
    };

    const openFillDialog = (type: 'promissory' | 'voucher' | 'cash_voucher' | 'patni') => {
        setActiveTemplate(type);
        setTemplateData({}); // Reset
        setIsFillDialogOpen(true);
    };

    const handlePrintFilled = () => {
        if (activeTemplate === 'promissory') handlePrintPromissory();
        if (activeTemplate === 'voucher' || activeTemplate === 'cash_voucher') handlePrintVoucher();
        if (activeTemplate === 'patni') handlePrintPatni();
    };

    const handleInputChange = (field: string, value: string) => {
        setTemplateData((prev: any) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Downloads & Printables</h1>
                <p className="text-muted-foreground">Download blank templates for manual filling and offline use.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Promissory Note Card */}
                <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="rounded-full w-12 h-12 bg-blue-100 flex items-center justify-center text-blue-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => openSettingsDialog('promissory')} className="text-gray-400 hover:text-gray-900 z-10">
                                <Settings2 className="w-5 h-5" />
                            </Button>
                        </div>
                        <h3 className="text-xl font-semibold leading-none tracking-tight mb-2">Promissory Note</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Blank legal promissory note template (Regional Gujarati) with revenue stamp placeholder.
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={() => openFillDialog('promissory')} variant="default" className="flex-1 gap-2">
                                <PenLine className="w-4 h-4" /> Fill & Print
                            </Button>
                            <Button onClick={() => handlePrintPromissory()} variant="outline" className="gap-2">
                                <Printer className="w-4 h-4" /> Blank
                            </Button>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 pointer-events-none">
                        <FileText className="w-32 h-32" />
                    </div>
                </div>

                {/* Voucher Card */}
                <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="rounded-full w-12 h-12 bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Download className="w-6 h-6" />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => openSettingsDialog('voucher')} className="text-gray-400 hover:text-gray-900 z-10">
                                <Settings2 className="w-5 h-5" />
                            </Button>
                        </div>
                        <h3 className="text-xl font-semibold leading-none tracking-tight mb-2">Payment Voucher</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Standard payment voucher template for manual receipt entry.
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={() => openFillDialog('voucher')} variant="default" className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                                <PenLine className="w-4 h-4" /> Fill & Print
                            </Button>
                            <Button onClick={() => handlePrintVoucher()} variant="outline" className="gap-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700">
                                <Printer className="w-4 h-4" /> Blank
                            </Button>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 pointer-events-none">
                        <Download className="w-32 h-32" />
                    </div>
                </div>

                {/* Cash Voucher Card */}
                <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="rounded-full w-12 h-12 bg-amber-100 flex items-center justify-center text-amber-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => openSettingsDialog('cash_voucher')} className="text-gray-400 hover:text-gray-900 z-10">
                                <Settings2 className="w-5 h-5" />
                            </Button>
                        </div>
                        <h3 className="text-xl font-semibold leading-none tracking-tight mb-2">Cash Voucher</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Specific voucher for cash disbursements with thumb impression placeholders.
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={() => openFillDialog('cash_voucher')} variant="default" className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                                <PenLine className="w-4 h-4" /> Fill & Print
                            </Button>
                            <Button onClick={() => handlePrintVoucher()} variant="outline" className="gap-2 border-amber-200 hover:bg-amber-50 text-amber-700">
                                <Printer className="w-4 h-4" /> Blank
                            </Button>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 pointer-events-none">
                        <FileText className="w-32 h-32" />
                    </div>
                </div>

            </div>
            {/* Patni Deposit Receipt Card */}
            <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="rounded-full w-12 h-12 bg-purple-100 flex items-center justify-center text-purple-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => openSettingsDialog('patni')} className="text-gray-400 hover:text-gray-900 z-10">
                            <Settings2 className="w-5 h-5" />
                        </Button>
                    </div>
                    <h3 className="text-xl font-semibold leading-none tracking-tight mb-2">Deposit Receipt</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Patni Finance & Investment fixed deposit receipt format.
                    </p>
                    <div className="flex gap-2">
                        <Button onClick={() => openFillDialog('patni')} variant="default" className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                            <PenLine className="w-4 h-4" /> Fill & Print
                        </Button>
                        <Button onClick={() => handlePrintPatni()} variant="outline" className="gap-2 border-purple-200 hover:bg-purple-50 text-purple-700">
                            <Printer className="w-4 h-4" /> Blank
                        </Button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 pointer-events-none">
                    <FileText className="w-32 h-32" />
                </div>
            </div>

            {/* Hidden Print Content */}
            <div className="hidden">
                <div ref={blankPromissoryRef}>
                    <RegionalDisbursal
                        data={{}}
                        company={getMergedCompany('promissory')}
                    />
                </div>
                <div ref={blankVoucherRef}>
                    <RegionalTemplate
                        data={{}}
                        company={getMergedCompany('voucher')}
                    />
                </div>
                <div ref={blankPatniRef}>
                    <PatniReceiptTemplate
                        data={{}}
                        company={getMergedCompany('patni')}
                    />
                </div>
            </div>

            {/* Fill Data Dialog (WYSIWYG) */}
            <Dialog open={isFillDialogOpen} onOpenChange={setIsFillDialogOpen}>
                <DialogContent className="sm:max-w-[95vw] max-w-[95vw] w-full h-[95vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
                        <DialogTitle>Fill & Print Preview</DialogTitle>
                        <DialogDescription>
                            Type directly into the document below. The layout matches the print output.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 bg-slate-100 overflow-auto flex justify-center py-8">
                        {/* Wrapper to center and scale the A4 content */}
                        <div className="scale-[0.6] sm:scale-[0.7] md:scale-[0.85] origin-top shadow-2xl bg-white border border-slate-200">
                            {activeTemplate === 'promissory' && (
                                <RegionalDisbursal
                                    data={templateData}
                                    company={getMergedCompany('promissory')}
                                    mode="edit"
                                    onChange={(field, val) => handleInputChange(field, val)}
                                />
                            )}
                            {(activeTemplate === 'voucher' || activeTemplate === 'cash_voucher') && (
                                <RegionalTemplate
                                    data={templateData}
                                    company={getMergedCompany(activeTemplate)}
                                    mode="edit"
                                    onChange={(field, val) => handleInputChange(field, val)}
                                    title={activeTemplate === 'cash_voucher' ? 'CASH VOUCHER' : undefined}
                                />
                            )}
                            {activeTemplate === 'patni' && (
                                <PatniReceiptTemplate
                                    data={templateData}
                                    company={getMergedCompany('patni')}
                                    mode="edit"
                                    onChange={(field, val) => handleInputChange(field, val)}
                                />
                            )}

                        </div>
                    </div>

                    <div className="flex justify-end gap-3 p-4 border-t bg-white shrink-0">
                        <Button variant="ghost" onClick={() => setIsFillDialogOpen(false)}>Close</Button>
                        <Button onClick={handlePrintFilled} className="gap-2">
                            <Printer className="w-4 h-4" /> Print Document
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Template Settings</DialogTitle>
                        <DialogDescription>
                            Override the global company settings for this specific template. Leave blank to use defaults.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                value={currentEditSettings.name || ''}
                                onChange={(e) => setCurrentEditSettings(prev => ({ ...prev, name: e.target.value }))}
                                placeholder={companySettings.name}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Company Logo</Label>
                            <div className="flex items-center gap-4">
                                {currentEditSettings.logoUrl ? (
                                    <div className="relative group rounded overflow-hidden border bg-white p-1">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={currentEditSettings.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
                                        <Button
                                            variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full scale-0 group-hover:scale-100 transition-transform"
                                            onClick={() => setCurrentEditSettings(prev => ({ ...prev, logoUrl: '' }))}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : null}
                                <div className="flex-1">
                                    <Input
                                        id="logoUpload"
                                        type="file"
                                        accept="image/*"
                                        className="cursor-pointer file:cursor-pointer"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setIsUploadingLogo(true);
                                                const reader = new FileReader();
                                                reader.onloadend = async () => {
                                                    try {
                                                        const res = await fetch('/api/upload', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ image: reader.result })
                                                        });
                                                        const data = await res.json();
                                                        if (data.success) {
                                                            setCurrentEditSettings(prev => ({ ...prev, logoUrl: data.url }));
                                                        } else {
                                                            console.error("Upload failed", data.error);
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                    } finally {
                                                        setIsUploadingLogo(false);
                                                    }
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        disabled={isUploadingLogo}
                                    />
                                    {isUploadingLogo && <span className="text-xs text-muted-foreground mt-1 block font-medium animate-pulse">Uploading to cloud storage...</span>}
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tagline">Tagline</Label>
                            <Input
                                id="tagline"
                                value={currentEditSettings.tagline || ''}
                                onChange={(e) => setCurrentEditSettings(prev => ({ ...prev, tagline: e.target.value }))}
                                placeholder={companySettings.tagline}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={currentEditSettings.address || ''}
                                onChange={(e) => setCurrentEditSettings(prev => ({ ...prev, address: e.target.value }))}
                                placeholder={companySettings.address}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input
                                    id="mobile"
                                    value={currentEditSettings.mobile || ''}
                                    onChange={(e) => setCurrentEditSettings(prev => ({ ...prev, mobile: e.target.value }))}
                                    placeholder={companySettings.mobile}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="landline">Landline Number</Label>
                                <Input
                                    id="landline"
                                    value={currentEditSettings.landline || ''}
                                    onChange={(e) => setCurrentEditSettings(prev => ({ ...prev, landline: e.target.value }))}
                                    placeholder={companySettings.landline || "0265-3594185"}
                                />
                            </div>
                            <div className="grid gap-2 col-span-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={currentEditSettings.email || ''}
                                    onChange={(e) => setCurrentEditSettings(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder={companySettings.email}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between sm:justify-between w-full">
                        <Button variant="destructive" onClick={handleClearSettings} disabled={!templateOverrides[settingsEditTarget!]}>
                            Clear Overrides
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setIsSettingsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveSettings}>Save Context</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div >
    );
}
