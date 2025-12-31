import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface StatementProps {
    data: any;
    company: CompanySettings;
}

export const ElegantStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-[#fffcf5] text-[#2c2c2c] font-serif mx-auto shadow-2xl flex flex-col p-16 box-border border-x-[1px] border-[#d4af37]">

            {/* Header */}
            <div className="flex justify-between items-end border-b border-[#d4af37] pb-8 mb-12">
                <div>
                    <h1 className="text-4xl text-[#1a1a1a] tracking-widest mb-1">{company.name}</h1>
                    <p className="text-[#d4af37] text-xs uppercase tracking-[0.2em]">{company.tagline}</p>
                </div>
                <div className="text-right text-xs text-gray-500 italic">
                    <p>{company.address}</p>
                    <p className="mt-1">{company.email}</p>
                </div>
            </div>

            {/* Context */}
            <div className="text-center mb-12">
                <h2 className="text-2xl uppercase tracking-[0.2em] font-light">Statement of Account</h2>
                <p className="text-[#d4af37] italic mt-2">Private & Confidential</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-12 mb-12 text-sm">
                <div className="bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-[#d4af37] uppercase tracking-widest text-xs mb-4">Client Details</h3>
                    <p className="text-xl mb-1">{data.customerName}</p>
                    <p className="text-gray-500 italic">{data.address}</p>
                    <p className="text-gray-500 mt-2">Ph: {data.mobile}</p>
                </div>
                <div className="bg-white p-6 shadow-sm border border-gray-100 text-right">
                    <h3 className="text-[#d4af37] uppercase tracking-widest text-xs mb-4">Loan Summary</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Account No</span>
                            <span>{data.loanAccountNo}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Sanctioned</span>
                            <span>{Number(data.loanAmount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Interest</span>
                            <span>{data.interestRate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <table className="w-full mb-12">
                <thead>
                    <tr className="border-b-2 border-[#1a1a1a]">
                        <th className="text-left py-4 font-normal uppercase tracking-widest text-xs">Date</th>
                        <th className="text-left py-4 font-normal uppercase tracking-widest text-xs">Description</th>
                        <th className="text-right py-4 font-normal uppercase tracking-widest text-xs text-red-800">Debit</th>
                        <th className="text-right py-4 font-normal uppercase tracking-widest text-xs text-green-800">Credit</th>
                        <th className="text-right py-4 font-normal uppercase tracking-widest text-xs">Balance</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    <tr className="border-b border-gray-100">
                        <td className="py-4 text-gray-500">{format(new Date(), "dd MMM yyyy")}</td>
                        <td className="py-4 italic">Opening Balance</td>
                        <td className="py-4 text-right">-</td>
                        <td className="py-4 text-right">-</td>
                        <td className="py-4 text-right">{Number(data.loanAmount).toLocaleString()}</td>
                    </tr>
                    {(data.transactions || []).map((txn: any, i: number) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-[#1a1a1a]/5 transition-colors">
                            <td className="py-4 text-gray-500">{txn.date}</td>
                            <td className="py-4">
                                {txn.type}
                                <span className="block text-[10px] text-[#d4af37]">{txn.ref}</span>
                            </td>
                            <td className="py-4 text-right text-red-900/70">{txn.type === 'Internal Transfer' ? txn.amount : '-'}</td>
                            <td className="py-4 text-right text-green-900/70">{txn.type !== 'Internal Transfer' ? txn.amount : '-'}</td>
                            <td className="py-4 text-right text-gray-600 font-medium">...</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer */}
            <div className="mt-auto flex items-center justify-center p-8">
                <div className="w-8 h-8 border border-[#d4af37] rotate-45"></div>
            </div>
        </div>
    );
};
