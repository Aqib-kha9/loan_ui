import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface ReceiptProps {
    data: any;
    company: CompanySettings;
}

export const ProfessionalTemplate = ({ data, company }: ReceiptProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-slate-800 font-sans mx-auto shadow-2xl flex flex-col box-border">

            {/* Top Bar */}
            <div className="bg-[#2c3e50] h-4 w-full"></div>

            {/* Header */}
            <div className="p-16 flex justify-between items-start border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-[#2c3e50] uppercase tracking-wide mb-1">{company.name}</h1>
                    <p className="text-gray-500 font-medium">{company.tagline}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                    <p className="font-bold text-gray-700 mb-1">Head Office</p>
                    <p>{company.address}</p>
                    <p>{company.mobile}</p>
                    <p>{company.email}</p>
                </div>
            </div>

            {/* Title Bar */}
            <div className="bg-[#ecf0f1] px-16 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#2c3e50] uppercase">Money Receipt</h2>
                <div className="text-sm">
                    <span className="font-bold text-gray-500 mr-2">DATE:</span>
                    <span>{format(new Date(), "dd-MMM-yyyy")}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-16 flex-1">

                <div className="flex gap-12 mb-12">
                    <div className="flex-1 p-6 border border-gray-200 rounded bg-gray-50">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Received From</p>
                        <p className="text-xl font-bold text-[#2c3e50]">{data.customerName}</p>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Loan Account</p>
                            <p className="font-mono text-lg">{data.loanAccountNo}</p>
                        </div>
                    </div>

                    <div className="flex-1 p-6 border border-[#2c3e50] rounded bg-[#2c3e50] text-white flex flex-col justify-center text-center">
                        <p className="text-sm font-bold opacity-80 uppercase mb-2">Amount Received</p>
                        <p className="text-4xl font-bold">{Number(data.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                    </div>
                </div>

                <div className="mb-12">
                    <p className="text-sm font-bold text-gray-500 uppercase mb-2 border-b border-gray-200 pb-2">Payment Description</p>
                    <p className="text-lg py-4">Received with thanks towards EMI Repayment for the month of {format(new Date(), "MMMM yyyy")}.</p>
                </div>

                <div className="grid grid-cols-2 gap-12 mt-12">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-4">Payment Mode</p>
                        <div className="flex gap-4">
                            <div className="border border-gray-300 px-4 py-2 rounded text-gray-500">Cash</div>
                            <div className="border border-gray-300 px-4 py-2 rounded text-gray-500">Cheque</div>
                            <div className="bg-[#2c3e50] text-white px-4 py-2 rounded font-bold">Online</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="p-16 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-12">
                    <div className="pt-8 w-48 text-center">
                        <div className="border-b border-gray-400 mb-2"></div>
                        <p className="text-xs font-bold uppercase text-gray-500">Depositor Signature</p>
                    </div>
                    <div className="pt-8 w-48 text-center ml-auto">
                        <div className="border-b border-gray-400 mb-2"></div>
                        <p className="text-xs font-bold uppercase text-gray-500">Authorized Signatory</p>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-12">Computer generated receipt. 2024 © {company.name}</p>
            </div>

        </div>
    );
};
