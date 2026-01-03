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

export const ModernStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-slate-50 text-slate-900 font-sans p-0 relative flex flex-col mx-auto shadow-2xl overflow-hidden">
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
                        <p>GSTIN: {company.gstin}</p>
                        <p>{company.email}</p>
                    </div>
                </div>
                {/* Decorative Circle */}
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
            </div>

            {/* Summary Cards floating over header */}
            <div className="px-12 -mt-12 mb-12 relative z-20 grid grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Loan Account</p>
                    <p className="text-lg font-bold font-mono text-slate-800">{data.loanAccountNo}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-emerald-500">
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Sanctioned</p>
                    <p className="text-lg font-bold text-slate-800">{Number(data.loanAmount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Total Paid</p>
                    <p className="text-lg font-bold text-slate-800">{Number(data.totalPaid).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-rose-500">
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Balance</p>
                    <p className="text-lg font-bold text-slate-800">{Number(data.closingBalance).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</p>
                </div>
            </div>

            <div className="px-12 mb-8 grid grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Customer Details</h3>
                    <p className="font-bold text-lg">{data.customerName}</p>
                    <p className="text-sm text-slate-600">{data.address}</p>
                    <p className="text-sm text-slate-600">{data.mobile}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Loan Details</h3>
                    <p className="text-sm"><span className="text-slate-500">Sanctioned:</span> {data.sanctionDate}</p>
                    <p className="text-sm"><span className="text-slate-500">Interest Rate:</span> {data.interestRate}</p>
                    <p className="text-sm"><span className="text-slate-500">Int. Adv:</span> {data.interestPaidInAdvance ? 'Yes' : 'No'}</p>
                </div>
            </div>

            <div className="px-12 mb-12 flex-grow">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/50 text-slate-500 uppercase font-bold">
                            <tr>
                                <th className="p-3 pl-6">Date</th>
                                <th className="p-3">Particulars</th>
                                <th className="p-3">Ref No.</th>
                                <th className="p-3 text-right">Principal</th>
                                <th className="p-3 text-right">Interest</th>
                                <th className="p-3 text-right">Penalty</th>
                                <th className="p-3 text-right text-emerald-600">Total Paid</th>
                                <th className="p-3 pr-6 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(data.transactions || []).map((txn, i) => (
                                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-3 pl-6 text-slate-500 font-mono whitespace-nowrap">{format(new Date(txn.date), "dd-MMM-yyyy")}</td>
                                    <td className="p-3 font-medium text-slate-700">
                                        {txn.type === 'Disbursal' ? 'Loan Disbursal' : txn.type}
                                    </td>
                                    <td className="p-3 text-slate-400">{txn.refNo || '-'}</td>
                                    <td className="p-3 text-right text-slate-600">
                                        {txn.principalComponent ? Number(txn.principalComponent).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                    </td>
                                    <td className="p-3 text-right text-rose-600">
                                        {txn.type === 'Interest' || txn.interestComponent ? Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : (txn.interestComponent ? Number(txn.interestComponent).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-')}
                                    </td>
                                    <td className="p-3 text-right text-slate-600">
                                        {txn.penalty ? Number(txn.penalty).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                    </td>
                                    <td className="p-3 text-right text-emerald-600 font-bold bg-emerald-50/30">
                                        {txn.isPayment ? Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                    </td>
                                    <td className="p-3 pr-6 text-right font-bold font-mono text-slate-800">
                                        {Number(txn.balanceAfter).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold">
                            <tr>
                                <td colSpan={4} className="p-3 text-right text-slate-500 uppercase text-[10px]">Totals</td>
                                <td className="p-3 text-right text-rose-600">{Number(data.totalInterest).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="p-3 text-right">-</td>
                                <td className="p-3 text-right text-emerald-600">{Number(data.totalPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="p-3 pr-6 text-right text-slate-900">{Number(data.closingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Client Info Footer */}
            <div className="mt-auto bg-slate-100 p-8 border-t">
                <div className="flex justify-between items-end">
                    <div className="text-xs text-slate-400">
                        <p>Generated on {format(new Date(), "dd MMM yyyy, hh:mm a")}</p>
                        <p>This is a computer generated statement.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-xs text-right mb-4">Authorized Signatory</p>
                        <p className="font-bold text-slate-700 uppercase tracking-widest">{company.name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
