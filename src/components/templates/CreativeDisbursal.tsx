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

export const CreativeDisbursal = React.forwardRef<HTMLDivElement, DisbursementReceiptProps>(({ data, company }, ref) => {
    return (
        <div ref={ref} className="print-content w-[210mm] min-h-[297mm] bg-white text-slate-800 font-sans mx-auto shadow-2xl flex flex-col box-border overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-12 relative">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter">{company.name}</h1>
                        <p className="opacity-90">{company.tagline}</p>
                    </div>
                    <div className="text-right bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1">Receipt Date</p>
                        <p className="font-bold">{new Date(data.disbursedDate).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="p-12 flex-1">
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-purple-100 text-purple-600 font-bold p-3 rounded-lg text-xs uppercase tracking-wider">
                        Official Sanction
                    </div>
                    <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
                    <div className="grid grid-cols-2 gap-8 relative z-10">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Borrower</p>
                            <p className="text-2xl font-bold text-gray-800">{data.customerName}</p>
                            <p className="text-gray-500">{data.address}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Loan Account</p>
                            <p className="text-2xl font-mono text-purple-600 font-bold">{data.loanAccountNo}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-12">
                    <div className="bg-purple-50 p-6 rounded-2xl">
                        <p className="text-purple-400 text-xs font-bold uppercase">Sanctioned</p>
                        <p className="text-2xl font-bold text-purple-900">₹{data.loanAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-pink-50 p-6 rounded-2xl">
                        <p className="text-pink-400 text-xs font-bold uppercase">Charges</p>
                        <p className="text-2xl font-bold text-pink-900">₹{data.processingFee.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-2xl">
                        <p className="text-gray-400 text-xs font-bold uppercase">EMI</p>
                        <p className="text-2xl font-bold text-gray-900">₹{data.emiAmount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-gray-900 text-white rounded-2xl p-8 mb-12 flex justify-between items-center shadow-2xl">
                    <div>
                        <p className="text-gray-400 text-sm uppercase font-bold tracking-wider">Net Disbursed Amount</p>
                        <p className="text-xs text-gray-500 mt-1">After deducting all charges</p>
                    </div>
                    <div className="text-4xl font-bold">
                        ₹{data.netDisbursal.toLocaleString()}
                    </div>
                </div>

                <div className="text-sm text-gray-500 mb-8 italic">
                    By signing this document, the borrower acknowledges the receipt of the Net Disbursal Amount via the following modes:
                    {data.paymentModes.map(m => ` ${m.type} (₹${parseFloat(m.amount || "0").toLocaleString()})`).join(', ')}.
                </div>

            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-12 mt-auto">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="w-56 h-px bg-gray-300 mb-4"></div>
                        <p className="font-bold text-gray-600 uppercase text-xs tracking-wider">Borrower Signature</p>
                    </div>
                    <div className="text-right">
                        {company.showSignatory && (
                            <>
                                {(() => {
                                    const fullText = company.signatoryText || "Authorized Signatory";
                                    const match = fullText.match(/^(authorized signatory)\s+(.+)$/i);
                                    if (match) {
                                        return (
                                            <>
                                                <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-1">{match[1]}</p>
                                                <p className="text-xs text-purple-400 font-medium mb-2">{match[2]}</p>
                                            </>
                                        );
                                    }
                                    return <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">{fullText}</p>;
                                })()}
                                <div className="w-56 h-px bg-gray-300 ml-auto mb-1"></div>

                            </>
                        )}
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400 space-y-1">
                    {company.showComputerGenerated && <p>{company.computerGeneratedText || "Computer Generated Receipt"}</p>}
                    {company.showJurisdiction && <p className="font-bold uppercase tracking-wider">{company.jurisdictionText}</p>}
                </div>
            </div>
        </div>
    );
});

CreativeDisbursal.displayName = "CreativeDisbursal";
