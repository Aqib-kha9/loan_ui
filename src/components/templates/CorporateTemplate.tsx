import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface ReceiptProps {
    data: any;
    company: CompanySettings;
}

export const CorporateTemplate = ({ data, company }: ReceiptProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-slate-800 font-sans p-12 relative flex flex-col mx-auto shadow-2xl">
            {/* Sidebar Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-sky-900"></div>

            {/* Header */}
            <header className="flex justify-between items-start mb-16 pl-8">
                <div>
                    <h1 className="text-4xl font-light text-sky-950 uppercase tracking-widest">{company.name}</h1>
                    <p className="text-sm font-semibold text-sky-700 tracking-wide">{company.tagline}</p>
                </div>
                <div className="text-right text-xs text-slate-500 leading-relaxed">
                    <p className="font-bold text-slate-700">HEAD OFFICE</p>
                    <p className="max-w-[200px]">{company.address}</p>
                    <p className="mt-2">GSTIN: {company.gstin}</p>
                    <p>Contact: {company.mobile}</p>
                </div>
            </header>

            {/* Title & Date */}
            <div className="flex justify-between items-end border-b-2 border-slate-200 pb-4 mb-12 pl-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Payment Receipt</h2>
                    <p className="text-sm text-slate-400">Transaction Acknowledgement</p>
                </div>
                <div className="text-right">
                    <div className="mb-1">
                        <span className="text-xs uppercase font-bold text-slate-400 mr-4">Date</span>
                        <span className="font-mono text-lg">{format(new Date(), "dd MMM yyyy")}</span>
                    </div>
                    <div>
                        <span className="text-xs uppercase font-bold text-slate-400 mr-4">Receipt #</span>
                        <span className="font-mono text-lg text-sky-700">RCT-CORP-001</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 pl-8 pr-4">
                {/* Payer Info */}
                <div className="bg-slate-50 p-6 rounded-lg mb-8 border border-slate-100">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Received From</p>
                            <p className="text-xl font-medium text-slate-800">{data.customerName}</p>
                            <p className="text-sm text-slate-500 mt-1">Loan Account: <span className="font-mono font-bold text-slate-700">{data.loanAccountNo}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Payment Method</p>
                            <p className="text-lg font-medium">Cash / Transfer</p>
                        </div>
                    </div>
                </div>

                {/* Amount Table */}
                <table className="w-full mb-12">
                    <thead>
                        <tr className="border-b border-slate-300">
                            <th className="text-left py-3 text-sm font-bold text-slate-500 uppercase">Description</th>
                            <th className="text-right py-3 text-sm font-bold text-slate-500 uppercase">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-6 border-b border-slate-100 text-lg">
                                EMI Repayment
                                <p className="text-xs text-slate-400 mt-1">Towards outstanding loan balance.</p>
                            </td>
                            <td className="py-6 border-b border-slate-100 text-right text-lg font-mono">
                                {Number(data.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className="pt-6 text-right text-sm font-bold text-slate-500 uppercase">Total Paid</td>
                            <td className="pt-6 text-right text-3xl font-bold text-sky-900">
                                {Number(data.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <div className="text-sm text-slate-500 italic">
                    * This payment is subject to realization.
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto pl-8">
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <div className="h-24 flex items-end">
                            <div className="w-full border-b border-slate-400"></div>
                        </div>
                        <p className="mt-2 text-xs font-bold uppercase text-slate-400">Customer Signature</p>
                    </div>
                    <div>
                        <div className="h-24 flex items-end">
                            <div className="w-full border-b border-slate-400"></div>
                        </div>
                        <p className="mt-2 text-xs font-bold uppercase text-slate-400">Authorized Signatory</p>
                    </div>
                </div>

                <div className="bg-sky-950 text-white p-4 -mx-12 mb-0 flex justify-between items-center px-16">
                    <p className="text-xs opacity-70">Thank you for your business.</p>
                    <p className="text-xs font-mono opacity-50">Generated via System</p>
                </div>
            </footer>
        </div>
    );
};
