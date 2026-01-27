"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer, PenLine } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { RegionalDisbursal } from "@/components/templates/RegionalDisbursal";
import { RegionalTemplate } from "@/components/templates/RegionalTemplate";
import { useSettings } from "@/components/providers/settings-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function DownloadsPage() {
    const { companySettings } = useSettings();
    const blankPromissoryRef = useRef<HTMLDivElement>(null);
    const blankVoucherRef = useRef<HTMLDivElement>(null);

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
    const [isFillDialogOpen, setIsFillDialogOpen] = React.useState(false);
    const [activeTemplate, setActiveTemplate] = React.useState<'promissory' | 'voucher' | null>(null);

    const [templateData, setTemplateData] = React.useState<any>({});

    const openFillDialog = (type: 'promissory' | 'voucher') => {
        setActiveTemplate(type);
        setTemplateData({}); // Reset
        setIsFillDialogOpen(true);
    };

    const handlePrintFilled = () => {
        if (activeTemplate === 'promissory') handlePrintPromissory();
        if (activeTemplate === 'voucher') handlePrintVoucher();
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
                        <div className="mb-4 rounded-full w-12 h-12 bg-blue-100 flex items-center justify-center text-blue-600">
                            <FileText className="w-6 h-6" />
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
                        <div className="mb-4 rounded-full w-12 h-12 bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Download className="w-6 h-6" />
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

            </div>

            {/* Hidden Print Content */}
            <div className="hidden">
                <div ref={blankPromissoryRef}>
                    <RegionalDisbursal
                        data={activeTemplate === 'promissory' ? templateData : {}}
                        company={companySettings}
                    />
                </div>
                <div ref={blankVoucherRef}>
                    <RegionalTemplate
                        data={activeTemplate === 'voucher' ? templateData : {}}
                        company={companySettings}
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
                                    company={companySettings}
                                    mode="edit"
                                    onChange={(field, val) => handleInputChange(field, val)}
                                />
                            )}
                            {activeTemplate === 'voucher' && (
                                <RegionalTemplate
                                    data={templateData}
                                    company={companySettings}
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

        </div>
    );
}
