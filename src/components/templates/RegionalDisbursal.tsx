import React from 'react';
import { CompanySettings } from "@/components/providers/settings-provider";

interface DisbursementReceiptProps {
    data: any;
    company: CompanySettings;
    mode?: 'edit' | 'print' | 'view';
    onChange?: (field: string, value: string) => void;
}

import { ReactTransliterate } from "react-transliterate";

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
        const commonProps = {
            value: value || '',
            onChangeText: (text: string) => onChange?.(text),
            lang: "gu" as const,
            placeholder: placeholder,
            className: className, // This might apply to container or input, need to check. Default puts it on container.
            // But we need to style the INPUT. ReactTransliterate supports `containerClassName`.
            // And `renderComponent` to style the input.
        };

        return (
            <ReactTransliterate
                value={value || ''}
                onChangeText={(text) => onChange?.(text)}
                lang="gu"
                placeholder={placeholder}
                containerClassName="w-full"
                renderComponent={(props) => multiline ? (
                    <textarea
                        {...props}
                        className={`bg-blue-50/50 w-full outline-none resize-none overflow-hidden text-blue-900 border-b border-blue-200 px-1 font-serif ${className}`}
                        rows={1}
                        style={{ minHeight: '1.5em' }}
                    />
                ) : (
                    <input
                        {...props}
                        className={`bg-blue-50/50 w-full outline-none text-blue-900 border-b border-blue-200 px-1 font-serif ${className}`}
                    />
                )}
            />
        );
    }
    // Print/View mode
    return (
        <div className={`border-b border-black w-full min-h-[1.5em] px-2 font-bold font-serif ${className}`}>
            {value}
        </div>
    );
};

export const RegionalDisbursal = React.forwardRef<HTMLDivElement, DisbursementReceiptProps>(({ data, company, mode = 'view', onChange }, ref) => {

    const handleChange = (field: string, val: string) => {
        onChange?.(field, val);
    };

    return (
        <div ref={ref} className="w-[210mm] h-[297mm] bg-white text-black font-serif px-12 py-8 relative flex flex-col mx-auto box-border" style={{ printColorAdjust: 'exact' }}>

            {/* Header: Logos and Title */}
            <div className="flex justify-between items-center mb-8 h-20">
                <div className="w-32 flex flex-col items-center">
                    {company.logoUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={company.logoUrl} alt="Logo" className="h-12 w-auto object-contain mb-1" />
                    )}
                    <span className="text-[10px] font-bold text-orange-600">{company.name}</span>
                </div>

                <div className="border-2 border-black px-8 py-2 bg-gray-100/50">
                    <h1 className="text-3xl font-extrabold tracking-wide">પ્રોમીસરી નોટ</h1>
                </div>

                <div className="w-32 flex flex-col items-center">
                    {company.logoUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={company.logoUrl} alt="Logo" className="h-12 w-auto object-contain mb-1" />
                    )}
                    <span className="text-[10px] font-bold text-orange-600">{company.name}</span>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 text-base leading-loose space-y-5">

                {/* Borrower Section */}
                <div className="space-y-4">
                    <div className="flex items-end">
                        <span className="font-bold min-w-[100px]">લખી લેનાર :</span>
                        <div className="flex-1">
                            <EditableField mode={mode} value={data.borrowerName} onChange={(v) => handleChange('borrowerName', v)} placeholder="નામ" />
                        </div>
                    </div>
                    <div className="flex items-end gap-4">
                        <div className="flex items-end w-[30%]">
                            <span className="font-bold min-w-[40px]">જાતે:</span>
                            <div className="flex-1">
                                <EditableField mode={mode} value={data.borrowerReligion} onChange={(v) => handleChange('borrowerReligion', v)} className="text-sm" placeholder="જાતિ" />
                            </div>
                        </div>
                        <div className="flex items-end w-[35%]">
                            <span className="font-bold min-w-[80px]">ઉમર આશરે:</span>
                            <div className="flex-1">
                                <EditableField mode={mode} value={data.borrowerAge} onChange={(v) => handleChange('borrowerAge', v)} placeholder="ઉંમર" />
                            </div>
                        </div>
                        <div className="flex items-end w-[35%]">
                            <span className="font-bold min-w-[40px]">ધંધો:</span>
                            <div className="flex-1">
                                <EditableField mode={mode} value={data.borrowerBusiness} onChange={(v) => handleChange('borrowerBusiness', v)} placeholder="વ્યવસાય" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-end">
                        <span className="font-bold min-w-[80px]">રહેવાસી :</span>
                        <div className="flex-1">
                            <EditableField mode={mode} value={data.borrowerAddress} onChange={(v) => handleChange('borrowerAddress', v)} placeholder="સરનામું" multiline />
                        </div>
                    </div>
                </div>

                {/* Lender Section */}
                <div className="space-y-4 mt-8">
                    <div className="flex items-end">
                        <span className="font-bold min-w-[100px]">લખી આપનાર:</span>
                        <div className="flex-1">
                            <EditableField mode={mode} value={data.lenderName} onChange={(v) => handleChange('lenderName', v)} placeholder="નામ" />
                        </div>
                    </div>
                    <div className="flex items-end gap-4">
                        <div className="flex items-end w-[30%]">
                            <span className="font-bold min-w-[40px]">જાતે:</span>
                            <div className="flex-1">
                                <EditableField mode={mode} value={data.lenderReligion} onChange={(v) => handleChange('lenderReligion', v)} placeholder="જાતિ" className="text-sm" />
                            </div>
                        </div>
                        <div className="flex items-end w-[35%]">
                            <span className="font-bold min-w-[80px]">ઉમર આશરે:</span>
                            <div className="flex-1">
                                <EditableField mode={mode} value={data.lenderAge} onChange={(v) => handleChange('lenderAge', v)} placeholder="ઉંમર" />
                            </div>
                        </div>
                        <div className="flex items-end w-[35%]">
                            <span className="font-bold min-w-[40px]">ધંધો:</span>
                            <div className="flex-1">
                                <EditableField mode={mode} value={data.lenderBusiness} onChange={(v) => handleChange('lenderBusiness', v)} placeholder="વ્યવસાય" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-end">
                        <span className="font-bold min-w-[80px]">રહેવાસી :</span>
                        <div className="flex-1">
                            <EditableField mode={mode} value={data.lenderAddress} onChange={(v) => handleChange('lenderAddress', v)} placeholder="સરનામું" multiline />
                        </div>
                    </div>
                </div>

                {/* Loan Details Text */}
                <div className="pt-8 space-y-6">
                    <div className="flex items-end">
                        <span className="font-bold mr-2 whitespace-nowrap">જત આજ રોજ અમોએ તમારી પાસેથી રૂ.</span>
                        <div className="flex-1 min-w-[200px]">
                            <EditableField mode={mode} value={data.loanAmountText} onChange={(v) => handleChange('loanAmountText', v)} placeholder="રકમ" className="text-lg" />
                        </div>
                    </div>

                    <div className="flex items-end w-full">
                        <span className="font-bold mr-2 whitespace-nowrap">અંકે રૂપિયા:</span>
                        <div className="flex-1">
                            <EditableField mode={mode} value={data.amountInWords} onChange={(v) => handleChange('amountInWords', v)} placeholder="અંકે રૂપિયા" className="italic" />
                        </div>
                        <span className="font-bold ml-2 whitespace-nowrap">રોકડા ધિરાણ પેટે લીધા છે.</span>
                    </div>

                    <p className="font-medium mt-4 leading-loose text-justify">
                        એ રૂપિયા તમે જ્યારે અને જ્યાં માંગો ત્યારે આપીએ તેની આ પ્રોમીસરી નોટ અમો તમને લખી આપી છે.
                    </p>

                    <div className="flex justify-between mt-12 pr-12">
                        <div className="flex items-end gap-2 w-1/2">
                            <span>સં ૨૦</span>
                            <div className="w-16">
                                <EditableField mode={mode} value={data.vikramSamvatYear} onChange={(v) => handleChange('vikramSamvatYear', v)} placeholder="વર્ષ" className="text-center" />
                            </div>
                            <span>ના</span>
                            <div className="w-24">
                                <EditableField mode={mode} value={data.gujaratiMonth} onChange={(v) => handleChange('gujaratiMonth', v)} placeholder="મહિનો" className="text-center" />
                            </div>
                            <span>ને</span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between pt-6 pr-4">
                        <div className="flex items-end gap-2">
                            <span>વાર:</span>
                            <div className="w-32">
                                <EditableField mode={mode} value={data.dayOfWeek} onChange={(v) => handleChange('dayOfWeek', v)} placeholder="વાર" className="text-center" />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span>તા.</span>
                            <div className="w-24">
                                <EditableField mode={mode} value={data.dateOnly} onChange={(v) => handleChange('dateOnly', v)} placeholder="તારીખ" className="text-center" />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span>માહે:</span>
                            <div className="w-24">
                                <EditableField mode={mode} value={data.monthOnly} onChange={(v) => handleChange('monthOnly', v)} placeholder="મહિનો" className="text-center" />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span>સને ૨૦</span>
                            <div className="w-16">
                                <EditableField mode={mode} value={data.yearOnly} onChange={(v) => handleChange('yearOnly', v)} placeholder="વર્ષ" className="text-center" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Images/Signatures */}
            <div className="mt-8 h-[250px] relative">
                {/* Photo Box */}
                <div className="absolute left-10 top-0 w-[110px] h-[130px] border border-black flex flex-col items-center justify-center bg-gray-50/50 overflow-hidden relative group">
                    {data.borrowerPhoto ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={data.borrowerPhoto} alt="Borrower" className="w-full h-full object-cover" />
                            {mode === 'edit' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleChange('borrowerPhoto', '');
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove Photo"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            )}
                        </>
                    ) : (
                        mode === 'edit' ? (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <span className="text-xs text-gray-500 font-bold text-center px-1">Click to<br />Upload Photo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                handleChange('borrowerPhoto', reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                        ) : (
                            <span className="text-xs text-gray-300">Photo</span>
                        )
                    )}
                </div>

                {/* Amount Box */}
                <div className="absolute left-0 top-[140px] border border-black w-[150px] h-[45px] flex items-center">
                    <div className="w-[40px] h-full border-r border-black flex items-center justify-center text-2xl font-bold bg-gray-100">
                        ₹
                    </div>
                    <div className="flex-1 h-full flex items-center justify-center text-xl font-bold">
                        <EditableField mode={mode} value={data.loanAmountBox} onChange={(v) => handleChange('loanAmountBox', v)} placeholder="0000" className="text-center font-bold text-xl h-full border-none" />
                    </div>
                </div>

                {/* Revenue Stamp */}
                <div className="absolute right-12 top-[80px] w-[90px] h-[100px] border border-black flex flex-col pt-1">
                    <div className="h-[60%] border-b border-black border-dashed flex items-center justify-center bg-gray-50">
                        <div className="text-[10px] text-center text-gray-400">Revenue<br />Stamp</div>
                    </div>
                    <div className="h-[40%] flex items-end justify-center pb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider transform -rotate-12 translate-y-4 -translate-x-4">Sign</span>
                    </div>
                </div>

                {/* Thumb Impressions */}
                <div className="absolute bottom-0 w-full flex justify-center gap-32 pl-12">
                    <div className="text-center relative">
                        {/* Thumb Placeholder */}

                        <div className="font-bold text-blue-900 uppercase text-sm tracking-wide">Left Hand<br />Thumb</div>
                    </div>
                    <div className="text-center relative">
                        {/* Thumb Placeholder */}

                        <div className="font-bold text-blue-900 uppercase text-sm tracking-wide">Right Hand<br />Thumb</div>
                    </div>
                </div>
            </div>

        </div>
    );
});

RegionalDisbursal.displayName = "RegionalDisbursal";
