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

export const ProfessionalDisbursal = React.forwardRef<HTMLDivElement, DisbursementReceiptProps>(({ data, company }, ref) => {
    return (
        <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 font-sans mx-auto shadow-2xl flex flex-col box-border">

            {/* Top Bar */}
            <div className="bg-[#2c3e50] h-6 w-full mb-8"></div>

            {/* Header */}
            <div className="px-12 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {company.logoUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={company.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-[#2c3e50] uppercase">{company.name}</h1>
                        <p className="text-sm text-gray-500">{company.address}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="bg-[#ecf0f1] px-4 py-2 rounded">
                        <p className="text-xs font-bold text-gray-500 uppercase">Sanction Date</p>
                        <p className="font-mono font-bold">{new Date(data.disbursedDate).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className="bg-[#f8f9fa] border-y border-gray-200 px-12 py-8 mb-8">
                <h2 className="text-xl font-bold text-[#2c3e50] uppercase mb-1">Loan Disbursement Receipt</h2>
                <p className="text-sm text-gray-500">Ref No: {data.loanAccountNo}</p>
            </div>

            <div className="px-12 grid grid-cols-2 gap-12 mb-8">
                <div>
                    <h3 className="text-sm font-bold text-[#2c3e50] uppercase mb-4 border-b border-gray-300 pb-2">Borrower Information</h3>
                    <p className="font-bold text-lg">{data.customerName}</p>
                    <p className="text-gray-600 text-sm">{data.address}</p>
                    <p className="text-gray-600 text-sm">Ph: {data.mobile}</p>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-[#2c3e50] uppercase mb-4 border-b border-gray-300 pb-2">Loan Snapshot</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <span className="text-gray-500">Tenure:</span>
                        <span className="font-bold text-right">{data.tenureMonths} Months</span>
                        <span className="text-gray-500">Interest Rate:</span>
                        <span className="font-bold text-right">{data.interestRate}%</span>
                        <span className="text-gray-500">Repayment:</span>
                        <span className="font-bold text-right">₹{data.emiAmount.toLocaleString()} / mo</span>
                    </div>
                </div>
            </div>

            <div className="px-12 flex-1">
                <table className="w-full text-sm mb-8">
                    <thead>
                        <tr className="bg-[#2c3e50] text-white">
                            <th className="py-3 px-4 text-left font-semibold w-2/3">Description</th>
                            <th className="py-3 px-4 text-right font-semibold">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 border-x border-b border-gray-200">
                        <tr>
                            <td className="py-3 px-4 text-gray-800 font-medium">Loan Amount Sanctioned</td>
                            <td className="py-3 px-4 text-right font-bold text-gray-800">{data.loanAmount.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="py-3 px-4 text-gray-600 pl-8">Less: Processing Fees</td>
                            <td className="py-3 px-4 text-right text-red-600">({data.processingFee.toLocaleString()})</td>
                        </tr>
                        {data.interestPaidInAdvance && (
                            <tr>
                                <td className="py-3 px-4 text-gray-600 pl-8">Less: Advance Interest</td>
                                <td className="py-3 px-4 text-right text-red-600">({data.firstMonthInterest?.toLocaleString()})</td>
                            </tr>
                        )}
                        <tr className="bg-blue-50/50">
                            <td className="py-4 px-4 text-[#2c3e50] font-bold uppercase">Net Amount Disbursed</td>
                            <td className="py-4 px-4 text-right font-bold text-xl text-[#2c3e50]">{data.netDisbursal.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="bg-gray-50 border border-gray-200 p-4 rounded mb-8">
                    <p className="text-xs font-bold uppercase text-gray-500 mb-2">Payment Details</p>
                    {data.paymentModes.map((mode, i) => (
                        <div key={i} className="flex justify-between text-sm border-b border-gray-200 last:border-0 pb-1 last:pb-0 mb-1 last:mb-0">
                            <span>{mode.type} <span className="text-gray-400 text-xs">({mode.reference || 'N/A'})</span></span>
                            <span className="font-mono font-medium">₹{parseFloat(mode.amount).toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-gray-500 italic mb-12">
                    * By signing below, the borrower confirms receipt of the full Net Disbursed Amount mentioned above and agrees to the repayment terms.
                </p>
            </div>

            {/* Footer */}
            <div className="px-12 py-12 bg-[#f8f9fa] border-t border-gray-200">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="w-48 border-b border-gray-400 mb-2"></div>
                        <p className="text-xs uppercase font-bold text-gray-600">Borrower's Signature</p>
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
                                                <p className="font-bold text-[#2c3e50] text-sm mb-1 text-right">{match[1]}</p>
                                                <p className="font-medium text-[#2c3e50] text-xs mb-1 text-right">{match[2]}</p>
                                            </>
                                        );
                                    }
                                    return <p className="font-bold text-[#2c3e50] text-sm mb-1 text-right">{fullText}</p>;
                                })()}

                            </>
                        )}
                    </div>
                </div>

                <div className="text-center text-xs text-gray-400 space-y-1">
                    {company.showComputerGenerated && <p>{company.computerGeneratedText}</p>}
                    {company.showJurisdiction && <p className="uppercase font-bold text-[10px] text-gray-300">{company.jurisdictionText}</p>}
                </div>
            </div>
        </div>
    );
});

ProfessionalDisbursal.displayName = "ProfessionalDisbursal";
