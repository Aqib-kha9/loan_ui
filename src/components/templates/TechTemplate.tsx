import React from "react";
import { format } from "date-fns";
import { CompanySettings } from "@/components/providers/settings-provider";

interface ReceiptProps {
    data: any;
    company: CompanySettings;
}

export const TechTemplate = ({ data, company }: ReceiptProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-[#0a0a0a] text-[#00ff41] font-mono mx-auto shadow-2xl flex flex-col p-12 box-border relative overflow-hidden">

            {/* Matrix Grid Background */}
            <div className="absolute inset-0 z-0 opacity-10"
                style={{ backgroundImage: 'linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="relative z-10 border-2 border-[#00ff41] h-full p-8 flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-[#00ff41] pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2 glitch-text">{company.name}</h1>
                        <p className="text-xs uppercase">[ SYSTEM: ONLINE ]</p>

                    </div>
                    <div className="text-right">
                        <div className="border border-[#00ff41] px-4 py-2 text-xs">
                            <p>STATUS: CONFIRMED</p>
                            <p>PROTOCOL: SECURE</p>
                        </div>
                    </div>
                </div>

                {/* Binary Bar */}
                <div className="w-full overflow-hidden text-[10px] opacity-50 mb-12 break-all">
                    0101010101010010101010101110101010101010101001010101010101010101010010101010...
                </div>

                {/* Main Data */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <p className="text-xs border-b border-[#00ff41] w-24 mb-2">PAYER_ID</p>
                        <p className="text-2xl font-bold">{data.customerName}</p>
                        <p className="text-sm opacity-70">ACC: {data.loanAccountNo}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs border-b border-[#00ff41] w-24 ml-auto mb-2">TIMESTAMP</p>
                        <p className="text-xl">{format(new Date(), "yyyy-MM-dd")}</p>
                        <p className="text-xl">{format(new Date(), "HH:mm:ss")}</p>
                    </div>
                </div>

                {/* Amount Box */}
                <div className="border-4 border-[#00ff41] p-8 text-center mb-12 bg-[#00ff41]/10">
                    <p className="text-xs mb-2">Run_Process: Payment_Collection</p>
                    <p className="text-6xl font-bold tracking-widest">{Number(data.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                </div>

                {/* Console Details */}
                <div className="flex-1 bg-black/50 p-4 border border-[#00ff41]/50 text-sm">
                    <p>{`> Initializing transaction... OK`}</p>
                    <p>{`> Verify Loan ID: ${data.loanAccountNo}... MATCH`}</p>
                    <p>{`> Processing Amount... COMPLETE`}</p>
                    <p>{`> Generating Hash... x78y9z`}</p>
                    <p className="animate-pulse mt-4">{`> WAITING FOR NEXT COMMAND_`}</p>
                </div>

                <div className="mt-8 text-center text-xs opacity-70">
                    <p>{company.address}</p>
                    <p>{company.email}</p>
                </div>

            </div>
        </div>
    );
};
