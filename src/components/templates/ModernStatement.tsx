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
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">{company.name}</h1>
                        <p className="opacity-70 text-sm">{company.tagline}</p>
                    </div>
                    <div className="text-right opacity-80 text-sm">
                        <p>{company.address}</p>
                        <p>{company.email}</p>
                    </div>
                </div>
                {/* Decorative Circle */}
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
            </div>

            {/* Summary Cards floating over header */}
            <div className="px-12 -mt-12 mb-12 relative z-20 grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                    <p className="text-xs uppercase text-slate-400 font-bold mb-1">Loan Account</p>
                    <p className="text-xl font-bold font-mono text-slate-800">{data.loanAccountNo}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-emerald-500">
                    <p className="text-xs uppercase text-slate-400 font-bold mb-1">Total Sanctioned</p>
                    <p className="text-xl font-bold text-slate-800">{Number(data.loanAmount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-rose-500">
                    <p className="text-xs uppercase text-slate-400 font-bold mb-1">Current Balance</p>
                    <p className="text-xl font-bold text-slate-800">{Number(469000).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                </div>
            </div>

            <div className="px-12 mb-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Activity Statement</h2>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-100/50 text-slate-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4 pl-6">Date</th>
                                <th className="p-4">Description</th>
                                <th className="p-4 text-right text-rose-500">Out (Dr)</th>
                                <th className="p-4 text-right text-emerald-600">In (Cr)</th>
                                <th className="p-4 pr-6 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {/* Mock Op Balance */}
                            <tr>
                                <td className="p-4 pl-6 text-slate-500 font-mono">{format(new Date(), "dd MMM yyy")}</td>
                                <td className="p-4 font-medium text-slate-600">Opening Balance forward</td>
                                <td className="p-4 text-right text-slate-400">-</td>
                                <td className="p-4 text-right text-slate-400">-</td>
                                <td className="p-4 pr-6 text-right font-bold font-mono">{Number(data.loanAmount).toLocaleString('en-IN')}</td>
                            </tr>
                            {(data.transactions || []).map((txn, i) => (
                                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 pl-6 text-slate-500 font-mono">{txn.date}</td>
                                    <td className="p-4">
                                        <div className="font-semibold text-slate-700">{txn.type}</div>
                                        <div className="text-xs text-slate-400">REF: {txn.ref}</div>
                                    </td>
                                    <td className="p-4 text-right text-rose-600 font-medium bg-rose-50/30">
                                        {txn.type === 'Internal Transfer' ? Number(txn.amount).toLocaleString('en-IN') : '-'}
                                    </td>
                                    <td className="p-4 text-right text-emerald-600 font-medium bg-emerald-50/30">
                                        {txn.type !== 'Internal Transfer' ? Number(txn.amount).toLocaleString('en-IN') : '-'}
                                    </td>
                                    <td className="p-4 pr-6 text-right font-bold font-mono text-slate-700">
                                        {Number(Number(data.loanAmount) - (i + 1) * 15000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Client Info Footer */}
            <div className="mt-auto bg-slate-100 p-12 border-t">
                <h3 className="text-sm font-bold uppercase text-slate-400 mb-4">Account Holder</h3>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{data.customerName}</p>
                        <p className="text-slate-500">{data.address}</p>
                        <p className="text-slate-500">{data.mobile}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-xs text-right mb-1">Authenticated by</p>
                        <div className="h-12 w-32 border-b-2 border-slate-300 mb-1"></div>
                        <p className="font-bold text-slate-700">{company.name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
