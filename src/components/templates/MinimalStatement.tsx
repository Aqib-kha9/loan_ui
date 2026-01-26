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

export const MinimalStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-black font-sans mx-auto shadow-2xl flex flex-col p-20 box-border">

            {/* Header */}
            <div className="mb-20 flex justify-between items-start">
                <div>
                    {company.logoUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={company.logoUrl} alt="Logo" className="h-12 w-auto object-contain mb-4 grayscale" />
                    )}
                    <h1 className="text-xl font-bold tracking-tight mb-2">{company.name}</h1>
                    <div className="h-1 w-20 bg-black"></div>
                </div>
                <div className="text-right text-xs text-gray-400">
                    <p>{company.address}</p>

                </div>
            </div>

            {/* Title + Period */}
            <div className="flex justify-between items-end mb-16">
                <h2 className="text-6xl font-black tracking-tighter text-gray-200">STATEMENT</h2>
                <div className="text-right">
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Balance</p>
                    <p className="text-3xl font-light">{Number(data.closingBalance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                </div>
            </div>

            {/* Client Data Minimal Grid */}
            <div className="grid grid-cols-2 gap-x-20 gap-y-8 mb-16 border-t border-b border-gray-100 py-8">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 tracking-widest">CLIENT</label>
                    <p className="text-xl font-medium">{data.customerName}</p>
                    <p className="text-sm text-gray-500 mt-1">{data.address}</p>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 tracking-widest">DETAILS</label>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Account</span>
                        <span className="font-mono text-sm">{data.loanAccountNo}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Sanctioned</span>
                        <span className="font-mono text-sm">{Number(data.loanAmount).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Int. Rate</span>
                        <span className="font-mono text-sm">{data.interestRate}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Adv. Int.</span>
                        <span className="font-mono text-sm">{data.interestPaidInAdvance ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="w-full text-sm flex-1">
                <div className="grid grid-cols-12 text-[10px] font-bold text-gray-400 mb-4 px-2 tracking-widest">
                    <div className="col-span-2">DATE</div>
                    <div className="col-span-4">PARTICULARS</div>
                    <div className="col-span-2 text-right">PRINCIPAL</div>
                    <div className="col-span-2 text-right">INTEREST/PAID</div>
                    <div className="col-span-2 text-right">BALANCE</div>
                </div>

                <div className="space-y-1">
                    {(data.transactions || []).map((txn, i) => (
                        <div key={i} className="grid grid-cols-12 py-3 px-2 rounded hover:bg-gray-50 group items-center">
                            <div className="col-span-2 text-gray-500 text-xs">{format(new Date(txn.date), "dd.MM.yy")}</div>
                            <div className="col-span-4 font-medium">
                                {txn.type === 'Disbursal' ? 'Loan Disbursal' : txn.type}
                                <span className="hidden group-hover:inline ml-2 text-[10px] bg-gray-200 px-1 rounded text-gray-600 uppercase">{txn.refNo}</span>
                            </div>
                            <div className="col-span-2 text-right font-mono text-gray-400">
                                {txn.principalComponent ? Number(txn.principalComponent).toLocaleString('en-IN') : '-'}
                            </div>
                            <div className="col-span-2 text-right font-mono">
                                {txn.isPayment
                                    ? <span className="text-green-600">+{Number(txn.amount).toLocaleString('en-IN')}</span>
                                    : (txn.interestComponent ? <span className="text-red-400">-{Number(txn.interestComponent).toLocaleString('en-IN')}</span> : '-')
                                }
                            </div>
                            <div className="col-span-2 text-right font-mono text-black font-bold">
                                {Number(txn.balanceAfter).toLocaleString('en-IN')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-8 border-t border-black flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-gray-400">
                <p>{company.tagline}</p>
                {company.showSignatory && (
                    <div className="text-right">
                        {(() => {
                            const fullText = company.signatoryText || "Authorized Signatory";
                            const match = fullText.match(/^(authorized signatory)\s+(.+)$/i);
                            if (match) {
                                return (
                                    <>
                                        <p className="text-black mb-1 font-bold">{match[1]}</p>
                                        <p className="text-gray-500 mb-2 font-medium">{match[2]}</p>
                                    </>
                                );
                            }
                            return <p className="text-black mb-2 font-bold">{fullText}</p>;
                        })()}

                    </div>
                )}
                <p>Page 01 / 01</p>
            </div>

        </div>
    );
};
