import React from "react";
import { CompanySettings } from "@/components/providers/settings-provider";
import { MapPin } from "lucide-react";

interface ReceiptProps {
    data: any;
    company: CompanySettings;
    mode?: 'edit' | 'print' | 'view';
    onChange?: (field: string, value: string) => void;
}

const EditableField = ({
    mode,
    value,
    onChange,
    placeholder,
    className = "",
    multiline = false
}: {
    mode?: 'edit' | 'print' | 'view',
    value: string,
    onChange?: (val: string) => void,
    placeholder?: string,
    className?: string,
    multiline?: boolean
}) => {
    if (mode === 'edit') {
        return multiline ? (
            <textarea
                value={value || ''}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className={`bg-blue-50/50 w-full outline-none resize-none px-1 overflow-hidden text-blue-900 border border-blue-200 rounded font-sans ${className}`}
                rows={2}
                style={{ height: '100%', minHeight: '2em' }}
            />
        ) : (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className={`bg-blue-50/50 w-full outline-none text-blue-900 border-b border-blue-200 px-1 font-sans ${className}`}
            />
        );
    }
    // Print/View mode
    return multiline ? (
        <div className={`text-sm leading-tight px-1 flex-1 whitespace-pre-wrap ${className}`}>
            {value}
        </div>
    ) : (
        <div className={`font-medium text-sm flex-1 px-1 ${className}`}>
            {value}
        </div>
    );
};

export const PatniReceiptTemplate = ({ data, company, mode = 'view', onChange }: ReceiptProps) => {

    const handleChange = (field: string, val: string) => {
        onChange?.(field, val);
    };

    return (
        <div className="w-[210mm] h-[297mm] bg-white text-black font-sans p-8 pt-4 relative flex flex-col mx-auto box-border" style={{ printColorAdjust: 'exact' }}>
            {/* Header Section: Left (Titles) and Right (Logo) */}
            <div className="flex justify-between items-end mb-4">
                {/* Left Side: Title and Subtitle */}
                <div className="flex flex-col justify-end gap-2 pb-1">
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-bold">
                            {(company.name ? company.name.toUpperCase() : "COMPANY NAME")} DEPOSIT DATE :
                        </div>
                        <div className="w-[120px] border border-black px-2 pb-0.5 pt-1 text-center font-bold text-sm bg-gray-100">
                            <EditableField mode={mode} value={data.depositDateHeader} onChange={(v) => handleChange('depositDateHeader', v)} placeholder="DD-MM-YY" className="text-center font-bold bg-transparent" />
                        </div>
                    </div>
                    <div>
                        <span className="text-sm font-bold bg-gray-200/60 px-2 py-0.5 border-b border-gray-400 inline-block">
                            {(company.name ? company.name.toUpperCase() : "COMPANY")} DEPOSIT RECEIPT ( Non-Transferable )
                        </span>
                    </div>
                </div>

                {/* Right Side: Logo and Company Info */}
                <div className="flex flex-col items-end gap-1 text-right">
                    {company.logoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={company.logoUrl} alt="Company Logo" className="max-h-16 w-auto object-contain" />
                    ) : (
                        <div className="h-16 w-16 bg-gray-100 flex items-center justify-center font-bold rounded text-teal-700 text-2xl shrink-0">
                            {company.name ? company.name.charAt(0) : 'C'}
                        </div>
                    )}
                    <div className="flex flex-col items-end">
                        <h1 className="text-3xl font-bold tracking-tighter text-teal-700 italic leading-none">{company.name || "Company Name"}</h1>
                        <span className="text-[10px] uppercase text-gray-500 tracking-widest mt-1">{company.tagline || ""}</span>
                    </div>
                </div>
            </div>

            {/* Main Details Box */}
            <div className="border-[1.5px] border-black flex flex-col mt-2">

                <div className="flex border-b-[1.5px] border-black">
                    <div className="w-[200px] border-r border-black/30 px-2 py-1 text-sm font-semibold">Deposit Number:</div>
                    <div className="flex-1 px-2 py-1 font-bold">
                        <EditableField mode={mode} value={data.depositNumber} onChange={(v) => handleChange('depositNumber', v)} placeholder="1000252" />
                    </div>
                </div>

                <div className="flex border-b border-black/30">
                    <div className="w-[200px] border-r border-black/30 px-2 py-1 text-sm">
                        Received with thanks from<br />
                        Name:
                    </div>
                    <div className="flex-1 px-2 py-1 flex items-center">
                        <EditableField mode={mode} value={data.name} onChange={(v) => handleChange('name', v)} placeholder="PARUL PIYUSHBHAI PATNI" />
                    </div>
                </div>

                <div className="flex border-b border-black/30">
                    <div className="w-[200px] border-r border-black/30 px-2 py-1 text-sm">Second name :</div>
                    <div className="flex-1 px-2 py-1">
                        <EditableField mode={mode} value={data.secondName} onChange={(v) => handleChange('secondName', v)} placeholder="" />
                    </div>
                </div>

                <div className="flex border-b border-black/30 h-16">
                    <div className="w-[200px] border-r border-black/30 px-2 py-1 text-sm">Address:</div>
                    <div className="flex-1 px-2 py-1">
                        <EditableField mode={mode} value={data.address} onChange={(v) => handleChange('address', v)} placeholder="Address Details" multiline />
                    </div>
                </div>

                <div className="flex border-b border-black/30">
                    <div className="w-[200px] border-r border-black/30 px-2 py-1 text-sm">Mobile Number:</div>
                    <div className="flex-1 px-2 py-1">
                        <EditableField mode={mode} value={data.mobileNumber} onChange={(v) => handleChange('mobileNumber', v)} placeholder="9016920589" />
                    </div>
                </div>

                <div className="flex border-b border-black/30">
                    <div className="w-[200px] border-r border-black/30 px-2 py-1 text-sm">Email ID:</div>
                    <div className="flex-1 px-2 py-1">
                        <EditableField mode={mode} value={data.emailId} onChange={(v) => handleChange('emailId', v)} placeholder="" />
                    </div>
                </div>

                <div className="flex border-b border-black/30">
                    <div className="w-[200px] border-r border-black/30 px-2 py-1 text-sm">Customer ID:</div>
                    <div className="flex-1 px-2 py-1">
                        <EditableField mode={mode} value={data.customerId} onChange={(v) => handleChange('customerId', v)} placeholder="1000154" />
                    </div>
                </div>

                <div className="flex border-b border-black/30">
                    <div className="w-[200px] border-r border-black/30 px-2 py-1 text-sm">Scheme Type:</div>
                    <div className="flex-1 px-2 py-1 font-bold">
                        <EditableField mode={mode} value={data.schemeType} onChange={(v) => handleChange('schemeType', v)} placeholder="PMS" />
                    </div>
                </div>

                <div className="flex border-b border-black/30">
                    <div className="w-[200px] border-r border-black/30 px-2 py-1 text-sm">Interest Payment Frequesncy:</div>
                    <div className="flex-1 px-2 py-1 font-bold">
                        <EditableField mode={mode} value={data.interestPaymentFrequency} onChange={(v) => handleChange('interestPaymentFrequency', v)} placeholder="MONTHLY" className="uppercase" />
                    </div>
                </div>

                <div className="flex border-b border-black/30">
                    <div className="w-[200px] border-r border-black/30 px-2 py-1 text-sm">TDS Details:</div>
                    <div className="flex-1 px-2 py-1">
                        <EditableField mode={mode} value={data.tdsDetails} onChange={(v) => handleChange('tdsDetails', v)} placeholder="" />
                    </div>
                </div>

                <div className="flex border-b-[1.5px] border-black">
                    <div className="w-[200px] border-r border-black/30 px-2 py-1 text-sm font-semibold">First Interest Payout Date:</div>
                    <div className="flex-1 px-2 py-1 font-bold">
                        <EditableField mode={mode} value={data.firstInterestPayoutDate} onChange={(v) => handleChange('firstInterestPayoutDate', v)} placeholder="16-03-26" />
                    </div>
                </div>

                <div className="px-2 py-2 text-[11px] leading-tight text-gray-700 bg-gray-100/50">
                    Please note that all maturity & interest related information will be communicated on your registered contact details only. For Deposit receipt renewal request or assistance, please contact us.
                </div>

                {/* Inner Table */}
                <div className="flex border-t-[1.5px] border-black bg-gray-200/50 text-[13px] font-bold text-center">
                    <div className="flex-1 border-r border-black/50 py-1">Deposit Date</div>
                    <div className="flex-[1.5] border-r border-black/50 py-1">Deposit Amount</div>
                    <div className="flex-1 border-r border-black/50 py-1">Interest Amount</div>
                    <div className="flex-[1.2] py-1">Int. Payable Type</div>
                </div>
                <div className="flex border-t border-black/50 text-[13px] font-semibold text-center h-8 items-center bg-gray-100/30">
                    <div className="flex-1 border-r border-black/50 h-full flex items-center justify-center">
                        <EditableField mode={mode} value={data.tableDepositDate} onChange={(v) => handleChange('tableDepositDate', v)} placeholder="16-02-26" className="text-center font-bold" />
                    </div>
                    <div className="flex-[1.5] border-r border-black/50 h-full flex items-center justify-center">
                        <EditableField mode={mode} value={data.tableDepositAmount} onChange={(v) => handleChange('tableDepositAmount', v)} placeholder="5,00,000=00" className="text-center font-bold" />
                    </div>
                    <div className="flex-1 border-r border-black/50 h-full flex items-center justify-center">
                        <EditableField mode={mode} value={data.tableInterestAmount} onChange={(v) => handleChange('tableInterestAmount', v)} placeholder="2.00%" className="text-center font-bold" />
                    </div>
                    <div className="flex-[1.2] h-full flex items-center justify-center">
                        <EditableField mode={mode} value={data.tableIntPayableType} onChange={(v) => handleChange('tableIntPayableType', v)} placeholder="MONTHLY" className="text-center font-bold" />
                    </div>
                </div>

            </div>

            {/* Below Box Details */}
            <div className="mt-8 pl-4 space-y-4 flex-1">
                <div className="flex items-center text-sm font-bold">
                    <span className="w-[180px]">Rupees ( In words ) :</span>
                    <div className="flex-1 uppercase tracking-wide">
                        <EditableField mode={mode} value={data.rupeesInWords} onChange={(v) => handleChange('rupeesInWords', v)} placeholder="FIVE LAKH ONLY" />
                    </div>
                </div>

                <div className="mt-6 space-y-1.5 pt-4 text-[13px]">
                    <div className="flex items-center">
                        <span className="w-[180px]">Account Holder Name:</span>
                        <div className="flex-1 font-semibold uppercase">
                            <EditableField mode={mode} value={data.accountHolderName} onChange={(v) => handleChange('accountHolderName', v)} placeholder="PARUL PIYUSHBHAI PATNI" />
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="w-[180px]">Bank Name:</span>
                        <div className="flex-1 font-semibold uppercase">
                            <EditableField mode={mode} value={data.bankName} onChange={(v) => handleChange('bankName', v)} placeholder="UCO BANK" />
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="w-[180px]">Bank Account Number:</span>
                        <div className="flex-1 font-semibold">
                            <EditableField mode={mode} value={data.bankAccountNumber} onChange={(v) => handleChange('bankAccountNumber', v)} placeholder="*07480110029787" />
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="w-[180px]">IFSC:</span>
                        <div className="flex-1 font-semibold uppercase">
                            <EditableField mode={mode} value={data.ifsc} onChange={(v) => handleChange('ifsc', v)} placeholder="UCBA0000748" />
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="w-[180px]">cheque no:</span>
                        <div className="flex-1 font-semibold uppercase">
                            <EditableField mode={mode} value={data.chequeNo} onChange={(v) => handleChange('chequeNo', v)} placeholder="*000058" />
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="w-[180px]">Nominee:</span>
                        <div className="flex-1 font-semibold uppercase">
                            <EditableField mode={mode} value={data.nominee} onChange={(v) => handleChange('nominee', v)} placeholder="PIYUSHBHAI JAGDISHBHAI PATNI" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Rules & Contact */}
            <div className="mt-auto pt-6 text-[11px] leading-relaxed relative">
                <p className="mb-6 font-medium text-gray-800">
                    For any change in your registered mobile number and address, please write to us at <span className="font-bold">{company.email || "patni.finance10@gmail.com"}</span> with
                    your Fixed deposit number mentioned in the subject line and enclose a relevant proof with mail.
                </p>

                <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                        <p className="font-semibold text-[13px] mb-1">Write to us:</p>
                        <p className="flex"><span className="w-20">Email:</span> <span className="text-blue-600 underline font-semibold">{company.email || "patni.finance10@gmail.com"}</span></p>
                        <p className="flex"><span className="w-20">Call us:</span> <span className="font-bold">{company.mobile || "9723468218"}</span></p>
                        <p className="flex"><span className="w-20">Land line</span> <span className="font-bold">{company.website || "L.Line-2653594185"}</span></p>

                        <p className="mt-4 pt-4 text-[11px] text-gray-800 font-medium">This Receipt has been issued in terms and conditions with {company.name || "Patni Finance"}.</p>
                        <p className="text-[11px] text-gray-700">Reg.office: {company.address || "A-2/2, Tilak Park soc. Harni Road, Vadodara - 390022"}</p>
                    </div>

                    <div className="flex flex-col items-center justify-end mt-4 pr-8 relative">
                        {/* Stamp & Signature area */}
                        

                        <div className="font-bold mt-10 text-[11px] text-center">
                            AUTHORISED SIGNATORY<br />
                            {(company.name ? company.name.toUpperCase() : "PATNI FINANCE")} &amp; INVESTMENT
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};
