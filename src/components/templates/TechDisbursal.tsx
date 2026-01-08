import React from 'react';
import { CompanySettings } from "@/components/providers/settings-provider";

interface DisbursementReceiptProps {
    data: {
        loanAccountNo: string;
        customerName: string;
        address?: string;
        mobile?: string;
        disbursedDate: string;
        loanAmount: number;
        interestRate: number;
        tenureMonths: number;
        emiAmount: number;
        processingFee: number;
        netDisbursal: number;
        loanScheme: string;
        interestPaidInAdvance?: boolean;
        firstMonthInterest?: number;
        paymentModes: { type: string, amount: string, reference: string }[];
    };
    company: CompanySettings;
}

export const TechDisbursal = React.forwardRef<HTMLDivElement, DisbursementReceiptProps>(({ data, company }, ref) => {
    return (
        <div ref={ref} className="w-[210mm] min-h-[297mm] bg-[#0a0a0a] text-[#00ff41] font-mono mx-auto shadow-2xl flex flex-col p-8 box-border relative overflow-hidden">
            {/* Scanline Effect Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>

            {/* Header */}
            <div className="border-b-2 border-[#00ff41] pb-4 mb-8 flex justify-between items-end relative z-20">
                <div className="flex gap-4 items-center">
                    {company.logoUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={company.logoUrl} alt="Logo" className="h-12 w-auto bg-[#00ff41] p-1 invert" />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold uppercase">{company.name}</h1>
                        <p className="text-xs opacity-70">SYO: DISBURSAL_MODULE_V1 // {company.tagline}</p>
                    </div>
                </div>
                <div className="text-right text-xs">
                    <p>DATE: {new Date(data.disbursedDate).toLocaleDateString('en-GB')}</p>
                    <p>REF: {data.loanAccountNo}</p>
                </div>
            </div>

            {/* User Block */}
            <div className="grid grid-cols-2 gap-4 mb-8 border border-[#00ff41] p-4 text-xs relative z-20 bg-[#00ff41]/5">
                <div>
                    <p className="opacity-50 text-[10px] mb-1">TARGET_ENTITY</p>
                    <p className="font-bold text-lg">{data.customerName}</p>
                    <p className="opacity-70">{data.address}</p>
                </div>
                <div className="text-right">
                    <p className="opacity-50 text-[10px] mb-1">LOAN_PARAMS</p>
                    <p>AMNT: {data.loanAmount}</p>
                    <p>RATE: {data.interestRate}%</p>
                    <p>TENURE: {data.tenureMonths}M</p>
                </div>
            </div>

            {/* CLI Table */}
            <div className="flex-1 relative z-20">
                <div className="border-b border-dashed border-[#00ff41] mb-2 opacity-50">--------------------------------------------------</div>
                <div className="flex justify-between mb-2 font-bold">
                    <span>COMPONENT</span>
                    <span>VALUE (INR)</span>
                </div>
                <div className="border-b border-dashed border-[#00ff41] mb-4 opacity-50">--------------------------------------------------</div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>[+] PRINCIPAL_AMOUNT</span>
                        <span>{data.loanAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                        <span>[-] PROCESSING_FEE</span>
                        <span>{data.processingFee.toFixed(2)}</span>
                    </div>
                    {data.interestPaidInAdvance && (
                        <div className="flex justify-between text-red-500">
                            <span>[-] ADVANCE_INTEREST</span>
                            <span>{data.firstMonthInterest?.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-lg mt-4 border-t border-[#00ff41] pt-2">
                        <span>[=] NET_DISBURSAL</span>
                        <span>{data.netDisbursal.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-8 border border-[#00ff41] p-2 text-xs opacity-80">
                    <p>PAYMENT_CHANNELS:</p>
                    {data.paymentModes.map((m, i) => (
                        <p key={i}>&gt; {m.type}: {m.amount} [{m.reference || 'NULL'}]</p>
                    ))}
                </div>

                <div className="mt-12 text-xs opacity-70">
                    &gt; AWAITING_SIGNATURE...
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto border-t border-[#00ff41] pt-4 text-center text-xs relative z-20">
                <div className="flex justify-between items-end mb-4">
                    <div className="text-left">
                        <p className="mb-8">x _________________</p>
                        <p>BORROWER_AUTH</p>
                    </div>
                    <div className="text-right">
                        {company.showSignatory && (
                            <>
                                {(() => {
                                    const fullText = company.signatoryText || "AUTHORIZED_KEY";
                                    const match = fullText.match(/^(authorized signatory)\s+(.+)$/i);
                                    if (match) {
                                        return (
                                            <div className="mb-4 text-[#00ff41] border border-[#00ff41] px-2 py-1 inline-block text-right">
                                                <p className="font-bold">{match[1]}</p>
                                                <p className="opacity-70 text-xs">{match[2]}</p>
                                            </div>
                                        );
                                    }
                                    return <p className="mb-4 text-[#00ff41] border border-[#00ff41] px-2 py-1 inline-block">{fullText}</p>;
                                })()}
                                <p>ISSUER_AUTH</p>
                            </>
                        )}
                    </div>
                </div>
                <div className="mt-4 text-[10px] opacity-60 space-y-1">
                    {company.showComputerGenerated && <p>&gt; SYS_MSG: {company.computerGeneratedText || "GENERATED_BY_CORE_SYSTEM"}</p>}
                    {company.showJurisdiction && <p>&gt; JURISDICTION: {company.jurisdictionText || "UNKNOWN_SECTOR"}</p>}
                </div>
                <p className="animate-pulse mt-4">_END_OF_TRANSACTION_</p>
            </div>
        </div>
    )
})

TechDisbursal.displayName = "TechDisbursal";
