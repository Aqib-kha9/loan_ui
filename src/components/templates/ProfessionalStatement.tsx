import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface StatementProps {
    data: any;
    company: CompanySettings;
}

export const ProfessionalStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-slate-800 font-sans mx-auto shadow-2xl flex flex-col box-border">

            {/* Top Bar */}
            <div className="bg-[#2c3e50] h-6 w-full mb-8"></div>

            {/* Header */}
            <div className="px-12 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-400">LOGO</div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#2c3e50] uppercase">{company.name}</h1>
                        <p className="text-sm text-gray-500">{company.address}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="bg-[#ecf0f1] px-4 py-2 rounded">
                        <p className="text-xs font-bold text-gray-500 uppercase">Statement Period</p>
                        <p className="font-mono font-bold">Apr 24 - Mar 25</p>
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
                    </div>
                </div>
            </div>

            <div className="px-12 flex-1">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[#2c3e50] text-white">
                            <th className="py-3 px-4 text-left font-semibold">Date</th>
                            <th className="py-3 px-4 text-left font-semibold w-5/12">Description</th>
                            <th className="py-3 px-4 text-right font-semibold">Debit</th>
                            <th className="py-3 px-4 text-right font-semibold">Credit</th>
                            <th className="py-3 px-4 text-right font-semibold">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr className="bg-gray-50">
                            <td className="py-3 px-4 text-gray-500">{format(new Date(), "dd-MMM-yy")}</td>
                            <td className="py-3 px-4 italic text-gray-500">Opening Balance</td>
                            <td className="py-3 px-4 text-right text-gray-400">-</td>
                            <td className="py-3 px-4 text-right text-gray-400">-</td>
                            <td className="py-3 px-4 text-right font-mono font-bold">{Number(data.loanAmount).toLocaleString()}</td>
                        </tr>
                        {(data.transactions || []).map((txn: any, i: number) => (
                            <tr key={i} className="hover:bg-blue-50">
                                <td className="py-3 px-4 text-gray-700">{txn.date}</td>
                                <td className="py-3 px-4 font-medium text-[#2c3e50]">{txn.type} <span className="text-gray-400 font-normal text-xs ml-1">({txn.ref})</span></td>
                                <td className="py-3 px-4 text-right text-red-600">{txn.type === 'Internal Transfer' ? txn.amount : '-'}</td>
                                <td className="py-3 px-4 text-right text-green-700">{txn.type !== 'Internal Transfer' ? txn.amount : '-'}</td>
                                <td className="py-3 px-4 text-right font-mono">...</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-12 py-8 bg-[#f8f9fa] border-t border-gray-200 text-center text-xs text-gray-500">
                <p>This is a system generated statement and does not require a physical signature.</p>
                <p>{company.email} | {company.mobile}</p>
            </div>
        </div>
    );
};
