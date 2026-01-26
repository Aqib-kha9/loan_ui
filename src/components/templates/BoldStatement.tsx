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

export const BoldStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-black font-sans mx-auto shadow-2xl flex flex-col box-border">

            {/* Header */}
            <div className="bg-black text-white p-12">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        {company.logoUrl && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={company.logoUrl} alt="Logo" className="h-16 w-auto bg-white mb-4 p-1" />
                        )}
                        <h1 className="text-4xl font-black uppercase tracking-tighter">{company.name}</h1>
                    </div>
                    <div className="text-right text-sm opacity-80 font-mono">
                        <p>{company.address}</p>

                        <p>{company.email}</p>
                    </div>
                </div>
                <div className="w-full h-2 bg-[#ff3333] mb-8"></div>
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-6xl font-black text-[#222]">STATEMENT</h2>
                        <p className="text-[#ff3333] font-bold uppercase tracking-[0.5em] text-sm mt-2">Account Ledger</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase text-gray-500 mb-1">Current Balance</p>
                        <p className="text-4xl font-black text-white">{Number(data.closingBalance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                    </div>
                </div>
            </div>

            {/* Info Block */}
            <div className="bg-[#f4f4f4] p-8 grid grid-cols-2 gap-12 border-b-8 border-black">
                <div>
                    <span className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">Client Details</span>
                    <p className="text-2xl font-black mt-3 uppercase">{data.customerName}</p>
                    <p className="font-bold text-gray-600 text-sm">{data.address}</p>
                    <p className="font-bold text-gray-600 text-sm">{data.mobile}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-right">
                    <div>
                        <span className="bg-[#ff3333] text-white px-2 py-1 text-xs font-bold uppercase">Loan ID</span>
                        <p className="text-xl font-black mt-1">{data.loanAccountNo}</p>
                    </div>
                    <div>
                        <span className="bg-gray-300 text-black px-2 py-1 text-xs font-bold uppercase">Sanctioned</span>
                        <p className="text-xl font-black mt-1">{Number(data.loanAmount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                        <span className="bg-gray-300 text-black px-2 py-1 text-xs font-bold uppercase">Rate</span>
                        <p className="text-xl font-black mt-1">{data.interestRate}</p>
                    </div>
                    <div>
                        <span className="bg-gray-300 text-black px-2 py-1 text-xs font-bold uppercase">Int. Adv</span>
                        <p className="text-xl font-black mt-1">{data.interestPaidInAdvance ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="p-8 flex-grow">
                <table className="w-full border-4 border-black">
                    <thead className="bg-black text-white">
                        <tr>
                            <th className="p-3 text-left uppercase text-xs font-black w-24">Date</th>
                            <th className="p-3 text-left uppercase text-xs font-black">Particulars</th>
                            <th className="p-3 text-right uppercase text-xs font-black">Ref No.</th>
                            <th className="p-3 text-right uppercase text-xs font-black">Principal</th>
                            <th className="p-3 text-right uppercase text-xs font-black">Interest</th>
                            <th className="p-3 text-right uppercase text-xs font-black">Total Paid</th>
                            <th className="p-3 text-right uppercase text-xs font-black">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="font-bold text-xs">
                        {(data.transactions || []).map((txn, i) => (
                            <tr key={i} className="border-b-2 border-gray-200 hover:bg-[#ff3333]/5">
                                <td className="p-3 font-mono whitespace-nowrap">{format(new Date(txn.date), "dd-MM-yy")}</td>
                                <td className="p-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                    {txn.type === 'Disbursal' ? 'LOAN DISBURSAL' : txn.type.toUpperCase()}
                                </td>
                                <td className="p-3 text-right">{txn.refNo || '-'}</td>
                                <td className="p-3 text-right text-gray-500">
                                    {txn.principalComponent ? Number(txn.principalComponent).toLocaleString('en-IN') : '-'}
                                </td>
                                <td className="p-3 text-right text-[#ff3333]">
                                    {txn.interestComponent ? Number(txn.interestComponent).toLocaleString('en-IN') : '-'}
                                </td>
                                <td className="p-3 text-right text-green-700 font-black bg-green-50">
                                    {txn.isPayment ? Number(txn.amount).toLocaleString('en-IN') : '-'}
                                </td>
                                <td className="p-3 text-right font-mono">
                                    {Number(txn.balanceAfter).toLocaleString('en-IN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-[#f0f0f0] border-t-4 border-black font-black text-sm">
                        <tr>
                            <td colSpan={3} className="p-3 text-right">TOTALS</td>
                            <td className="p-3 text-right">-</td>
                            <td className="p-3 text-right text-[#ff3333]">{Number(data.totalInterest).toLocaleString('en-IN')}</td>
                            <td className="p-3 text-right text-green-700">{Number(data.totalPaid).toLocaleString('en-IN')}</td>
                            <td className="p-3 text-right">{Number(data.closingBalance).toLocaleString('en-IN')}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer */}
            <div className="mt-auto p-8 bg-black text-white flex justify-between items-center">
                <div>
                    <p className="font-bold text-[#ff3333] text-lg mb-1">END OF REPORT</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{company.name} | {company.tagline}</p>
                </div>
                <div className="text-right">
                    <div className="h-10 border-b border-white/30 w-40 mb-2"></div>
                    {company.showSignatory && (
                        <>
                            {(() => {
                                const fullText = company.signatoryText || "Authorized Signatory";
                                const match = fullText.match(/^(authorized signatory)\s+(.+)$/i);
                                if (match) {
                                    return (
                                        <>
                                            <p className="text-[10px] uppercase font-bold">{match[1]}</p>
                                            <p className="text-[10px] uppercase font-medium">{match[2]}</p>
                                        </>
                                    );
                                }
                                return <p className="text-[10px] uppercase font-bold">{fullText}</p>;
                            })()}

                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
