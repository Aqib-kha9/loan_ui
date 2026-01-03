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

export const TechStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-[#0a0a0a] text-[#00ff41] font-mono mx-auto shadow-2xl flex flex-col p-8 box-border relative overflow-hidden">

            {/* Scanline Effect Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>

            {/* Header */}
            <div className="border-b-2 border-[#00ff41] pb-4 mb-8 flex justify-between items-end relative z-20">
                <div className="flex gap-4 items-center">
                    {company.logoUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={company.logoUrl} alt="Logo" className="h-12 w-auto bg-[#00ff41] p-1 invert" />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold uppercase">{company.name}</h1>
                        <p className="text-xs opacity-70">SYSTEM REPORT: LEDGER_V2.5 // {company.tagline}</p>
                    </div>
                </div>
                <div className="text-right text-xs">
                    <p>SERVER_TIME: {format(new Date(), "HH:mm:ss")}</p>
                    <p>IP: 192.168.1.X</p>
                    <p>SESSION_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
            </div>

            {/* User Block */}
            <div className="grid grid-cols-2 gap-4 mb-8 border border-[#00ff41] p-4 text-xs relative z-20 bg-[#00ff41]/5">
                <div>
                    <p className="opacity-50 text-[10px] mb-1">USER_PROFILE</p>
                    <p className="font-bold text-lg">{data.customerName}</p>
                    <p className="opacity-70">{data.address}</p>
                    <p className="opacity-70">PH: {data.mobile}</p>
                </div>
                <div className="text-right">
                    <p className="opacity-50 text-[10px] mb-1">ACCOUNT_METRICS</p>
                    <p>LOAN_ID: <span className="font-bold">{data.loanAccountNo}</span></p>
                    <p>SANCTIONED: {Number(data.loanAmount).toLocaleString('en-IN')}</p>
                    <p>INT_RATE: {data.interestRate}</p>
                    <p>ADV_INT: {data.interestPaidInAdvance ? 'TRUE' : 'FALSE'}</p>
                    <p className="mt-2 text-lg font-bold border-t border-[#00ff41] inline-block pt-1">BAL: {Number(data.closingBalance).toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* Command Line Table */}
            <div className="flex-1 relative z-20">
                <div className="grid grid-cols-12 border-b border-[#00ff41] pb-2 mb-2 text-xs font-bold opacity-70">
                    <div className="col-span-2">TIMESTAMP</div>
                    <div className="col-span-3">OPERATION</div>
                    <div className="col-span-2 text-right">PRINC(DR)</div>
                    <div className="col-span-2 text-right">INT(DR)</div>
                    <div className="col-span-1 text-right">PAID(CR)</div>
                    <div className="col-span-2 text-right">STATE_RES</div>
                </div>

                <div className="space-y-1 text-xs">
                    {(data.transactions || []).map((txn, i) => (
                        <div key={i} className="grid grid-cols-12 hover:bg-[#00ff41]/20 py-1 px-1 cursor-crosshair border-b border-[#00ff41]/10">
                            <div className="col-span-2 opacity-70">{format(new Date(txn.date), "yyyy-MM-dd")}</div>
                            <div className="col-span-3 truncate pr-2">
                                {txn.type}
                                {txn.refNo && <span className="opacity-40 block text-[10px]">[{txn.refNo}]</span>}
                            </div>
                            <div className="col-span-2 text-right text-[#00ff41]/70">
                                {txn.principalComponent ? Number(txn.principalComponent).toFixed(2) : '-'}
                            </div>
                            <div className="col-span-2 text-right text-red-500">
                                {txn.type === 'Interest' || txn.interestComponent ? Number(txn.amount).toFixed(2) : '-'}
                            </div>
                            <div className="col-span-1 text-right text-[#00ff41] font-bold">
                                {txn.isPayment ? Number(txn.amount).toFixed(0) : '-'}
                            </div>
                            <div className="col-span-2 text-right opacity-90 font-bold">
                                {Number(txn.balanceAfter).toLocaleString('en-IN')}
                            </div>
                        </div>
                    ))}
                    {/* Filler Lines */}
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={`fill-${i}`} className="grid grid-cols-12 py-1 px-1 opacity-10">
                            <div className="col-span-2">--/--/--</div>
                            <div className="col-span-3">---</div>
                            <div className="col-span-2 text-right">---</div>
                            <div className="col-span-2 text-right">---</div>
                            <div className="col-span-1 text-right">---</div>
                            <div className="col-span-2 text-right">---</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto border-t border-[#00ff41] pt-4 text-center text-xs relative z-20">
                <p className="animate-pulse">_END_OF_FILE_</p>
                <div className="flex justify-between w-full opacity-50 mt-2 text-[10px]">
                    <span>TOT_INT: {Number(data.totalInterest).toFixed(2)}</span>
                    <span>TOT_PAID: {Number(data.totalPaid).toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};
