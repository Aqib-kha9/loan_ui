import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface StatementProps {
    data: any;
    company: CompanySettings;
}

export const CreativeStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-gray-800 font-sans mx-auto shadow-2xl flex flex-col relative overflow-hidden">
            {/* Header Curve */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-b-[50px] z-0"></div>

            <div className="relative z-10 p-12 text-white flex justify-between items-start">
                <div>
                    <h1 className="text-5xl font-extrabold mb-2">{company.name}</h1>
                    <p className="opacity-80 font-medium tracking-wide">{company.tagline}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl border border-white/30 text-center">
                    <p className="text-xs font-bold uppercase opacity-70">Statement Period</p>
                    <p className="text-lg font-bold">2024-2025</p>
                </div>
            </div>

            {/* Floating Cards */}
            <div className="relative z-10 px-12 -mt-12 grid grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">C</div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Customer</p>
                            <p className="text-xl font-bold text-gray-800">{data.customerName}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 pl-14">{data.address}</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">L</div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Loan Account</p>
                            <p className="text-xl font-bold text-gray-800">{data.loanAccountNo}</p>
                        </div>
                    </div>
                    <div className="pl-14 flex gap-4 text-sm font-bold text-gray-600">
                        <span>{Number(data.loanAmount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                        <span className="text-gray-300">|</span>
                        <span>12.5%</span>
                    </div>
                </div>
            </div>

            {/* Timeline/Table */}
            <div className="flex-1 px-12 mt-12">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                    Transaction History
                </h3>

                <div className="bg-gray-50 rounded-3xl p-8">
                    {/* Header */}
                    <div className="grid grid-cols-5 text-xs font-bold text-gray-400 uppercase mb-4 pl-4">
                        <div>Date</div>
                        <div className="col-span-2">Info</div>
                        <div className="text-right">Amount</div>
                        <div className="text-right">Status</div>
                    </div>

                    <div className="space-y-4">
                        {(data.transactions || []).map((txn: any, i: number) => (
                            <div key={i} className="grid grid-cols-5 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-md cursor-default">
                                <div className="font-bold text-gray-500 text-sm">{txn.date}</div>
                                <div className="col-span-2">
                                    <p className="font-bold text-gray-800">{txn.type}</p>
                                    <p className="text-xs text-purple-400">#{txn.ref}</p>
                                </div>
                                <div className="text-right font-mono font-bold text-gray-700">
                                    {Number(txn.amount).toLocaleString('en-IN')}
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${txn.type === 'Internal Transfer' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {txn.type === 'Internal Transfer' ? 'Debit' : 'Credit'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-8 text-center bg-gray-50 border-t">
                <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Generated by {company.name}</p>
            </div>

        </div>
    );
};
