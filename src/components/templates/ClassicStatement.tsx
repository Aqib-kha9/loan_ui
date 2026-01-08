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

export const ClassicStatement = ({ data, company }: StatementProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-black font-serif p-12 border mx-auto shadow-2xl flex flex-col box-border">
            {/* Header */}
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-6 mb-8">
                <div className="flex-shrink-0 mr-4">
                    {company.logoUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={company.logoUrl} alt="Logo" className="h-24 object-contain max-w-[200px]" />
                    )}
                </div>
                <div className="text-right flex-grow">
                    <h1 className="text-4xl font-bold uppercase tracking-widest mb-2">{company.name}</h1>
                    <p className="text-sm font-bold uppercase">{company.tagline}</p>
                    <p className="text-sm mt-1">{company.address}</p>
                    <div className="flex justify-end gap-4 text-xs font-bold mt-2">

                        <span>CONTACT: {company.mobile}</span>
                    </div>
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
                                <tr>
                                    <td className="font-bold align-top">Int. Advance:</td>
                                    <td className="align-top">{data.interestPaidInAdvance ? 'Yes' : 'No'}</td>
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
                        <th className="border border-black p-2 text-left w-28">Ref No.</th>
                        <th className="border border-black p-2 text-right w-24">Principal</th>
                        <th className="border border-black p-2 text-right w-24">Interest</th>
                        <th className="border border-black p-2 text-right w-20">Penalty</th>
                        <th className="border border-black p-2 text-right w-24">Total Paid</th>
                        <th className="border border-black p-2 text-right w-28">Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Transactions */}
                    {(data.transactions || []).map((txn, i) => (
                        <tr key={i}>
                            <td className="border border-black p-2 whitespace-nowrap">{format(new Date(txn.date), "dd-MMM-yyyy")}</td>
                            <td className="border border-black p-2">{txn.particulars || (txn.type === 'Disbursal' ? 'Loan Disbursal' : txn.type)}</td>
                            <td className="border border-black p-2">{txn.refNo || '-'}</td>
                            <td className="border border-black p-2 text-right">
                                {txn.principalComponent ? Number(txn.principalComponent).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                            </td>
                            <td className="border border-black p-2 text-right">
                                {txn.interestComponent
                                    ? Number(txn.interestComponent).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                                    : '-'
                                }
                            </td>
                            <td className="border border-black p-2 text-right">
                                {txn.penalty ? Number(txn.penalty).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                            </td>
                            <td className="border border-black p-2 text-right font-bold">
                                {/* Only show in Total Paid if it is a payment */}
                                {txn.isPayment
                                    ? Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                                    : '-'
                                }
                            </td>
                            <td className="border border-black p-2 text-right">
                                {Number(txn.balanceAfter).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                        <span>{Number(data.totalInterest || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="font-bold">Total Amount Paid:</span>
                        <span>{Number(data.totalPaid || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                    </div>
                    <div className="border-t border-black pt-2 flex justify-between text-lg font-bold">
                        <span>Closing Balance:</span>
                        <span>{Number(data.closingBalance || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto text-center text-xs space-y-2">
                {company.showComputerGenerated && (
                    <p>{company.computerGeneratedText || "This is a computer generated statement and does not require a signature."}</p>
                )}
                {company.showStatementEnd && (
                    <p className="font-bold mt-1">{company.statementEndText || "END OF STATEMENT"}</p>
                )}
                {company.showCertification && (
                    <p className="mt-4 italic text-[10px]">
                        "{company.certificationText || 'I/We hereby certify that the particulars furnished above are true and correct as per our books of accounts.'}"
                    </p>
                )}
                {company.showJurisdiction && (
                    <div className="mt-2 font-bold uppercase border-t border-black inline-block pt-1 px-4">
                        {company.jurisdictionText || "Subject to Jurisdiction"}
                    </div>
                )}
            </div>

            {/* Legal / Court Signatory Section */}
            {company.showSignatory && (
                <div className="mt-8 flex justify-end items-end pb-8 break-inside-avoid">
                    <div className="text-center w-64">
                        <div className="h-20 mb-2 flex items-end justify-center pb-2">
                            <span className="text-gray-400 text-xs">[Stamp / Seal]</span>
                        </div>
                        {(() => {
                            const fullText = company.signatoryText || "Authorized Signatory";
                            const match = fullText.match(/^(authorized signatory)\s+(.+)$/i);
                            if (match) {
                                return (
                                    <>
                                        <div className="border-t border-black pt-2 font-bold text-sm">{match[1]}</div>
                                        <div className="font-medium text-xs mt-1">{match[2]}</div>
                                    </>
                                );
                            }
                            return <div className="border-t border-black pt-2 font-bold text-sm">{fullText}</div>;
                        })()}

                    </div>
                </div>
            )}
        </div>
    );
};
