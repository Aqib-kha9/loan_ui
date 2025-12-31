import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface ReceiptProps {
    data: any;
    company: CompanySettings;
}

export const ModernTemplate = ({ data, company }: ReceiptProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-slate-50 text-slate-900 font-sans relative overflow-hidden mx-auto shadow-2xl flex flex-col p-12 box-border">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-100/50 rounded-bl-full -mr-20 -mt-20 z-0"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-100/30 rounded-tr-full -ml-16 -mb-16 z-0"></div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start mb-20">
                <div>
                    <h1 className="text-5xl font-extrabold text-blue-900 tracking-tight leading-tight mb-2">{company.name}</h1>
                    <p className="text-slate-500 font-medium text-xl">{company.tagline}</p>
                </div>
                <div className="text-right text-sm text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-700">{company.address}</p>
                    <p>{company.email}</p>
                    <p>{company.mobile}</p>
                </div>
            </div>

            {/* Amount Hero */}
            <div className="relative z-10 bg-white rounded-3xl p-12 shadow-lg ring-1 ring-slate-100 mb-16 text-center transform hover:scale-[1.01] transition-transform">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Amount Paid</p>
                <h2 className="text-7xl font-black text-emerald-600 mb-6">
                    {Number(data.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </h2>
                <div className="inline-flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-2 rounded-full text-sm font-bold border border-emerald-100">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    PAYMENT SUCCESSFUL
                </div>
            </div>

            {/* Details Grid */}
            <div className="relative z-10 grid grid-cols-2 gap-y-12 gap-x-8 mb-16 px-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Customer Name</label>
                    <p className="text-3xl font-bold text-slate-800">{data.customerName}</p>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Loan ID</label>
                    <p className="text-3xl font-bold text-slate-800 font-mono">{data.loanAccountNo}</p>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Payment Date</label>
                    <p className="text-2xl font-medium text-slate-700">{format(new Date(), "dd MMMM, yyyy")}</p>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Receipt Reference</label>
                    <p className="text-2xl font-mono text-slate-600">#MOD-2024-X</p>
                </div>
            </div>

            <div className="relative z-10 border-t-2 border-dashed border-slate-200 lg:my-12"></div>

            {/* Footer */}
            <div className="mt-auto relative z-10 flex justify-between items-center text-slate-400 text-sm font-medium">
                <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-widest text-slate-300">Authorized By</span>
                    <span className="text-slate-600/50 text-xl font-serif italic">{company.name} Signature</span>
                </div>
                <div className="text-right">
                    <p>Thank you for your payment.</p>
                </div>
            </div>
        </div>
    );
};
