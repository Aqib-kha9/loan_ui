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

export const CorporateStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-slate-800 font-sans p-10 relative flex flex-col mx-auto shadow-2xl">
            {/* Header */}
            <header className="flex justify-between items-start border-b-4 border-slate-800 pb-6 mb-8">
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    {company.logoUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={company.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{company.name}</h1>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{company.tagline}</p>
                    </div>
                </div>
                <div className="text-right text-xs text-slate-600">
                    <p className="font-bold">{company.address}</p>

                    <p>Support: {company.email}</p>
                </div>
            </header>

            {/* Subject Line */}
            <div className="mb-8 bg-slate-100 p-4 rounded border-l-4 border-blue-600 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">STATEMENT OF ACCOUNT</h2>
                    <p className="text-sm text-slate-500">Generated on: {format(new Date(), "dd MMM yyyy")}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold uppercase text-slate-400">Closing Balance</p>
                    <p className="text-2xl font-bold text-slate-900">{Number(data.closingBalance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                </div>
            </div>

            {/* Customer + Loan Summary */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Customer Details */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 border-b">Customer Details</h3>
                    <p className="font-bold text-lg">{data.customerName}</p>
                    <p className="text-sm text-slate-600 whitespace-pre-line">{data.address}</p>
                    <p className="text-sm text-slate-600 mt-1">Ph: {data.mobile}</p>
                </div>
                {/* Loan Terms */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Loan Account No</p>
                        <p className="font-mono font-bold text-md">{data.loanAccountNo}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Sanction Date</p>
                        <p className="font-medium text-sm">{data.sanctionDate || format(new Date(), "dd/MM/yyyy")}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Loan Amount</p>
                        <p className="font-medium text-sm">{Number(data.loanAmount || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Interest Rate</p>
                        <p className="font-medium text-sm">{data.interestRate || "12% p.a."}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Int. Advance</p>
                        <p className="font-medium text-sm">{data.interestPaidInAdvance ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="flex-1">
                <table className="w-full text-xs mb-8">
                    <thead>
                        <tr className="bg-slate-800 text-white">
                            <th className="py-2 px-2 text-left w-20">Date</th>
                            <th className="py-2 px-2 text-left">Particulars</th>
                            <th className="py-2 px-2 text-left w-20">Ref No.</th>
                            <th className="py-2 px-2 text-right">Principal</th>
                            <th className="py-2 px-2 text-right">Interest</th>
                            <th className="py-2 px-2 text-right">Total Paid</th>
                            <th className="py-2 px-2 text-right">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {(data.transactions || []).map((txn, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                                <td className="py-2 px-2 whitespace-nowrap">{format(new Date(txn.date), "dd-MMM-yyyy")}</td>
                                <td className="py-2 px-2">
                                    <span className="font-medium text-slate-700">{txn.type === 'Disbursal' ? 'Loan Disbursal' : txn.type}</span>
                                </td>
                                <td className="py-2 px-2 text-slate-500 text-[10px]">{txn.refNo || '-'}</td>
                                <td className="py-2 px-2 text-right text-slate-900">
                                    {txn.principalComponent ? Number(txn.principalComponent).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                </td>
                                <td className="py-2 px-2 text-right text-slate-900">
                                    {txn.interestComponent ? Number(txn.interestComponent).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                </td>
                                <td className="py-2 px-2 text-right text-emerald-700 font-bold">
                                    {txn.isPayment ? Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                </td>
                                <td className="py-2 px-2 text-right text-slate-900 font-mono font-bold">
                                    {Number(txn.balanceAfter).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-800">
                        <tr>
                            <td colSpan={3} className="py-3 px-3 text-right uppercase text-xs">Totals</td>
                            <td className="py-3 px-3 text-right">-</td>
                            <td className="py-3 px-3 text-right text-red-600">{Number(data.totalInterest).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3 text-right text-emerald-700">{Number(data.totalPaid).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3 text-right">{Number(data.closingBalance).toLocaleString('en-IN')}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer */}
            <div className="mt-auto border-t pt-4 text-xs text-slate-500 flex justify-between items-center">
                <div>
                    <p>Generated by {company.name} Loan Management System</p>
                    <p>Page 1 of 1</p>
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
                                            <p className="font-bold uppercase text-slate-800">{match[1]}</p>
                                            <p className="font-medium uppercase text-slate-700 mt-1">{match[2]}</p>
                                        </>
                                    );
                                }
                                return <p className="font-bold uppercase text-slate-800">{fullText}</p>;
                            })()}

                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
