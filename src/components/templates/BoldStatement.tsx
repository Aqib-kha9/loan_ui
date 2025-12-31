import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface StatementProps {
    data: any;
    company: CompanySettings;
}

export const BoldStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-black font-sans mx-auto shadow-2xl flex flex-col box-border">

            {/* Header */}
            <div className="bg-black text-white p-16">
                <h1 className="text-5xl font-black uppercase mb-2">{company.name}</h1>
                <div className="w-full h-2 bg-[#ff3333] mb-8"></div>
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-400">STATEMENT</h2>
                        <p className="text-[#ff3333] font-bold uppercase tracking-widest">Account Ledger</p>
                    </div>
                    <div className="text-right text-sm font-mono">
                        <p>{company.gstin}</p>
                        <p>{company.email}</p>
                    </div>
                </div>
            </div>

            {/* Info Block */}
            <div className="bg-[#f0f0f0] p-12 grid grid-cols-2 gap-12 border-b-4 border-black">
                <div>
                    <span className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">Client</span>
                    <p className="text-3xl font-black mt-2">{data.customerName}</p>
                    <p className="font-medium text-gray-600">{data.address}</p>
                </div>
                <div className="text-right">
                    <span className="bg-[#ff3333] text-white px-2 py-1 text-xs font-bold uppercase">Loan ID</span>
                    <p className="text-5xl font-black mt-2 tracking-tighter">{data.loanAccountNo}</p>
                </div>
            </div>

            {/* Table */}
            <div className="p-12">
                <table className="w-full border-4 border-black">
                    <thead className="bg-black text-white">
                        <tr>
                            <th className="p-4 text-left uppercase text-sm font-black w-32">Date</th>
                            <th className="p-4 text-left uppercase text-sm font-black">Details</th>
                            <th className="p-4 text-right uppercase text-sm font-black w-32">DR</th>
                            <th className="p-4 text-right uppercase text-sm font-black w-32">CR</th>
                            <th className="p-4 text-right uppercase text-sm font-black w-32">BAL</th>
                        </tr>
                    </thead>
                    <tbody className="font-bold text-sm">
                        {(data.transactions || []).map((txn: any, i: number) => (
                            <tr key={i} className="border-b-2 border-gray-200 hover:bg-[#ff3333]/10">
                                <td className="p-4 font-mono">{txn.date}</td>
                                <td className="p-4">{txn.type}</td>
                                <td className="p-4 text-right text-red-600">{txn.type === 'Internal Transfer' ? txn.amount : '-'}</td>
                                <td className="p-4 text-right text-green-700">{txn.type !== 'Internal Transfer' ? txn.amount : '-'}</td>
                                <td className="p-4 text-right font-mono">...</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="mt-auto p-12 bg-black text-white text-center">
                <p className="font-bold text-[#ff3333] text-lg mb-2">END OF REPORT</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{company.name} | {company.tagline}</p>
            </div>
        </div>
    );
};
