import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

        loanScheme: string; // 'EMI' | 'InterestOnly'
        interestPaidInAdvance?: boolean;
        firstMonthInterest?: number;

        paymentModes: { type: string, amount: string, reference: string }[];
    };
    company: {
        name: string;
        address: string;
        phone: string;
        email: string;
        website: string;
        logoUrl?: string; // Optional Logo
    };
}

export const DisbursementReceipt = React.forwardRef<HTMLDivElement, DisbursementReceiptProps>(({ data, company }, ref) => {
    return (
        <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-black p-8 font-serif leading-relaxed text-sm relative print:p-10 print:w-full">

            {/* HEADER */}
            <div className="flex justify-between items-start mb-6 border-b-2 border-slate-800 pb-4">
                <div className="flex gap-4 items-center">
                    {company.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={company.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
                    ) : (
                        <div className="h-16 w-16 bg-slate-100 flex items-center justify-center font-bold text-2xl border-2 border-slate-800">
                            {company.name.substring(0, 1)}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">{company.name}</h1>
                        <p className="text-xs text-slate-600 whitespace-pre-line leading-tight">{company.address}</p>
                        <p className="text-xs text-slate-600 mt-1">Ph: {company.phone} | Email: {company.email}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold uppercase text-slate-400">Loan Sanction Letter</h2>
                    <h2 className="text-xl font-bold uppercase text-slate-900">& Receipt</h2>
                    <p className="text-sm font-mono mt-2">LOAN NO: <span className="font-bold">{data.loanAccountNo}</span></p>
                    <p className="text-sm">Date: {new Date(data.disbursedDate).toLocaleDateString()}</p>
                </div>
            </div>

            {/* CUSTOMER DETAILS */}
            <div className="mb-6 grid grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xs font-bold uppercase border-b border-slate-300 mb-2 pb-1 text-slate-500">Borrower Details</h3>
                    <p className="font-bold text-lg">{data.customerName}</p>
                    <p className="text-slate-700">{data.address}</p>
                    <p className="text-slate-700 mt-1">Mobile: {data.mobile}</p>
                </div>
                <div>
                    <h3 className="text-xs font-bold uppercase border-b border-slate-300 mb-2 pb-1 text-slate-500">Loan Terms</h3>
                    <div className="grid grid-cols-2 gap-y-1 text-sm">
                        <span className="text-slate-600">Scheme:</span>
                        <span className="font-bold">{data.loanScheme === 'InterestOnly' ? 'Interest Only (Bullet)' : 'EMI Based'}</span>

                        <span className="text-slate-600">Tenure:</span>
                        <span className="font-bold">{data.tenureMonths} Months</span>

                        <span className="text-slate-600">Interest Rate:</span>
                        <span className="font-bold">{data.interestRate}% / yr</span>

                        <span className="text-slate-600">{data.loanScheme === 'InterestOnly' ? 'Monthly Interest:' : 'Monthly EMI:'}</span>
                        <span className="font-bold">₹{data.emiAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* DISBURSAL BREAKDOWN TABLE */}
            <div className="mb-8">
                <h3 className="text-xs font-bold uppercase border-b border-slate-800 mb-0 pb-2 text-slate-800">Disbursement Breakdown</h3>
                <table className="w-full border-collapse border border-slate-200 text-sm">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                            <th className="p-2 text-left w-2/3">Particulars</th>
                            <th className="p-2 text-right">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="font-bold">
                            <td className="p-2">Sanctioned Loan Amount (Principal)</td>
                            <td className="p-2 text-right">{data.loanAmount.toLocaleString()}</td>
                        </tr>
                        <tr className="text-red-900 bg-red-50/30">
                            <td className="p-2 pl-6">Less: Processing Fee</td>
                            <td className="p-2 text-right">- {data.processingFee.toLocaleString()}</td>
                        </tr>
                        {data.interestPaidInAdvance && (
                            <tr className="text-red-900 bg-red-50/30">
                                <td className="p-2 pl-6">Less: First Month Interest (Advance)</td>
                                <td className="p-2 text-right">- {data.firstMonthInterest?.toLocaleString()}</td>
                            </tr>
                        )}
                        <tr className="bg-slate-100 font-bold text-lg border-t-2 border-slate-800">
                            <td className="p-2">Net Amount Disbursed</td>
                            <td className="p-2 text-right">{data.netDisbursal.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* PAYMENT MODES */}
            <div className="mb-8 p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Disbursement Mode(s)</h3>
                <ul className="text-sm space-y-1">
                    {data.paymentModes.map((mode, idx) => (
                        <li key={idx} className="flex justify-between border-b border-slate-200 last:border-0 pb-1 last:pb-0">
                            <span>{idx + 1}. <strong>{mode.type}</strong> {mode.reference && <span className="text-slate-500">({mode.reference})</span>}</span>
                            <span className="font-mono">₹{parseFloat(mode.amount).toLocaleString()}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ACKNOWLEDGEMENT */}
            <div className="mt-auto pt-12">
                <p className="text-justify text-xs text-slate-600 mb-8 italic leading-relaxed">
                    I, <strong>{data.customerName}</strong>, hereby acknowledge receipt of the sum of <strong>₹{data.netDisbursal.toLocaleString()}</strong> towards the loan amount sanctioned to me.
                    I agree to repay the loan along with interest as per the schedule mentioned above.
                    I confirm that the terms and conditions have been explained to me and I have understood them.
                </p>

                <div className="grid grid-cols-2 gap-12 mt-12">
                    <div className="text-center">
                        <div className="h-16 border-b border-slate-800 mb-2"></div>
                        <p className="font-bold text-sm">Authorized Signatory</p>
                        <p className="text-xs text-slate-500">For {company.name}</p>
                    </div>
                    <div className="text-center">
                        <div className="h-16 border-b border-slate-800 mb-2"></div>
                        <p className="font-bold text-sm">Borrower's Signature</p>
                        <p className="text-xs text-slate-500">{data.customerName}</p>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-slate-400">
                Generated on {new Date().toLocaleString()} | {company.website}
            </div>

        </div>
    );
});

DisbursementReceipt.displayName = "DisbursementReceipt";
