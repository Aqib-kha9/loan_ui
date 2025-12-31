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

export const CorporateStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-slate-800 font-sans p-10 relative flex flex-col mx-auto shadow-2xl">
            {/* Header */}
            <header className="flex justify-between items-start border-b-4 border-slate-800 pb-6 mb-8">
                <div className="flex items-center gap-4">
                    {/* Logo Placeholder */}
                    <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-bold text-2xl rounded">
                        Logo
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{company.name}</h1>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{company.tagline}</p>
                    </div>
                </div>
                <div className="text-right text-xs text-slate-600">
                    <p className="font-bold">{company.address}</p>
                    <p>GSTIN: {company.gstin}</p>
                    <p>Support: {company.email}</p>
                </div>
            </header>

            {/* Subject Line */}
            <div className="mb-8 bg-slate-100 p-4 rounded border-l-4 border-blue-600">
                <h2 className="text-xl font-bold text-slate-900">STATEMENT OF ACCOUNT</h2>
                <p className="text-sm text-slate-500">Period: {format(new Date().setMonth(new Date().getMonth() - 12), "dd MMM yyyy")} to {format(new Date(), "dd MMM yyyy")}</p>
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
                </div>
            </div>

            {/* Ledger Table */}
            <table className="w-full text-sm mb-8">
                <thead>
                    <tr className="bg-slate-800 text-white">
                        <th className="py-2 px-3 text-left w-24">Date</th>
                        <th className="py-2 px-3 text-left">Description</th>
                        <th className="py-2 px-3 text-right text-red-300">Debit (Dr)</th>
                        <th className="py-2 px-3 text-right text-emerald-300">Credit (Cr)</th>
                        <th className="py-2 px-3 text-right">Balance</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {/* Op Balance Mock */}
                    <tr className="bg-slate-50 italic text-slate-500">
                        <td className="py-2 px-3">{format(new Date().setMonth(new Date().getMonth() - 6), "dd/MM/yyyy")}</td>
                        <td className="py-2 px-3">Opening Balance</td>
                        <td className="py-2 px-3 text-right">-</td>
                        <td className="py-2 px-3 text-right">-</td>
                        <td className="py-2 px-3 text-right font-bold">{Number(data.loanAmount).toLocaleString()}</td>
                    </tr>
                    {/* Transactions (Mocked if empty) */}
                    {(data.transactions || []).map((txn, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                            <td className="py-3 px-3">{txn.date}</td>
                            <td className="py-3 px-3">
                                <span className="font-medium text-slate-700">{txn.type}</span>
                                {txn.ref && <span className="text-xs text-slate-400 ml-2">#{txn.ref}</span>}
                            </td>
                            <td className="py-3 px-3 text-right text-slate-900">{txn.type === 'Internal Transfer' ? txn.amount : '-'}</td>
                            <td className="py-3 px-3 text-right text-emerald-700 font-medium">{txn.type !== 'Internal Transfer' ? txn.amount : '-'}</td>
                            <td className="py-3 px-3 text-right text-slate-900">...</td> {/* Balance calc logic is complex, mocking for UI */}
                        </tr>
                    ))}
                    {/* If no transactions */}
                    {(!data.transactions || data.transactions.length === 0) && (
                        <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">No transactions in this period.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Footer */}
            <div className="mt-auto border-t pt-4 text-xs text-slate-500 flex justify-between">
                <p>Generated by {company.name} Loan Management System</p>
                <p>Page 1 of 1</p>
            </div>
        </div>
    );
};
