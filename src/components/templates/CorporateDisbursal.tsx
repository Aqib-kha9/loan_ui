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

export const CorporateDisbursal = React.forwardRef<HTMLDivElement, DisbursementReceiptProps>(({ data, company }, ref) => {
    return (
        <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 font-sans mx-auto shadow-2xl flex box-border">

            {/* Sidebar */}
            <div className="w-[30%] bg-[#1e293b] text-white p-8 flex flex-col justify-between pt-16">
                <div>
                    {company.logoUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={company.logoUrl} alt="Logo" className="h-16 w-auto object-contain mb-8 bg-white/10 p-2 rounded" />
                    )}
                    <h1 className="text-2xl font-bold uppercase tracking-wider mb-2 leading-tight">{company.name}</h1>
                    <div className="w-12 h-1 bg-blue-500 mb-6"></div>

                    <div className="mb-8 opacity-80 text-sm">
                        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-[#94a3b8]">Contact Info</p>
                        <p className="mb-2">{company.address}</p>
                        <p className="mb-2">{company.email}</p>
                        <p>{company.mobile}</p>
                    </div>

                    <div className="opacity-80 text-sm">
                        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#94a3b8]">Reg. Details</p>

                    </div>
                </div>

                <div className="text-[10px] uppercase tracking-widest text-[#94a3b8]">
                    {company.tagline}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-12 flex flex-col">
                <div className="border-b border-gray-200 pb-8 mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-light text-slate-800">Loan Disbursal</h2>
                        <h2 className="text-3xl font-bold text-[#1e293b]">Advice</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Date</p>
                        <p className="font-bold text-[#1e293b]">{new Date(data.disbursedDate).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">To Borrower</h3>
                        <p className="font-bold text-xl text-[#1e293b] mb-2">{data.customerName}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{data.address}</p>
                        <p className="text-sm text-gray-600 mt-1">Ph: {data.mobile}</p>
                    </div>
                    <div className="bg-[#f1f5f9] p-6 rounded">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Loan Details</h3>
                        <div className="flex justify-between mb-2 border-b border-gray-200 pb-2">
                            <span className="text-sm text-gray-600">Account No.</span>
                            <span className="font-bold text-[#1e293b]">{data.loanAccountNo}</span>
                        </div>
                        <div className="flex justify-between mb-2 border-b border-gray-200 pb-2">
                            <span className="text-sm text-gray-600">Sanc. Amount</span>
                            <span className="font-bold text-[#1e293b]">₹{data.loanAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-sm text-gray-600">{data.loanScheme === 'InterestOnly' ? 'Int. Only' : 'EMI'}</span>
                            <span className="font-bold text-[#1e293b]">{data.interestRate}% ({data.tenureMonths}m)</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="mb-12 flex-grow">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#1e293b] mb-4 border-b-2 border-[#1e293b] inline-block pb-1">Payment Breakdown</h3>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-100">
                            <tr className="group hover:bg-gray-50">
                                <td className="py-4 font-medium text-gray-700">Loan Amount Sanctioned</td>
                                <td className="py-4 text-right font-bold text-gray-900">₹{data.loanAmount.toLocaleString()}</td>
                            </tr>
                            <tr className="group hover:bg-gray-50">
                                <td className="py-4 text-gray-500 pl-4">Less: Processing Charges</td>
                                <td className="py-4 text-right text-red-500">- ₹{data.processingFee.toLocaleString()}</td>
                            </tr>
                            {data.interestPaidInAdvance && (
                                <tr className="group hover:bg-gray-50">
                                    <td className="py-4 text-gray-500 pl-4">Less: Advance Interest</td>
                                    <td className="py-4 text-right text-red-500">- ₹{data.firstMonthInterest?.toLocaleString()}</td>
                                </tr>
                            )}
                            <tr className="bg-[#1e293b] text-white mt-4">
                                <td className="py-4 pl-4 font-bold uppercase tracking-wider">Net Disbursed Amount</td>
                                <td className="py-4 pr-4 text-right font-bold text-lg">₹{data.netDisbursal.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-8 bg-gray-50 p-4 border border-gray-100 rounded text-sm">
                        <p className="font-bold text-[#1e293b] mb-2">Payment Reference:</p>
                        {data.paymentModes.map((mode, i) => (
                            <p key={i} className="text-gray-600 flex justify-between">
                                <span>{mode.type} {mode.reference && `(${mode.reference})`}</span>
                                <span className="font-mono">₹{parseFloat(mode.amount).toLocaleString()}</span>
                            </p>
                        ))}
                    </div>
                </div>

                <div className="mb-4 text-xs text-gray-500 italic max-w-lg">
                    "I acknowledge receipt of the Net Disbursed Amount and authorize {company.name} to deduct the processing charges from the loan amount."
                </div>

                {/* Signatures */}
                <div className="mt-auto flex justify-between items-end pt-8 border-t border-gray-200">
                    <div>
                        <div className="h-10 border-b border-gray-400 w-48 mb-2"></div>
                        <p className="text-xs uppercase font-bold text-gray-500">Borrower Signature</p>
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
                                                <p className="font-bold text-[#1e293b] uppercase text-sm mb-1">{match[1]}</p>
                                                <p className="font-medium text-[#1e293b] text-xs mb-1">{match[2]}</p>
                                            </>
                                        );
                                    }
                                    return <p className="font-bold text-[#1e293b] uppercase text-sm mb-1">{fullText}</p>;
                                })()}

                            </>
                        )}
                    </div>
                </div>

                <div className="mt-6 text-[10px] text-gray-400 flex justify-between items-center">
                    {company.showComputerGenerated && <span>{company.computerGeneratedText || "Computer Generated"}</span>}
                    {company.showJurisdiction && <span className="uppercase font-bold opacity-70 border-l pl-2 ml-2 border-gray-200">{company.jurisdictionText}</span>}
                </div>
            </div>
        </div>
    );
});

CorporateDisbursal.displayName = "CorporateDisbursal";
