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

export const ElegantDisbursal = React.forwardRef<HTMLDivElement, DisbursementReceiptProps>(({ data, company }, ref) => {
    return (
        <div ref={ref} className="w-[210mm] min-h-[297mm] bg-[#fffcf5] text-[#2c2c2c] font-serif mx-auto shadow-2xl flex flex-col p-16 box-border border-x-[1px] border-[#d4af37]">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-[#d4af37] pb-8 mb-12">
                <div className="flex gap-6 items-center">
                    {company.logoUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={company.logoUrl} alt="Logo" className="h-20 w-auto object-contain grayscale sepia" />
                    )}
                    <div>
                        <h1 className="text-4xl text-[#1a1a1a] tracking-widest mb-1">{company.name}</h1>
                        <p className="text-[#d4af37] text-xs uppercase tracking-[0.2em]">{company.tagline}</p>
                    </div>
                </div>
                <div className="text-right text-xs text-gray-500 italic">
                    <p>{company.address}</p>
                    <p className="mt-1">{company.email}</p>
                </div>
            </div>

            <div className="text-center mb-12">
                <h2 className="text-2xl uppercase tracking-[0.2em] font-light">Disbursal Advice</h2>
                <div className="w-16 h-[1px] bg-[#d4af37] mx-auto mt-4 mb-2"></div>
                <p className="text-[#d4af37] italic">Loan Sanction & Receipt</p>
            </div>

            {/* Content */}
            <div className="grid grid-cols-2 gap-12 mb-12 text-sm">
                <div className="bg-white p-6 shadow-sm border border-[#f0e6d2]">
                    <h3 className="text-[#d4af37] uppercase tracking-widest text-xs mb-4">Borrower</h3>
                    <p className="text-xl mb-1">{data.customerName}</p>
                    <p className="text-gray-500 italic mb-2">{data.address}</p>
                    <p className="text-gray-500">Ph: {data.mobile}</p>
                </div>
                <div className="bg-white p-6 shadow-sm border border-[#f0e6d2] text-right">
                    <h3 className="text-[#d4af37] uppercase tracking-widest text-xs mb-4">Loan Terms</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-[#f0e6d2] pb-1">
                            <span className="text-gray-500 italic">Account No</span>
                            <span>{data.loanAccountNo}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#f0e6d2] pb-1">
                            <span className="text-gray-500 italic">Sanctioned</span>
                            <span>{Number(data.loanAmount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#f0e6d2] pb-1">
                            <span className="text-gray-500 italic">Interest Rate</span>
                            <span>{data.interestRate}%</span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span className="text-[#d4af37] font-bold uppercase tracking-wider text-xs">EMI Amount</span>
                            <span className="font-bold text-lg">₹{data.emiAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <table className="w-full mb-12 border-collapse">
                    <thead>
                        <tr className="border-b-2 border-[#1a1a1a]">
                            <th className="text-left py-4 font-normal uppercase tracking-widest text-xs">Particulars</th>
                            <th className="text-right py-4 font-normal uppercase tracking-widest text-xs">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        <tr className="border-b border-[#f0e6d2]">
                            <td className="py-4">Loan Amount Sanctioned</td>
                            <td className="py-4 text-right">{data.loanAmount.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b border-[#f0e6d2] text-[#8b0000]">
                            <td className="py-4 pl-4 italic">Less: Processing Fees</td>
                            <td className="py-4 text-right">-{data.processingFee.toLocaleString()}</td>
                        </tr>
                        {data.interestPaidInAdvance && (
                            <tr className="border-b border-[#f0e6d2] text-[#8b0000]">
                                <td className="py-4 pl-4 italic">Less: Advance Interest</td>
                                <td className="py-4 text-right">-{data.firstMonthInterest?.toLocaleString()}</td>
                            </tr>
                        )}
                        <tr>
                            <td className="py-4 font-bold text-[#d4af37] uppercase tracking-widest text-xs">Net Disbursal</td>
                            <td className="py-4 text-right font-bold text-xl text-[#1a1a1a]">₹{data.netDisbursal.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="mb-4 text-xs italic text-gray-500 text-center">
                    "{data.paymentModes.map(m => `Received ₹${m.amount} via ${m.type}`).join(', ')}"
                </div>

                <p className="text-center italic text-gray-600 mb-12 max-w-lg mx-auto">
                    I acknowledge receipt of the loan amount and agree to abide by the terms and repayment schedule.
                </p>
            </div>

            {/* Footer */}
            <div className="mt-auto flex flex-col items-center justify-center p-8 text-center bg-[#fffcf5]">
                <div className="w-full flex justify-between items-end mb-8 px-8">
                    <div className="text-center">
                        <div className="w-32 border-b border-gray-400 mb-1"></div>
                        <p className="text-[10px] uppercase tracking-widest">Borrower</p>
                    </div>
                    <div className="text-center">
                        {company.showSignatory && (
                            <>
                                {(() => {
                                    const fullText = company.signatoryText || "Authorized Signatory";
                                    const match = fullText.match(/^(authorized signatory)\s+(.+)$/i);
                                    if (match) {
                                        return (
                                            <>
                                                <p className="text-sm font-bold mb-1">{match[1]}</p>
                                                <p className="text-xs font-medium text-gray-600 mb-2">{match[2]}</p>
                                            </>
                                        );
                                    }
                                    return <p className="text-sm font-bold mb-1">{fullText}</p>;
                                })()}
                                <div className="w-32 border-b border-gray-400 mb-1"></div>

                            </>
                        )}
                    </div>
                </div>

                <div className="w-8 h-8 border border-[#d4af37] rotate-45 mb-4"></div>
                {company.showComputerGenerated && <p className="text-[10px] mb-1">{company.computerGeneratedText}</p>}
                {company.showJurisdiction && <p className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37] mb-1">{company.jurisdictionText}</p>}
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Excellence in Finance</p>
            </div>
        </div>
    );
});

ElegantDisbursal.displayName = "ElegantDisbursal";
