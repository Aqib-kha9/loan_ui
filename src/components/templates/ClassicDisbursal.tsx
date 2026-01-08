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

        loanScheme: string; // 'EMI' | 'InterestOnly'
        interestPaidInAdvance?: boolean;
        firstMonthInterest?: number;

        paymentModes: { type: string, amount: string, reference: string }[];
    };
    company: CompanySettings;
}

export const ClassicDisbursal = React.forwardRef<HTMLDivElement, DisbursementReceiptProps>(({ data, company }, ref) => {
    return (
        <div ref={ref} className="print-content w-[210mm] min-h-[297mm] bg-white text-black p-12 font-serif leading-relaxed text-sm relative print:p-0 print:w-full mx-auto shadow-2xl flex flex-col box-border border-2 border-transparent">

            {/* HEADER */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-6">
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
            <div className="mb-8 grid grid-cols-2 gap-12 border-2 border-black p-6">
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
                        <span className="font-bold">{data.interestRate}% / yr</span>

                        <span className="text-gray-600 border-t border-black pt-1 mt-1 font-bold">{data.loanScheme === 'InterestOnly' ? 'Monthly Interest:' : 'Monthly EMI:'}</span>
                        <span className="font-bold border-t border-black pt-1 mt-1">₹{data.emiAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* DISBURSAL BREAKDOWN TABLE */}
            <div className="mb-8">
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
            <div className="mb-8 p-6 border-2 border-dashed border-gray-300 rounded bg-gray-50">
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
            <div className="mt-auto">
                <p className="text-justify text-sm text-gray-800 mb-8 italic leading-relaxed border-l-4 border-black pl-4 py-2 bg-gray-50">
                    "I, <strong>{data.customerName}</strong>, hereby acknowledge receipt of the sum of <strong>₹{data.netDisbursal.toLocaleString()}</strong> towards the loan amount sanctioned to me.
                    I agree to repay the loan along with interest as per the schedule mentioned above.
                    I confirm that the terms and conditions have been explained to me and I have understood them."
                </p>

                <div className="flex justify-between items-end mt-12 pb-4">
                    {/* Borrower Signature - Always Left */}
                    <div className="text-center w-64">
                        <div className="h-16 border-b-2 border-black mb-2"></div>
                        <p className="font-bold text-sm">Borrower's Signature</p>
                        <p className="text-xs text-gray-500">{data.customerName}</p>
                    </div>

                    {/* Authorized Signatory - Right, Conditional */}
                    <div className="text-center w-64">
                        {company.showSignatory && (
                            <>
                                <div className="h-16 mb-2 flex items-end justify-center pb-2">
                                    <span className="text-gray-300 text-xs">[Stamp / Seal]</span>
                                </div>
                                {(() => {
                                    const fullText = company.signatoryText || "Authorized Signatory";
                                    const match = fullText.match(/^(authorized signatory)\s+(.+)$/i);
                                    if (match) {
                                        return (
                                            <>
                                                <div className="border-t-2 border-black pt-2 font-bold text-sm">{match[1]}</div>
                                                <div className="font-medium text-xs mt-1">{match[2]}</div>
                                            </>
                                        );
                                    }
                                    return <div className="border-t-2 border-black pt-2 font-bold text-sm">{fullText}</div>;
                                })()}

                            </>
                        )}
                    </div>
                </div>

                {/* Footer Disclaimers */}
                <div className="mt-6 text-center text-xs space-y-1 border-t pt-4 text-gray-500">
                    {company.showComputerGenerated && (
                        <p>{company.computerGeneratedText || "This is a computer generated document."}</p>
                    )}
                    {company.showJurisdiction && (
                        <p className="uppercase font-bold text-[10px]">{company.jurisdictionText || "Subject to Jurisdiction"}</p>
                    )}
                </div>
            </div>
        </div>
    );
});

ClassicDisbursal.displayName = "ClassicDisbursal";
