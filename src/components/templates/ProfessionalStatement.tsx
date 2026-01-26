import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface StatementProps {
    data: {
        customerName: string;
        loanAccountNo: string;
        address: string;
        mobile: string;
        sanctionDate: string;
        loanAmount: string;
        interestRate: string;
        interestPaidInAdvance: boolean;
        totalInterest: number;
        totalPaid: number;
        closingBalance: number;
        transactions: any[];
    };
    company: CompanySettings;
}

export const ProfessionalStatement = React.forwardRef<HTMLDivElement, StatementProps>(({ data, company }, ref) => {
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
                        <p className="text-xs font-bold text-gray-500 uppercase">Statement Date</p>
                        <p className="font-mono font-bold">{format(new Date(), "dd MMM yyyy")}</p>
                    </div>
                </div>
            </div>

            <div className="bg-[#f8f9fa] border-y border-gray-200 px-12 py-8 grid grid-cols-2 gap-12 mb-8">
                <div>
                    <h3 className="text-sm font-bold text-[#2c3e50] uppercase mb-4 border-b border-gray-300 pb-2">Customer Information</h3>
                    <p className="font-bold text-lg">{data.customerName}</p>
                    <p className="text-gray-600 text-sm">{data.address}</p>
                    <p className="text-gray-600 text-sm">Ph: {data.mobile}</p>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-[#2c3e50] uppercase mb-4 border-b border-gray-300 pb-2">Account Summary</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <span className="text-gray-500">Loan Account:</span>
                        <span className="font-mono font-bold text-gray-800 text-right text-lg">{data.loanAccountNo}</span>

                        <span className="text-gray-500">Sanction Amt:</span>
                        <span className="font-mono font-bold text-right">{Number(data.loanAmount).toLocaleString()}</span>

                        <span className="text-gray-500">Interest Rate:</span>
                        <span className="font-mono font-bold text-right">{data.interestRate}</span>

                        <span className="text-gray-500">Int. Paid Adv:</span>
                        <span className="font-mono font-bold text-right">{data.interestPaidInAdvance ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            </div>

            <div className="px-12 flex-1">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-[#2c3e50] text-white">
                            <th className="py-3 px-4 text-left font-semibold">Date</th>
                            <th className="py-3 px-4 text-left font-semibold">Particulars</th>
                            <th className="py-3 px-4 text-right font-semibold">Principal</th>
                            <th className="py-3 px-4 text-right font-semibold">Interest</th>
                            <th className="py-3 px-4 text-right font-semibold">Total Paid</th>
                            <th className="py-3 px-4 text-right font-semibold">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {(data.transactions || []).map((txn, i) => (
                            <tr key={i} className="hover:bg-blue-50">
                                <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{format(new Date(txn.date), "dd-MMM-yyyy")}</td>
                                <td className="py-3 px-4 font-medium text-[#2c3e50]">
                                    {txn.type === 'Disbursal' ? 'Loan Disbursal' : txn.type}
                                    <span className="text-gray-400 font-normal text-xs ml-1">({txn.refNo || '-'})</span>
                                </td>
                                <td className="py-3 px-4 text-right text-gray-600">
                                    {txn.principalComponent ? Number(txn.principalComponent).toLocaleString('en-IN') : '-'}
                                </td>
                                <td className="py-3 px-4 text-right text-red-600">
                                    {txn.interestComponent ? Number(txn.interestComponent).toLocaleString('en-IN') : '-'}
                                </td>
                                <td className="py-3 px-4 text-right text-green-700">
                                    {txn.isPayment ? Number(txn.amount).toLocaleString('en-IN') : '-'}
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-bold">
                                    {Number(txn.balanceAfter).toLocaleString('en-IN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-[#ecf0f1] font-bold">
                        <tr>
                            <td colSpan={3} className="py-3 px-4 text-right">Totals</td>
                            <td className="py-3 px-4 text-right text-red-600">{Number(data.totalInterest).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4 text-right text-green-700">{Number(data.totalPaid).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4 text-right">{Number(data.closingBalance).toLocaleString('en-IN')}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer */}
            <div className="px-12 py-8 bg-[#f8f9fa] border-t border-gray-200 text-center text-xs text-gray-500">
                {company.showComputerGenerated && (
                    <p>{company.computerGeneratedText || "This is a an electronically generated report."}</p>
                )}
                {company.showSignatory && (
                    <>
                        {(() => {
                            const fullText = company.signatoryText || "Authorized Signatory";
                            const match = fullText.match(/^(authorized signatory)\s+(.+)$/i);
                            if (match) {
                                return (
                                    <>
                                        <p className="mt-4 text-slate-700 font-bold uppercase">{match[1]}</p>
                                        <p className="font-medium text-slate-600 font-xs">{match[2]}</p>
                                    </>
                                );
                            }
                            return <p className="mt-4 text-slate-700 font-bold uppercase">{fullText}</p>;
                        })()}

                    </>
                )}
                <p className="mt-2">{company.email} | {company.mobile}</p>
            </div>
        </div>
    );
});

ProfessionalStatement.displayName = "ProfessionalStatement";
