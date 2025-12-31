import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface ReceiptProps {
    data: any;
    company: CompanySettings;
}

export const ElegantTemplate = ({ data, company }: ReceiptProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-[#fffcf5] text-[#2c2c2c] font-serif mx-auto shadow-2xl flex flex-col p-16 box-border border-[12px] border-double border-[#d4af37]">
            {/* Decorative Corner */}
            <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-[#d4af37]"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[#d4af37]"></div>

            {/* Header */}
            <div className="text-center mb-16">
                <h1 className="text-6xl font-normal tracking-widest text-[#1a1a1a] mb-4">{company.name}</h1>
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="h-[1px] w-20 bg-[#d4af37]"></div>
                    <p className="text-[#d4af37] uppercase tracking-[0.3em] text-sm">{company.tagline}</p>
                    <div className="h-[1px] w-20 bg-[#d4af37]"></div>
                </div>
                <p className="text-gray-500 italic text-sm">{company.address}</p>
                <p className="text-gray-500 text-xs mt-1">{company.email} | {company.mobile}</p>
            </div>

            {/* Title */}
            <div className="text-center mb-12">
                <span className="inline-block border-2 border-[#d4af37] px-8 py-2 text-xl tracking-widest uppercase">Payment Receipt</span>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-2 gap-16 mb-12">
                <div>
                    <p className="text-[#d4af37] text-xs uppercase tracking-widest mb-2">Received From</p>
                    <p className="text-2xl border-b border-gray-300 pb-2">{data.customerName}</p>
                    <p className="text-sm text-gray-400 mt-2">Loan ID: {data.loanAccountNo}</p>
                </div>
                <div className="text-right">
                    <p className="text-[#d4af37] text-xs uppercase tracking-widest mb-2">Receipt Details</p>
                    <p className="text-lg">Date: {format(new Date(), "MMMM dd, yyyy")}</p>
                    <p className="text-lg">No: #ELG-001</p>
                </div>
            </div>

            {/* Amount Box */}
            <div className="bg-[#1a1a1a] text-[#d4af37] p-8 text-center mb-16 shadow-xl">
                <p className="text-sm uppercase tracking-widest mb-4 text-gray-400">Total Amount Received</p>
                <p className="text-5xl font-medium">{Number(data.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                <p className="text-sm italic text-gray-400 mt-4 border-t border-gray-700 pt-4 inline-block">
                    Received against EMI Payment
                </p>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-12 text-center text-sm text-gray-400 border-t border-[#d4af37]/30">
                <p className="italic mb-8">&quot;Trust is the currency of our business.&quot;</p>
                <div className="flex justify-between items-end px-12">
                    <div className="text-center">
                        <div className="h-16 w-32 border-b border-gray-400 mb-2"></div>
                        <p className="text-xs uppercase">Customer Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="h-16 w-32 border-b border-gray-400 mb-2"></div>
                        <p className="text-xs uppercase">Authorized Signatory</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
