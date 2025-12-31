import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface StatementProps {
    data: any;
    company: CompanySettings;
}

export const MinimalStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-black font-sans mx-auto shadow-2xl flex flex-col p-20 box-border">

            {/* Header */}
            <div className="mb-20">
                <h1 className="text-xl font-bold tracking-tight mb-2">{company.name}</h1>
                <div className="h-1 w-20 bg-black"></div>
            </div>

            {/* Title + Period */}
            <div className="flex justify-between items-end mb-20">
                <h2 className="text-6xl font-black tracking-tighter text-gray-200">STATEMENT</h2>
                <div className="text-right">
                    <p className="text-xs font-bold">PERIOD</p>
                    <p className="text-sm">2024 — 2025</p>
                </div>
            </div>

            {/* Client Data Minimal Grid */}
            <div className="grid grid-cols-2 gap-x-20 gap-y-8 mb-20 border-t border-b border-gray-100 py-8">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">CLIENT</label>
                    <p className="text-xl font-medium">{data.customerName}</p>
                    <p className="text-sm text-gray-500 mt-1">{data.address}</p>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">LOAN DETAILS</label>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-sm">Account</span>
                        <span className="font-mono text-sm">{data.loanAccountNo}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-sm">Amount</span>
                        <span className="font-mono text-sm">{data.loanAmount}</span>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="w-full text-sm">
                <div className="grid grid-cols-12 text-[10px] font-bold text-gray-400 mb-4 px-2">
                    <div className="col-span-2">DATE</div>
                    <div className="col-span-4">DESCRIPTION</div>
                    <div className="col-span-2 text-right">DEBIT</div>
                    <div className="col-span-2 text-right">CREDIT</div>
                    <div className="col-span-2 text-right">BALANCE</div>
                </div>

                <div className="space-y-1">
                    <div className="grid grid-cols-12 py-3 px-2 rounded hover:bg-gray-50">
                        <div className="col-span-2 text-gray-500">{format(new Date(), "dd.MM.yy")}</div>
                        <div className="col-span-4 font-medium">Opening Balance</div>
                        <div className="col-span-2 text-right text-gray-300">-</div>
                        <div className="col-span-2 text-right text-gray-300">-</div>
                        <div className="col-span-2 text-right font-mono">{Number(data.loanAmount).toLocaleString()}</div>
                    </div>
                    {(data.transactions || []).map((txn: any, i: number) => (
                        <div key={i} className="grid grid-cols-12 py-3 px-2 rounded hover:bg-gray-50 group">
                            <div className="col-span-2 text-gray-500">{txn.date}</div>
                            <div className="col-span-4 font-medium">
                                {txn.type}
                                <span className="hidden group-hover:inline ml-2 text-[10px] bg-gray-200 px-1 rounded text-gray-600">{txn.ref}</span>
                            </div>
                            <div className="col-span-2 text-right font-mono">{txn.type === 'Internal Transfer' ? txn.amount : '-'}</div>
                            <div className="col-span-2 text-right font-mono">{txn.type !== 'Internal Transfer' ? txn.amount : '-'}</div>
                            <div className="col-span-2 text-right font-mono text-gray-400">...</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-8 border-t border-black flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-gray-400">
                <p>{company.tagline}</p>
                <p>Page 01 / 01</p>
            </div>

        </div>
    );
};
