import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface StatementProps {
    data: any;
    company: CompanySettings;
}

export const TechStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-[#0a0a0a] text-[#00ff41] font-mono mx-auto shadow-2xl flex flex-col p-8 box-border relative">

            {/* Header */}
            <div className="border-b-2 border-[#00ff41] pb-4 mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold">{company.name}</h1>
                    <p className="text-xs opacity-70">SYSTEM REPORT: LEDGER_V1.0</p>
                </div>
                <div className="text-right text-xs">
                    <p>SERVER_TIME: {format(new Date(), "HH:mm:ss")}</p>
                    <p>IP: 192.168.1.X</p>
                </div>
            </div>

            {/* User Block */}
            <div className="grid grid-cols-2 gap-4 mb-8 border border-[#00ff41] p-4 text-sm">
                <div>
                    <p className="opacity-50 text-xs">USER_PROFILE</p>
                    <p className="font-bold text-lg">{data.customerName}</p>
                    <p className="opacity-70">{data.address}</p>
                </div>
                <div className="text-right">
                    <p className="opacity-50 text-xs">ACCOUNT_METRICS</p>
                    <p>LOAN_ID: {data.loanAccountNo}</p>
                    <p>SANCTIONED: {data.loanAmount}</p>
                </div>
            </div>

            {/* Command Line Table */}
            <div className="flex-1">
                <div className="grid grid-cols-12 border-b border-[#00ff41] pb-2 mb-2 text-xs font-bold opacity-70">
                    <div className="col-span-2">TIMESTAMP</div>
                    <div className="col-span-4">OPERATION</div>
                    <div className="col-span-2 text-right">INPUT(DR)</div>
                    <div className="col-span-2 text-right">OUTPUT(CR)</div>
                    <div className="col-span-2 text-right">Result</div>
                </div>

                <div className="space-y-1 text-xs">
                    {(data.transactions || []).map((txn: any, i: number) => (
                        <div key={i} className="grid grid-cols-12 hover:bg-[#00ff41]/20 py-1 px-1 cursor-crosshair">
                            <div className="col-span-2 opacity-70">{txn.date}</div>
                            <div className="col-span-4">{txn.type} <span className="opacity-40">[{txn.ref}]</span></div>
                            <div className="col-span-2 text-right text-red-500">{txn.type === 'Internal Transfer' ? txn.amount : 'NULL'}</div>
                            <div className="col-span-2 text-right text-[#00ff41]">{txn.type !== 'Internal Transfer' ? txn.amount : 'NULL'}</div>
                            <div className="col-span-2 text-right opacity-50">CALC...</div>
                        </div>
                    ))}
                    {/* Filler Lines */}
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={`fill-${i}`} className="grid grid-cols-12 py-1 px-1 opacity-10">
                            <div className="col-span-2">--/--/--</div>
                            <div className="col-span-4">---</div>
                            <div className="col-span-2 text-right">---</div>
                            <div className="col-span-2 text-right">---</div>
                            <div className="col-span-2 text-right">---</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto border-t border-[#00ff41] pt-4 text-center text-xs">
                <p>END_OF_FILE</p>
            </div>
        </div>
    );
};
