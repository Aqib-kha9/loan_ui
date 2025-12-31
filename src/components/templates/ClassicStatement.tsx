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
        transactions: any[];
    };
    company: CompanySettings;
}

export const ClassicStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-black font-serif p-12 border mx-auto shadow-2xl flex flex-col box-border">
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-6 mb-8">
                <h1 className="text-4xl font-bold uppercase tracking-widest mb-2">{company.name}</h1>
                <p className="text-sm font-bold uppercase">{company.tagline}</p>
                <p className="text-sm mt-1">{company.address}</p>
                <div className="flex justify-center gap-4 text-xs font-bold mt-2">
                    <span>GSTIN: {company.gstin}</span>
                    <span>|</span>
                    <span>CONTACT: {company.mobile}</span>
                </div>
            </div>

            <div className="flex justify-between items-end mb-8">
                <h2 className="text-2xl font-bold underline decoration-2 underline-offset-4 uppercase">Statement of Account</h2>
                <div className="text-right text-sm">
                    <p><strong>Date:</strong> {format(new Date(), "dd-MMM-yyyy")}</p>
                    <p><strong>Currency:</strong> INR</p>
                </div>
            </div>

            {/* Customer & Account Info Box */}
            <div className="border-2 border-black p-4 mb-8">
                <div className="grid grid-cols-2 gap-8 text-sm">
                    <div>
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td className="w-32 font-bold align-top">Customer Name:</td>
                                    <td className="align-top uppercase">{data.customerName}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold align-top">Address:</td>
                                    <td className="align-top">{data.address}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold align-top">Mobile:</td>
                                    <td className="align-top">{data.mobile}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td className="w-40 font-bold align-top">Loan Account No:</td>
                                    <td className="align-top font-bold">{data.loanAccountNo}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold align-top">Saction Date:</td>
                                    <td className="align-top">{data.sanctionDate}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold align-top">Loan Amount:</td>
                                    <td className="align-top">{Number(data.loanAmount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold align-top">Interest Rate:</td>
                                    <td className="align-top">{data.interestRate}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Ledger Table */}
            <table className="w-full border-collapse border-2 border-black text-sm mb-8">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-black p-2 text-left w-24">Date</th>
                        <th className="border border-black p-2 text-left">Particulars</th>
                        <th className="border border-black p-2 text-right w-24">Debit</th>
                        <th className="border border-black p-2 text-right w-24">Credit</th>
                        <th className="border border-black p-2 text-right w-28">Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Op Balance Mock */}
                    <tr>
                        <td className="border border-black p-2">{format(new Date().setMonth(new Date().getMonth() - 6), "dd/MM/yyyy")}</td>
                        <td className="border border-black p-2">Opening Balance</td>
                        <td className="border border-black p-2 text-right">-</td>
                        <td className="border border-black p-2 text-right">-</td>
                        <td className="border border-black p-2 text-right font-bold">{Number(data.loanAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {/* Transactions */}
                    {(data.transactions || []).map((txn, i) => (
                        <tr key={i}>
                            <td className="border border-black p-2">{txn.date}</td>
                            <td className="border border-black p-2">
                                {txn.type} <span className="text-xs">[{txn.ref}]</span>
                            </td>
                            <td className="border border-black p-2 text-right">
                                {txn.type === 'Internal Transfer' ? Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                            </td>
                            <td className="border border-black p-2 text-right">
                                {txn.type !== 'Internal Transfer' ? Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                            </td>
                            <td className="border border-black p-2 text-right">
                                {/* Mock balance logic for visual purpose */}
                                {Number(Number(data.loanAmount) - (i + 1) * 15000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Summary Footer */}
            <div className="flex justify-end mb-16">
                <div className="w-1/2 border-2 border-black p-4">
                    <div className="flex justify-between mb-2">
                        <span className="font-bold">Total Interest Debited:</span>
                        <span>₹ 0.00</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="font-bold">Total Amount Paid:</span>
                        <span>{Number(31000).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                    </div>
                    <div className="border-t border-black pt-2 flex justify-between text-lg font-bold">
                        <span>Closing Balance:</span>
                        <span>{Number(469000).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto text-center text-xs">
                <p>This is a computer generated statement and does not require a signature.</p>
                <p className="font-bold mt-1">END OF STATEMENT</p>
            </div>
        </div>
    );
};
