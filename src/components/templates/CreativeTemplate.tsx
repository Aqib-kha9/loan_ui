import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface ReceiptProps {
    data: any;
    company: CompanySettings;
}

export const CreativeTemplate = ({ data, company }: ReceiptProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-gray-800 font-sans mx-auto shadow-2xl flex flex-col relative overflow-hidden">

            {/* Background Shapes */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600 rounded-full translate-x-1/3 -translate-y-1/3 opacity-10"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-400 rounded-full -translate-x-1/3 translate-y-1/3 opacity-10"></div>
            <div className="absolute top-1/2 left-0 w-24 h-24 bg-pink-500 rounded-full -translate-x-1/2 opacity-20"></div>

            {/* Header */}
            <div className="p-16 relative z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-1">{company.name}</h1>
                    <span className="bg-black text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide">{company.tagline}</span>
                </div>
                <div className="text-right">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase">Receipt No</p>
                        <p className="text-xl font-bold font-mono text-purple-600">#CREATIVE-001</p>
                    </div>
                </div>
            </div>

            {/* Receipt Card */}
            <div className="mx-16 relative z-10">
                <div className="bg-white/80 backdrop-blur-xl border border-white p-12 rounded-3xl shadow-2xl ring-1 ring-black/5">
                    <div className="text-center mb-12">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Received</p>
                        <h2 className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            {Number(data.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </h2>
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold mt-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Confirmed
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-t border-dashed border-gray-200 pt-8">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Customer</label>
                            <p className="text-xl font-bold text-gray-800">{data.customerName}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Loan Reference</label>
                            <p className="text-xl font-bold text-gray-800">{data.loanAccountNo}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Date</label>
                            <p className="text-lg font-medium text-gray-600">{format(new Date(), "MMM dd, yyyy")}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Time</label>
                            <p className="text-lg font-medium text-gray-600">{format(new Date(), "hh:mm a")}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto p-16 relative z-10 text-center">
                <div className="flex justify-center gap-4 text-gray-400 mb-8">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-500 font-medium">{company.address}</p>
                <p className="text-xs text-purple-400 font-bold mt-2">{company.email}</p>
            </div>

        </div>
    );
};
