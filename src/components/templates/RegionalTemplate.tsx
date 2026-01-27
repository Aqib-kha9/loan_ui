import React from "react";
import { CompanySettings } from "@/components/providers/settings-provider";
import { ReactTransliterate } from "react-transliterate";

interface ReceiptProps {
    data: any; // Relaxed type
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
        // Use ReactTransliterate for consistent Gujarati typing experience if desired, 
        // or standard input if this template is English. 
        // The voucher looked English in the previous view ("VOUCHER", "Paid to", etc).
        // Use standard input for now unless user asks for Gujarati here too.
        // Actually, let's stick to standard input for consistency with the *original* file I read,
        // BUT `RegionalDisbursal` uses `ReactTransliterate`.
        // The user asked "jo template main language likha hai wahi langauge likh jaye".
        // The Voucher was in ENGLISH (Step 292 shows "VOUCHER", "No.", "Date:", "Paid to :").
        // So I will keep it English/Standard Input.

        return multiline ? (
            <textarea
                value={value || ''}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className={`bg-blue-50/50 w-full outline-none resize-none px-1 overflow-hidden text-blue-900 border border-blue-200 rounded font-sans ${className}`}
                rows={1}
                style={{ height: '100%', minHeight: '3em' }}
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
        <div className={`text-sm leading-relaxed p-1 h-32 flex-1 ml-2 whitespace-pre-wrap ${className}`}>
            {value}
        </div>
    ) : (
        <div className={`font-medium text-sm flex-1 px-2 ${className}`}>
            {value}
        </div>
    );
};

export const RegionalTemplate = ({ data, company, mode = 'view', onChange }: ReceiptProps) => {

    const handleChange = (field: string, val: string) => {
        onChange?.(field, val);
    };

    return (
        <div className="w-[210mm] h-[297mm] bg-white text-black font-sans p-8 relative flex flex-col mx-auto box-border" style={{ printColorAdjust: 'exact' }}>
            {/* Outline Box */}
            <div className="border border-black h-full flex flex-col p-6 relative">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-4">
                    <div className="w-1/4 pt-2">
                        {company.logoUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={company.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
                        ) : (
                            <div className="h-16 w-16 bg-gray-100 flex items-center justify-center font-bold">{company.name}</div>
                        )}
                        <span className="text-xs font-bold text-orange-600 block mt-1">{company.name}</span>
                    </div>

                    <div className="flex-1 text-center pt-4">
                        <h1 className="text-4xl font-normal uppercase tracking-widest block">VOUCHER</h1>
                    </div>

                    <div className="w-1/4 text-right pt-8 text-sm font-bold">
                        <div className="mb-2 flex justify-end gap-2 items-center">
                            No. <div className="w-20"><EditableField mode={mode} value={data.voucherNo} onChange={(v) => handleChange('voucherNo', v)} placeholder="001" className="text-center" /></div>
                        </div>
                        <div className="flex justify-end gap-2 items-center">
                            Date: <div className="w-24"><EditableField mode={mode} value={data.dateOnly} onChange={(v) => handleChange('dateOnly', v)} placeholder="DD/MM/YYYY" className="text-center" /></div>
                        </div>
                    </div>
                </div>

                {/* Divider Line */}
                <div className="border-t border-black mb-4 mx-[-24px]"></div>

                {/* Main Body */}
                <div className="flex-1 flex flex-col relative">

                    {/* Top Fields */}
                    <div className="space-y-4 mb-6 pr-[210px]">
                        <div className="flex items-end">
                            <span className="font-bold w-[100px] text-sm">Paid to :</span>
                            <div className="flex-1">
                                <EditableField mode={mode} value={data.paidTo} onChange={(v) => handleChange('paidTo', v)} placeholder="Recipient Name" className="text-sm" />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <span className="font-bold w-[100px] text-sm">Debit:</span>
                            <div className="flex-1">
                                <EditableField mode={mode} value={data.debitAccount} onChange={(v) => handleChange('debitAccount', v)} placeholder="Account Name" className="text-sm" />
                            </div>
                        </div>
                        <div className="flex items-start mt-4">
                            <span className="font-bold w-[100px] text-sm pt-1">Particulars:</span>
                            <div className="flex-1 h-32">
                                <EditableField mode={mode} value={data.particulars} onChange={(v) => handleChange('particulars', v)} placeholder="Enter details..." multiline className="h-full" />
                            </div>
                        </div>
                    </div>

                    {/* Left Bottom Amount Field */}
                    <div className="mt-auto mb-[300px] flex items-end">
                        <span className="font-bold w-[100px] text-sm">Rupees:</span>
                        <div className="flex-1">
                            <EditableField mode={mode} value={data.amountInWords} onChange={(v) => handleChange('amountInWords', v)} placeholder="Amount in words" className="italic font-bold" />
                        </div>
                    </div>

                    {/* Right Side Table - Positioned Absolute */}
                    <div className="absolute right-0 top-0 w-[200px] h-[300px] border-l border-b border-t border-r border-black flex flex-col bg-white">
                        {/* Header */}
                        <div className="h-8 border-b border-black flex">
                            <div className="w-1/2 border-r border-black flex items-center justify-center font-bold text-xs bg-gray-50">Rupees</div>
                            <div className="w-1/2 flex items-center justify-center font-bold text-xs bg-gray-50">Ps</div>
                        </div>

                        {/* Editable Rows */}
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex-1 border-b border-black/50 flex">
                                <div className="w-1/2 border-r border-black h-full">
                                    <EditableField
                                        mode={mode}
                                        value={data[`tableRow${i}Rupees`]}
                                        onChange={(v) => handleChange(`tableRow${i}Rupees`, v)}
                                        className="text-center h-full border-none"
                                    />
                                </div>
                                <div className="w-1/2 h-full">
                                    <EditableField
                                        mode={mode}
                                        value={data[`tableRow${i}Ps`]}
                                        onChange={(v) => handleChange(`tableRow${i}Ps`, v)}
                                        className="text-center h-full border-none"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Total Row */}
                        <div className="h-8 flex">
                            <div className="w-1/2 border-r border-black flex items-center px-1 text-xs font-bold bg-gray-50/30">
                                <div className="w-full">
                                    <EditableField mode={mode} value={data.amount ? data.amount.toString() : ''} onChange={(v) => handleChange('amount', v)} placeholder="0.00" className="text-center" />
                                </div>
                            </div>
                            <div className="w-1/2 flex items-center justify-center text-xs font-bold bg-gray-50/30">
                                <div className="w-full h-full">
                                    <EditableField mode={mode} value={data.psAmount || '00'} onChange={(v) => handleChange('psAmount', v)} placeholder="00" className="text-center h-full border-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="absolute bottom-0 w-full">
                        <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-sm mb-4">
                            {/* Left Column */}
                            <div className="space-y-8">
                                <div className="flex items-center">
                                    <span className="w-[120px]">Authorised by:</span>
                                    <div className="flex-1">
                                        <EditableField mode={mode} value={data.authorisedBy} onChange={(v) => handleChange('authorisedBy', v)} placeholder="Name" />
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-[180px]">Paid Cash/Cheque drwan on:</span>
                                    <div className="flex-1">
                                        <EditableField mode={mode} value={data.bankName} onChange={(v) => handleChange('bankName', v)} placeholder="Bank Name / Cash" />
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-[100px]">Cheque No.:</span>
                                    <div className="flex-1">
                                        <EditableField mode={mode} value={data.chequeNo} onChange={(v) => handleChange('chequeNo', v)} placeholder="XXXXXX" className="font-mono" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-8 relative">
                                <div className="flex items-center">
                                    <span className="w-[80px]">Passes By:</span>
                                    <div className="flex-1">
                                        <EditableField mode={mode} value={data.passesBy} onChange={(v) => handleChange('passesBy', v)} placeholder="Name" />
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-[60px]">Dated:</span>
                                    <div className="flex-1">
                                        <EditableField mode={mode} value={data.dateOnly} onChange={(v) => handleChange('dateOnly', v)} placeholder="DD/MM/YYYY" />
                                    </div>
                                </div>
                                <div className="text-right pr-4 pt-24">
                                    <span className="text-xs font-bold border-t border-black px-4 pt-1">Receiver's Signature</span>
                                </div>

                                {/* Stamp */}
                                <div className="absolute top-24 right-20 w-[60px] h-[70px] border border-black flex items-center justify-center bg-red-50/30">
                                    <div className="text-[9px] text-center text-gray-400 leading-tight">Revenue<br />Stamp</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thumb Impressions - Bottom Overlay */}
                <div className="absolute bottom-8 left-0 w-full flex justify-center gap-32 pointer-events-none">
                    <div className="text-center">
                        <div className="font-bold text-blue-900 text-[10px] uppercase">Left Hand<br />Thumb</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-blue-900 text-[10px] uppercase">Right Hand<br />Thumb</div>
                    </div>
                </div>

            </div>
        </div>
    );
};
