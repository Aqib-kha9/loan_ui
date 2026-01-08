import React from 'react';
import { CompanySettings } from "@/components/providers/settings-provider";

interface DisbursementReceiptProps {
    data: {
        loanAccountNo: string;
        customerName: string;
        address?: string;
        mobile?: string;
        disbursedDate: string;
        loanAmount: number;
        interestRate: number;
        tenureMonths: number;
        emiAmount: number;
        processingFee: number;
        netDisbursal: number;
        loanScheme: string;
        interestPaidInAdvance?: boolean;
        firstMonthInterest?: number;
        paymentModes: { type: string, amount: string, reference: string }[];
    };
    company: CompanySettings;
}

export const MinimalDisbursal = React.forwardRef<HTMLDivElement, DisbursementReceiptProps>(({ data, company }, ref) => {
    return (
        <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-black font-sans mx-auto shadow-2xl flex flex-col p-20 box-border">

            {/* Header */}
            <div className="mb-20 flex justify-between items-start">
                <div>
                    {company.logoUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={company.logoUrl} alt="Logo" className="h-12 w-auto object-contain mb-4 grayscale" />
                    )}
                    <h1 className="text-xl font-bold tracking-tight mb-2">{company.name}</h1>
                    <div className="h-1 w-20 bg-black"></div>
                </div>
                <div className="text-right text-xs text-gray-400">
                    <p>{company.address}</p>

                </div>
            </div>

            {/* Title */}
            <div className="flex justify-between items-end mb-16">
                <h2 className="text-6xl font-black tracking-tighter text-gray-200 uppercase">Sanction</h2>
                <div className="text-right">
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Net Disbursal</p>
                    <p className="text-3xl font-light">₹{data.netDisbursal.toLocaleString()}</p>
                </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-x-20 gap-y-8 mb-16 border-t border-b border-gray-100 py-8">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 tracking-widest">CLIENT</label>
                    <p className="text-xl font-medium">{data.customerName}</p>
                    <p className="text-sm text-gray-500 mt-1">{data.address}</p>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 tracking-widest">LOAN TERMS</label>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Principal</span>
                        <span className="font-mono text-sm">₹{data.loanAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Rate</span>
                        <span className="font-mono text-sm">{data.interestRate}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500">EMI</span>
                        <span className="font-mono text-sm">₹{data.emiAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <div className="grid grid-cols-2 text-[10px] font-bold text-gray-400 mb-4 px-2 tracking-widest">
                    <div>ITEM</div>
                    <div className="text-right">AMOUNT</div>
                </div>

                <div className="border-t border-black mb-12">
                    <div className="flex justify-between py-3 px-2 border-b border-gray-100">
                        <span className="font-medium text-sm">Sanctioned Amount</span>
                        <span className="font-mono text-sm">₹{data.loanAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 px-2 border-b border-gray-100 text-gray-500">
                        <span className="text-sm">Processing Fee</span>
                        <span className="font-mono text-sm">- ₹{data.processingFee.toLocaleString()}</span>
                    </div>
                    {data.interestPaidInAdvance && (
                        <div className="flex justify-between py-3 px-2 border-b border-gray-100 text-gray-500">
                            <span className="text-sm">Advance Interest</span>
                            <span className="font-mono text-sm">- ₹{data.firstMonthInterest?.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-4 px-2 font-bold text-lg">
                        <span>Net Disbursal</span>
                        <span>₹{data.netDisbursal.toLocaleString()}</span>
                    </div>
                </div>

                <p className="text-xs text-gray-400 mb-2">MODE OF PAYMENT</p>
                <div className="flex gap-4">
                    {data.paymentModes.map((m, i) => (
                        <span key={i} className="border border-gray-200 px-3 py-1 rounded text-xs text-gray-600">
                            {m.type}: ₹{m.amount}
                        </span>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-8 border-t border-black flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-gray-400">
                <div>
                    <p className="mb-2 text-black">Borrower Sign</p>
                </div>
                <div>
                    {company.showSignatory && (
                        <>
                            {(() => {
                                const fullText = company.signatoryText || "Authorized Signatory";
                                const match = fullText.match(/^(authorized signatory)\s+(.+)$/i);
                                if (match) {
                                    return (
                                        <>
                                            <p className="mb-1 text-black text-right">{match[1]}</p>
                                            <p className="mb-2 text-gray-500 text-right font-medium">{match[2]}</p>
                                        </>
                                    );
                                }
                                return <p className="mb-2 text-black text-right">{fullText}</p>;
                            })()}

                        </>
                    )}
                </div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-300 mt-4">
                {company.showComputerGenerated && <p>{company.computerGeneratedText}</p>}
                {company.showJurisdiction && <p className="uppercase tracking-widest">{company.jurisdictionText}</p>}
            </div>
        </div>
    );
});

MinimalDisbursal.displayName = "MinimalDisbursal";
