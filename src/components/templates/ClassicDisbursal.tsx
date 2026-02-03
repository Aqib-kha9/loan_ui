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
        interestRate: string;
        tenureMonths: number;
        emiAmount: number;
        processingFee: number;
        netDisbursal: number;

        loanScheme: string; // 'EMI' | 'InterestOnly'
        interestPaidInAdvance?: boolean;
        firstMonthInterest?: number;

        paymentModes: { type: string, amount: string, reference: string }[];
        repaymentFrequency?: string;
        schedule?: any[];
    };
    company: CompanySettings;
}

export const ClassicDisbursal = React.forwardRef<HTMLDivElement, DisbursementReceiptProps>(({ data, company }, ref) => {
    return (
        <div ref={ref} className="print-content w-[210mm] min-h-[297mm] bg-white text-black px-12 pt-4 pb-16 font-serif leading-relaxed text-sm relative print:px-8 print:pt-4 print:pb-8 print:w-full mx-auto shadow-2xl block box-border border-2 border-transparent">

            {/* HEADER */}
            <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-4 break-inside-avoid">
                <div className="flex gap-6 items-center">
                    {company.logoUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={company.logoUrl} alt="Logo" className="h-20 w-auto object-contain" />
                    )}
                    <div>
                        <h1 className="text-3xl font-bold uppercase tracking-wide text-black">{company.name}</h1>
                        <p className="text-sm text-gray-600 whitespace-pre-line leading-tight">{company.address}</p>
                        <div className="flex gap-4 text-xs font-bold mt-2 text-gray-600">

                            <span>Mob: {company.mobile}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold uppercase text-gray-400">Loan Sanction</h2>
                    <h2 className="text-2xl font-bold uppercase text-black">& Receipt</h2>
                    <p className="text-sm font-mono mt-2 font-bold bg-gray-100 px-2 py-1 inline-block">LOAN NO: {data.loanAccountNo}</p>
                    <p className="text-sm mt-1">Date: {new Date(data.disbursedDate).toLocaleDateString('en-GB')}</p>
                </div>
            </div>

            {/* CUSTOMER DETAILS */}
            <div className="mb-8 grid grid-cols-2 gap-12 border-2 border-black p-6 break-inside-avoid">
                <div>
                    <h3 className="text-xs font-bold uppercase mb-2 text-gray-500">Borrower Details</h3>
                    <p className="font-bold text-xl">{data.customerName}</p>
                    <p className="text-gray-700">{data.address}</p>
                    <p className="text-gray-700 mt-1">Mobile: {data.mobile}</p>
                </div>
                <div>
                    <h3 className="text-xs font-bold uppercase mb-2 text-gray-500">Loan Terms</h3>
                    <div className="grid grid-cols-2 gap-y-1 text-sm">
                        <span className="text-gray-600">Scheme:</span>
                        <span className="font-bold">{data.loanScheme === 'InterestOnly' ? 'Interest Only (Bullet)' : 'EMI Based'}</span>

                        <span className="text-gray-600">Tenure:</span>
                        <span className="font-bold">{data.tenureMonths > 0 ? `${data.tenureMonths} Months` : 'Indefinite'}</span>

                        <span className="text-gray-600">Interest Rate:</span>
                        <span className="font-bold">{data.interestRate}</span>

                        <span className="text-gray-600 border-t border-black pt-1 mt-1 font-bold">
                            {data.loanScheme === 'InterestOnly'
                                ? `${data.repaymentFrequency || 'Monthly'} Interest:`
                                : `${data.repaymentFrequency || 'Monthly'} EMI:`}
                        </span>
                        <span className="font-bold border-t border-black pt-1 mt-1">₹{data.emiAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* DISBURSAL BREAKDOWN TABLE */}
            <div className="mb-8 break-inside-auto">
                <h3 className="text-sm font-bold uppercase border-b-2 border-black mb-0 pb-2 text-black">Disbursement Breakdown</h3>
                <table className="w-full border-collapse border-2 border-black text-sm">
                    <thead className="bg-gray-100 text-black border-b-2 border-black font-bold">
                        <tr>
                            <th className="p-3 text-left w-2/3 border-r border-black">Particulars</th>
                            <th className="p-3 text-right">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                        <tr>
                            <td className="p-3 border-r border-black font-medium">Sanctioned Loan Amount (Principal)</td>
                            <td className="p-3 text-right font-medium">{data.loanAmount.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="p-3 border-r border-black pl-8 text-gray-600">Less: Processing Fee</td>
                            <td className="p-3 text-right text-red-600">- {data.processingFee.toLocaleString()}</td>
                        </tr>
                        {data.interestPaidInAdvance && (
                            <tr>
                                <td className="p-3 border-r border-black pl-8 text-gray-600">Less: First Month Interest (Advance)</td>
                                <td className="p-3 text-right text-red-600">- {data.firstMonthInterest?.toLocaleString()}</td>
                            </tr>
                        )}
                        <tr className="bg-gray-50 font-bold text-lg border-t-2 border-black">
                            <td className="p-3 border-r border-black">Net Amount Disbursed</td>
                            <td className="p-3 text-right">{data.netDisbursal.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* PAYMENT MODES */}
            <div className="mb-8 p-6 border-2 border-dashed border-gray-300 rounded bg-gray-50 break-inside-avoid">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Disbursement Mode(s)</h3>
                <ul className="text-sm space-y-2">
                    {data.paymentModes.map((mode, idx) => (
                        <li key={idx} className="flex justify-between border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                            <span>{idx + 1}. <strong>{mode.type}</strong> {mode.reference && <span className="text-gray-500 italic">({mode.reference})</span>}</span>
                            <span className="font-mono font-bold">₹{parseFloat(mode.amount || "0").toLocaleString()}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ACKNOWLEDGEMENT */}
            <div className="mt-8 break-inside-avoid">
                <p className="text-justify text-sm text-gray-800 mb-8 italic leading-relaxed border-l-4 border-black pl-4 py-2 bg-gray-50">
                    "I, <strong>{data.customerName}</strong>, hereby acknowledge receipt of the sum of <strong>₹{data.netDisbursal.toLocaleString()}</strong> towards the loan amount sanctioned to me.
                    I agree to repay the loan along with interest as per the schedule mentioned above.
                    I confirm that the terms and conditions have been explained to me and I have understood them."
                </p>
            </div>

            {/* SIGNATURES */}
            <div className="mt-8 break-inside-avoid">
                <div className="grid grid-cols-2 gap-12 mb-4">
                    <div className="text-center">
                        <div className="border-t border-black w-3/4 mx-auto pt-2">
                            <p className="font-bold">Authorized Signatory</p>
                            <p className="text-xs text-gray-500">{company.name}</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black w-3/4 mx-auto pt-2">
                            <p className="font-bold">Borrower's Signature</p>
                            <p className="text-xs text-gray-500">I accept the loan terms</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* REPAYMENT SCHEDULE */}
            {data.schedule && data.schedule.length > 0 && (
                <div className="mt-8 break-before-auto">
                    <div className="break-inside-avoid pb-4">
                        <h3 className="text-sm font-bold uppercase border-b-2 border-black pb-1 mb-2">Repayment Schedule</h3>
                    </div>
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="bg-gray-100 border-b border-black md:table-header-group">
                            <tr>
                                <th className="p-2 font-bold">#</th>
                                <th className="p-2 font-bold">Due Date</th>
                                <th className="p-2 font-bold text-right">Principal</th>
                                <th className="p-2 font-bold text-right">Interest</th>
                                <th className="p-2 font-bold text-right">Total</th>
                                <th className="p-2 font-bold text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.schedule.map((row: any, i: number) => (
                                <tr key={i} className="border-b border-gray-200 break-inside-avoid">
                                    <td className="p-2">{row.installmentNo}</td>
                                    <td className="p-2">{new Date(row.dueDate).toLocaleDateString('en-GB')}</td>
                                    <td className="p-2 text-right">₹{Math.round(row.principalComponent).toLocaleString()}</td>
                                    <td className="p-2 text-right">₹{Math.round(row.interestComponent).toLocaleString()}</td>
                                    <td className="p-2 text-right font-bold">₹{Math.round(row.amount).toLocaleString()}</td>
                                    <td className="p-2 text-right text-gray-500">₹{Math.round(row.balance).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Footer Disclaimers */}
            <div className="mt-auto text-center text-xs space-y-1 border-t pt-4 text-gray-500 break-inside-avoid">
                {company.showComputerGenerated && (
                    <p>{company.computerGeneratedText || "This is a computer generated document."}</p>
                )}
                {company.showJurisdiction && (
                    <p className="uppercase font-bold text-[10px]">{company.jurisdictionText || "Subject to Jurisdiction"}</p>
                )}
            </div>
        </div>
    );
});

ClassicDisbursal.displayName = "ClassicDisbursal";
