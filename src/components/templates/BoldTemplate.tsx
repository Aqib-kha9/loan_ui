import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface ReceiptProps {
    data: any;
    company: CompanySettings;
}

export const BoldTemplate = ({ data, company }: ReceiptProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-black text-white font-sans mx-auto shadow-2xl flex flex-col box-border">

            {/* Heavy Header */}
            <div className="bg-white text-black p-12 pb-24 clip-path-slant">
                <h1 className="text-7xl font-black uppercase tracking-tighter leading-none mb-4">{company.name}</h1>
                <p className="text-xl font-bold uppercase tracking-widest border-2 border-black inline-block px-4 py-1">{company.tagline}</p>
            </div>

            <div className="px-12 -mt-12 mb-16 flex gap-4">
                <div className="bg-[#ff3333] w-4 h-24"></div>
                <div className="bg-[#fff] text-black p-6 w-full shadow-lg">
                    <h2 className="text-3xl font-black uppercase">Official Receipt</h2>
                    <div className="flex justify-between mt-2 font-bold text-gray-600">
                        <span>DATE: {format(new Date(), "dd/MM/yyyy")}</span>
                        <span>NO: 998877</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-12 flex-1">
                <div className="border-t-4 border-white pt-8 mb-12">
                    <p className="text-[#ff3333] font-bold text-sm uppercase mb-2">Payer Details</p>
                    <p className="text-5xl font-bold">{data.customerName}</p>
                    <p className="text-2xl text-gray-400 mt-2 font-mono">{data.loanAccountNo}</p>
                </div>

                <div className="grid grid-cols-2 gap-12 border-t-4 border-white pt-8 mb-12">
                    <div>
                        <p className="text-[#ff3333] font-bold text-sm uppercase mb-2">Payment For</p>
                        <p className="text-2xl font-bold">EMI Installment</p>
                        <p className="text-gray-400">Monthly loan repayment cycle.</p>
                    </div>
                    <div>
                        <p className="text-[#ff3333] font-bold text-sm uppercase mb-2">Amount Paid</p>
                        <p className="text-6xl font-black text-[#ff3333]">{Number(data.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-[#222] p-12 mt-auto">
                <div className="grid grid-cols-2 gap-8 text-sm text-gray-400 uppercase font-bold tracking-wider">
                    <div>
                        <p className="text-white mb-2">Contact</p>
                        <p>{company.address}</p>
                        <p>{company.mobile}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white mb-2">Authorized</p>
                        <div className="inline-block border-b-2 border-white w-32 pb-8"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
