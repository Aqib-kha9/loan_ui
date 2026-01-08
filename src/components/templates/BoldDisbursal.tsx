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

export const BoldDisbursal = React.forwardRef<HTMLDivElement, DisbursementReceiptProps>(({ data, company }, ref) => {
    return (
        <div ref={ref} className="print-content w-[210mm] min-h-[297mm] bg-white text-black font-sans mx-auto shadow-2xl flex flex-col box-border">
            {/* Header */}
            <div className="bg-black text-white p-12 flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">{company.name}</h1>
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-400">{company.tagline}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold uppercase tracking-widest border-2 border-white px-4 py-2 inline-block">Disbursal</h2>
                    <p className="mt-2 text-sm font-mono">{new Date(data.disbursedDate).toLocaleDateString('en-GB')}</p>
                </div>
            </div>

            <div className="p-12 flex-1">
                {/* Borrower Block */}
                <div className="border-4 border-black p-6 mb-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs font-black uppercase mb-1 bg-black text-white inline-block px-1">Borrower</p>
                            <p className="text-2xl font-bold">{data.customerName}</p>
                            <p className="font-medium text-gray-600">{data.address}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black uppercase mb-1 bg-black text-white inline-block px-1">Ref No</p>
                            <p className="text-2xl font-mono font-bold">{data.loanAccountNo}</p>
                        </div>
                    </div>
                </div>

                {/* Terms */}
                <div className="grid grid-cols-3 gap-4 mb-12 text-center">
                    <div className="bg-gray-100 p-4">
                        <p className="text-xs font-bold uppercase text-gray-500">Amount</p>
                        <p className="text-xl font-bold">₹{data.loanAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-100 p-4">
                        <p className="text-xs font-bold uppercase text-gray-500">Rate</p>
                        <p className="text-xl font-bold">{data.interestRate}%</p>
                    </div>
                    <div className="bg-gray-100 p-4">
                        <p className="text-xs font-bold uppercase text-gray-500">Tenure</p>
                        <p className="text-xl font-bold">{data.tenureMonths > 0 ? `${data.tenureMonths} Mo` : 'Indefinite'}</p>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="mb-12">
                    <table className="w-full border-b-4 border-black text-sm">
                        <thead className="text-black border-b-4 border-black uppercase font-black tracking-widest text-xs">
                            <tr>
                                <th className="py-2 text-left">Description</th>
                                <th className="py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="font-bold">
                            <tr>
                                <td className="py-4">Sanctioned Principal</td>
                                <td className="py-4 text-right">₹{data.loanAmount.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td className="py-4 text-gray-500">Processing Fee</td>
                                <td className="py-4 text-right text-gray-500">- ₹{data.processingFee.toLocaleString()}</td>
                            </tr>
                            {data.interestPaidInAdvance && (
                                <tr>
                                    <td className="py-4 text-gray-500">Advance Interest</td>
                                    <td className="py-4 text-right text-gray-500">- ₹{data.firstMonthInterest?.toLocaleString()}</td>
                                </tr>
                            )}
                            <tr className="text-xl bg-black text-white">
                                <td className="py-4 pl-4 uppercase">Net Disbursed</td>
                                <td className="py-4 pr-4 text-right">₹{data.netDisbursal.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-4 text-xs font-mono bg-gray-50 p-2">
                        PAYMENT: {data.paymentModes.map(m => `${m.type} (₹${parseFloat(m.amount || "0").toLocaleString()})`).join(', ')}
                    </div>
                </div>

                <p className="text-lg font-bold leading-tight mb-16">
                    I, {data.customerName}, confirm receiving the Net Disbursal Amount and agree to all terms.
                </p>

                <div className="grid grid-cols-2 gap-12 items-end">
                    <div>
                        <div className="h-1 bg-black w-full mb-2"></div>
                        <p className="font-black uppercase text-sm">Borrower</p>
                    </div>
                    <div>
                        {company.showSignatory && (
                            <>
                                <div className="h-1 bg-black w-full mb-2"></div>
                                {(() => {
                                    const fullText = company.signatoryText || "Authorized Signatory";
                                    const match = fullText.match(/^(authorized signatory)\s+(.+)$/i);
                                    if (match) {
                                        return (
                                            <>
                                                <p className="font-black uppercase text-sm text-right">{match[1]}</p>
                                                <p className="font-bold text-xs text-right">{match[2]}</p>
                                            </>
                                        );
                                    }
                                    return <p className="font-black uppercase text-sm text-right">{fullText}</p>;
                                })()}

                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-black text-white p-4 text-center text-xs font-mono uppercase">
                {company.showComputerGenerated && <span>{company.computerGeneratedText}</span>}
                <span className="mx-2">|</span>
                {company.showJurisdiction && <span>{company.jurisdictionText}</span>}
            </div>
        </div>
    );
});

BoldDisbursal.displayName = "BoldDisbursal";
