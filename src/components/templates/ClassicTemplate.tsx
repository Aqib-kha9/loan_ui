import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface ReceiptProps {
    data: any;
    company: CompanySettings;
}

export const ClassicTemplate = ({ data, company }: ReceiptProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] p-16 border bg-white text-black font-serif mx-auto shadow-2xl flex flex-col box-border">
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-8 mb-8">
                {company.logoUrl && (
                    <div className="flex justify-center mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={company.logoUrl} alt="Logo" className="h-24 object-contain" />
                    </div>
                )}
                <h1 className="text-5xl font-bold uppercase tracking-wider mb-4">{company.name}</h1>
                <p className="text-lg font-medium">{company.address}</p>
                <div className="flex justify-center gap-4 text-sm mt-2">

                    <span>Mob: {company.mobile}</span>
                </div>
            </div>

            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-4xl font-bold underline decoration-2 underline-offset-4">PAYMENT RECEIPT</h2>
                </div>
                <div className="text-right">
                    <p className="text-lg"><strong>Receipt Date:</strong> {format(new Date(), "dd MMM yyyy")}</p>
                    <p className="text-lg"><strong>Receipt No:</strong> #REC-001</p>
                </div>
            </div>

            {/* Customer Info Box */}
            <div className="border-2 border-black p-6 mb-8">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-sm uppercase text-gray-500 font-bold mb-1">Customer Name</p>
                        <p className="font-bold text-2xl">{data.customerName}</p>
                    </div>
                    <div>
                        <p className="text-sm uppercase text-gray-500 font-bold mb-1">Loan Account No</p>
                        <p className="font-bold text-2xl">{data.loanAccountNo}</p>
                    </div>
                </div>
            </div>

            {/* Payment Details Table */}
            <table className="w-full border-collapse border-2 border-black mb-12">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border-2 border-black p-4 text-left text-lg">Description</th>
                        <th className="border-2 border-black p-4 text-right text-lg">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border-2 border-black p-6 text-xl">
                            EMI Payment Received
                            <br />
                            <span className="text-sm italic font-normal">
                                Received against EMI for the month of {format(new Date(), "MMMM yyyy")}
                            </span>
                        </td>
                        <td className="border-2 border-black p-6 text-right font-bold text-3xl align-top">
                            {Number(data.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr className="bg-gray-100 font-bold">
                        <td className="border-2 border-black p-4 text-right text-xl">TOTAL RECEIVED</td>
                        <td className="border-2 border-black p-4 text-right text-3xl">
                            {Number(data.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </td>
                    </tr>
                </tfoot>
            </table>

            {/* Words */}
            <div className="mb-16 border-b border-black pb-4 italic text-lg">
                Amount in words: Rupees {Number(data.amount).toLocaleString('en-IN')} Only
            </div>

            {/* Footer */}
            <div className="mt-auto pt-16 flex justify-between pb-8">
                <div className="text-center w-64">
                    <div className="border-t-2 border-black pt-2 font-bold">Customer Signature</div>
                </div>
                <div className="text-center w-64">
                    <div className="border-t-2 border-black pt-2 font-bold">Authorized Signatory</div>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
                <p>Thank you for banking with us. | {company.tagline}</p>
                <p>This is a computer-generated receipt.</p>
            </div>
        </div>
    );
};
