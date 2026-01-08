import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface ReceiptProps {
    data: any;
    company: CompanySettings;
}

export const MinimalTemplate = ({ data, company }: ReceiptProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-black font-sans mx-auto shadow-2xl flex flex-col p-20 box-border">

            {/* Minimal Header */}
            <div className="flex justify-between items-start mb-32">
                <h1 className="text-md font-bold uppercase tracking-tight">{company.name}</h1>
                <div className="text-right text-xs leading-relaxed text-gray-500">
                    <p>{company.address}</p>

                </div>
            </div>

            {/* Large Typography Amount */}
            <div className="mb-24">
                <p className="text-xs font-bold text-gray-400 mb-2">AMOUNT RECEIVED</p>
                <h2 className="text-8xl font-black tracking-tighter -ml-2">
                    {Number(data.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }).replace('₹', '')}
                    <span className="text-2xl font-normal text-gray-400 align-top mt-4 inline-block">INR</span>
                </h2>
            </div>

            {/* Grid Details */}
            <div className="grid grid-cols-4 gap-8 border-t border-black pt-8 mb-32">
                <div>
                    <p className="text-xs font-bold text-gray-400 mb-1">DATE</p>
                    <p className="text-sm font-medium">{format(new Date(), "dd.MM.yyyy")}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 mb-1">RECEIPT NO</p>
                    <p className="text-sm font-medium">#MIN-001</p>
                </div>
                <div className="col-span-2">
                    <p className="text-xs font-bold text-gray-400 mb-1">RECEIVED FROM</p>
                    <p className="text-lg font-bold">{data.customerName}</p>
                    <p className="text-xs text-gray-500">{data.loanAccountNo}</p>
                </div>
            </div>

            {/* Description */}
            <div className="mb-auto">
                <div className="flex justify-between items-baseline border-b border-gray-200 pb-2 mb-2">
                    <span className="text-lg font-medium">EMI Repayment</span>
                    <span className="font-mono">{Number(data.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
                <p className="text-xs text-gray-400 uppercase">Payment Method: Cash / Transfer</p>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end">
                <div className="w-32 h-32 bg-black text-white p-4 text-[10px] leading-tight flex items-end">
                    Digitally generated receipt. Valid without signature.
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-gray-900">{company.email}</p>
                    <p className="text-xs text-gray-400">{company.mobile}</p>
                </div>
            </div>

        </div>
    );
};
