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

export const CreativeStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-gray-800 font-sans mx-auto shadow-2xl flex flex-col relative overflow-hidden">
            {/* Header Curve */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-b-[50px] z-0"></div>

            <div className="relative z-10 p-12 text-white flex justify-between items-start">
                <div>
                    <div className="flex gap-4 items-center mb-2">
                        {company.logoUrl && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={company.logoUrl} alt="Logo" className="h-16 w-16 bg-white/20 backdrop-blur rounded p-1 object-contain" />
                        )}
                        <h1 className="text-4xl font-extrabold">{company.name}</h1>
                    </div>
                    <p className="opacity-80 font-medium tracking-wide">{company.tagline}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl border border-white/30 text-center shadow-lg">
                    <p className="text-xs font-bold uppercase opacity-70">Closing Balance</p>
                    <p className="text-2xl font-bold">{Number(data.closingBalance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                </div>
            </div>

            {/* Floating Cards */}
            <div className="relative z-10 px-12 -mt-12 grid grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform transition-transform hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">C</div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Customer</p>
                            <p className="text-xl font-bold text-gray-800">{data.customerName}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 pl-14">{data.address}</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform transition-transform hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">L</div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Loan Account</p>
                            <p className="text-xl font-bold text-gray-800">{data.loanAccountNo}</p>
                        </div>
                    </div>
                    <div className="pl-14 flex flex-col gap-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>Sanctioned:</span>
                            <span className="font-bold">{Number(data.loanAmount).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Int. Rate:</span>
                            <span className="font-bold">{data.interestRate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Int. Advance:</span>
                            <span className="font-bold">{data.interestPaidInAdvance ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline/Table */}
            <div className="flex-1 px-12 mt-12">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                    Transaction History
                </h3>

                <div className="bg-gray-50 rounded-3xl p-8 mb-8">
                    {/* Header */}
                    <div className="grid grid-cols-7 text-xs font-bold text-gray-400 uppercase mb-4 pl-4 border-b pb-2">
                        <div className="col-span-1">Date</div>
                        <div className="col-span-2">Particulars</div>
                        <div className="text-right col-span-1">Ref</div>
                        <div className="text-right">Principal</div>
                        <div className="text-right">Interest</div>
                        <div className="text-right">Total Paid</div>
                    </div>

                    <div className="space-y-4">
                        {(data.transactions || []).map((txn, i) => (
                            <div key={i} className="grid grid-cols-8 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-md cursor-default text-xs">
                                <div className="font-bold text-gray-500 whitespace-nowrap">{format(new Date(txn.date), "dd-MMM-yy")}</div>
                                <div className="col-span-2 font-bold text-gray-800">
                                    {txn.type === 'Disbursal' ? 'Loan Disbursal' : txn.type}
                                </div>
                                <div className="text-right text-purple-400 text-[10px]">{txn.refNo || '-'}</div>
                                <div className="text-right text-gray-500">
                                    {txn.principalComponent ? Number(txn.principalComponent).toLocaleString('en-IN') : '-'}
                                </div>
                                <div className="text-right text-rose-500 font-medium">
                                    {txn.interestComponent ? Number(txn.interestComponent).toLocaleString('en-IN') : '-'}
                                </div>
                                <div className="text-right">
                                    {txn.isPayment ? (
                                        <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                            {Number(txn.amount).toLocaleString('en-IN')}
                                        </span>
                                    ) : '-'}
                                </div>
                            </div>
                        ))}
                        {/* Re-doing the row mapping for safer layout including Balance */}
                    </div>
                    {/* Redoing the loop with correct columns to include Balance */}
                    <div className="mt-4 border-t pt-4">
                        <table className="w-full text-xs">
                            <thead className="text-gray-400 uppercase">
                                <tr>
                                    <th className="text-left py-2">Date</th>
                                    <th className="text-left py-2">Partic.</th>
                                    <th className="text-right py-2">Ref</th>
                                    <th className="text-right py-2">Princ.</th>
                                    <th className="text-right py-2">Int.</th>
                                    <th className="text-right py-2">Paid</th>
                                    <th className="text-right py-2">Bal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data.transactions || []).map((txn, i) => (
                                    <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-purple-50">
                                        <td className="py-3 font-bold text-gray-500">{format(new Date(txn.date), "dd-MMM-yy")}</td>
                                        <td className="py-3 font-bold text-gray-800">{txn.type === 'Disbursal' ? 'Disbursal' : txn.type}</td>
                                        <td className="py-3 text-right text-purple-400 text-[10px]">{txn.refNo || '-'}</td>
                                        <td className="py-3 text-right text-gray-500">{txn.principalComponent ? Number(txn.principalComponent).toLocaleString('en-IN') : '-'}</td>
                                        <td className="py-3 text-right text-rose-500">{txn.interestComponent ? Number(txn.interestComponent).toLocaleString('en-IN') : '-'}</td>
                                        <td className="py-3 text-right text-emerald-600 font-bold">{txn.isPayment ? Number(txn.amount).toLocaleString('en-IN') : '-'}</td>
                                        <td className="py-3 text-right text-gray-800 font-bold">{Number(txn.balanceAfter).toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="font-bold text-purple-900 bg-purple-50">
                                <tr>
                                    <td colSpan={3} className="py-3 px-2 text-right text-xs">TOTALS</td>
                                    <td className="py-3 text-right text-xs">-</td>
                                    <td className="py-3 text-right">{Number(data.totalInterest).toLocaleString('en-IN')}</td>
                                    <td className="py-3 text-right">{Number(data.totalPaid).toLocaleString('en-IN')}</td>
                                    <td className="py-3 text-right">{Number(data.closingBalance).toLocaleString('en-IN')}</td>
                                </tr>
                            </tfoot>
                        </table>
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
