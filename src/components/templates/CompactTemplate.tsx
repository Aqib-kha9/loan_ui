import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface ReceiptProps {
    data: any;
    company: CompanySettings;
}

export const CompactTemplate = ({ data, company }: ReceiptProps) => {
    return (
        <div className="p-4 bg-white text-black font-mono text-sm max-w-[300px] mx-auto border-2 border-dashed border-gray-300">

            <div className="text-center mb-4">
                <h2 className="font-bold text-lg uppercase">{company.name}</h2>
                <p className="text-[10px]">{company.address}</p>
                <p className="text-[10px]">Ph: {company.mobile}</p>
            </div>

            <div className="border-b border-black border-dashed my-2"></div>

            <div className="flex justify-between">
                <span>Date:</span>
                <span>{format(new Date(), "dd/MM/yy")}</span>
            </div>
            <div className="flex justify-between">
                <span>Time:</span>
                <span>{format(new Date(), "HH:mm")}</span>
            </div>

            <div className="border-b border-black border-dashed my-2"></div>

            <div className="mb-2">
                <p className="font-bold">Received From:</p>
                <p>{data.customerName}</p>
                <p>A/c: {data.loanAccountNo}</p>
            </div>

            <div className="border-b border-black border-dashed my-2"></div>

            <div className="flex justify-between font-bold text-lg my-2">
                <span>TOTAL</span>
                <span>{Number(data.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
            </div>

            <div className="border-b border-black border-dashed my-2"></div>

            <div className="text-center text-[10px] mt-4">
                <p>*** THANK YOU ***</p>
                <p>Save this receipt.</p>
            </div>
        </div>
    );
};
