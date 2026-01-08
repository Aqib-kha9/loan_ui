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

export const ModernDisbursal = React.forwardRef<HTMLDivElement, DisbursementReceiptProps>(({ data, company }, ref) => {
    return (
        <div ref={ref} className="w-[210mm] min-h-[297mm] bg-slate-50 text-slate-900 font-sans p-0 relative flex flex-col mx-auto shadow-2xl overflow-hidden">
            {/* Header Band */}
            <div className="bg-slate-900 text-white p-12 pb-24 relative">
                <div className="flex justify-between items-start z-10 relative">
                    <div className="flex gap-4 items-center">
                        {company.logoUrl && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={company.logoUrl} alt="Logo" className="h-16 w-16 bg-white rounded-lg object-contain p-1" />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-1">{company.name}</h1>
                            <p className="opacity-70 text-sm uppercase tracking-wider">{company.tagline}</p>
                        </div>
                    </div>
                    <div className="text-right opacity-80 text-sm">
                        <p className="font-medium">{company.address}</p>

                        <p>{company.email}</p>
                    </div>
                </div>
                {/* Decorative Circle */}
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
            </div>

            {/* Summary Cards floating over header */}
            <div className="px-12 -mt-12 mb-12 relative z-20 grid grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Sanctioned Amount</p>
                    <p className="text-2xl font-bold font-mono text-slate-800">₹{data.loanAmount.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-emerald-500">
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Net Custom Disbursal</p>
                    <p className="text-2xl font-bold font-mono text-emerald-600">₹{data.netDisbursal.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Loan Account</p>
                    <p className="text-xl font-bold text-slate-800">{data.loanAccountNo}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-12 flex-grow">
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Sanction Letter & Receipt</h2>
                    <p className="text-slate-500 font-medium">{new Date(data.disbursedDate).toLocaleDateString('en-GB')}</p>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">Borrower Details</h3>
                        <p className="font-bold text-lg mb-1">{data.customerName}</p>
                        <p className="text-sm text-slate-600">{data.address}</p>
                        <p className="text-sm text-slate-600 mt-2">Ph: {data.mobile}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">Loan Structure</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Scheme</span>
                                <span className="font-medium text-slate-900">{data.loanScheme === 'InterestOnly' ? 'Interest Only/Bullet' : 'EMI Standard'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Tenure</span>
                                <span className="font-medium text-slate-900">{data.tenureMonths > 0 ? `${data.tenureMonths} Months` : 'Indefinite'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Interest Rate</span>
                                <span className="font-medium text-slate-900">{data.interestRate}% p.a.</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-100">
                                <span className="text-slate-500 font-bold">{data.loanScheme === 'InterestOnly' ? 'Monthly Interest' : 'Monthly EMI'}</span>
                                <span className="font-bold text-slate-900">₹{data.emiAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breakdown Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 mb-8">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4 pl-6">Description</th>
                                <th className="p-4 pr-6 text-right">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="p-4 pl-6 font-medium text-slate-700">Sanctioned Loan Amount</td>
                                <td className="p-4 pr-6 text-right font-medium text-slate-900">{data.loanAmount.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td className="p-4 pl-6 text-slate-500">Less: Processing Fees</td>
                                <td className="p-4 pr-6 text-right text-rose-500">- {data.processingFee.toLocaleString()}</td>
                            </tr>
                            {data.interestPaidInAdvance && (
                                <tr>
                                    <td className="p-4 pl-6 text-slate-500">Less: First Month Interest (Advance)</td>
                                    <td className="p-4 pr-6 text-right text-rose-500">- {data.firstMonthInterest?.toLocaleString()}</td>
                                </tr>
                            )}
                            <tr className="bg-emerald-50/50">
                                <td className="p-4 pl-6 font-bold text-emerald-900">Net Amount Disbursed</td>
                                <td className="p-4 pr-6 text-right font-bold text-emerald-700 text-lg">{data.netDisbursal.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Modes */}
                <div className="bg-slate-100/50 p-4 rounded-xl border border-dashed border-slate-300 mb-8">
                    <p className="text-xs uppercase font-bold text-slate-400 mb-2">Disbursement Details</p>
                    <div className="flex gap-4 flex-wrap">
                        {data.paymentModes.map((mode, i) => (
                            <span key={i} className="bg-white px-3 py-1 rounded shadow-sm text-sm border border-slate-200">
                                <span className="font-bold text-slate-700">{mode.type}</span>: ₹{parseFloat(mode.amount).toLocaleString()}
                                {mode.reference && <span className="text-slate-400 ml-1 text-xs">({mode.reference})</span>}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Declaration */}
                <div className="bg-blue-50/50 p-6 rounded-xl border-l-4 border-blue-400 italic text-slate-600 text-sm leading-relaxed mb-8">
                    "I, {data.customerName}, acknowledge that I have received the above mentioned Net Disbursal Amount. I agree to the Interest Rate, Tenure and Repayment Schedule as specified in this sanction letter."
                </div>
            </div>

            {/* Footer Signatures */}
            <div className="px-12 mt-auto pb-12">
                <div className="flex justify-between items-end">
                    <div className="text-center">
                        <div className="w-48 border-b-2 border-slate-200 mb-2"></div>
                        <p className="font-bold text-sm text-slate-700">Borrower Signature</p>
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
                                                <p className="font-bold text-sm text-slate-700 mb-1">{match[1]}</p>
                                                <p className="font-medium text-xs text-slate-600 mb-2">{match[2]}</p>
                                            </>
                                        );
                                    }
                                    return <p className="font-bold text-sm text-slate-700 mb-2">{fullText}</p>;
                                })()}

                            </>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between text-[10px] text-slate-400 uppercase tracking-wider">
                    <div className="flex gap-4">
                        {company.showComputerGenerated && <span>{company.computerGeneratedText}</span>}
                    </div>
                    {company.showJurisdiction && <span>{company.jurisdictionText}</span>}
                </div>
            </div>
        </div>
    );
});

ModernDisbursal.displayName = "ModernDisbursal";
