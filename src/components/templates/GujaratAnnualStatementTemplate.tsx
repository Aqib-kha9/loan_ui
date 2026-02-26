import React from 'react';
import { CompanySettings } from "@/components/providers/settings-provider";
import { ReactTransliterate } from "react-transliterate";

interface AnnualStatementProps {
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
    multiline = false,
    noBorder = false
}: {
    mode?: 'edit' | 'print' | 'view',
    value: string,
    onChange?: (val: string) => void,
    placeholder?: string,
    className?: string,
    multiline?: boolean,
    noBorder?: boolean
}) => {
    if (mode === 'edit') {
        return (
            <ReactTransliterate
                value={value || ''}
                onChangeText={(text) => onChange?.(text)}
                lang="gu"
                placeholder={placeholder}
                containerClassName="w-full h-full"
                renderComponent={(props) => multiline ? (
                    <textarea
                        {...props}
                        className={`bg-blue-50/50 w-full outline-none resize-none overflow-hidden text-blue-900 px-1 font-serif ${noBorder ? '' : 'border-b border-blue-200'} ${className}`}
                        rows={1}
                        style={{ minHeight: '1.2em' }}
                    />
                ) : (
                    <input
                        {...props}
                        className={`bg-blue-50/50 w-full h-full outline-none text-blue-900 px-1 font-serif ${noBorder ? '' : 'border-b border-blue-200'} ${className}`}
                    />
                )}
            />
        );
    }
    return (
        <div className={`w-full min-h-[1.2em] px-1 font-bold font-serif whitespace-pre-wrap ${noBorder ? '' : 'border-b border-black'} ${className}`}>
            {value}
        </div>
    );
};

export const GujaratAnnualStatementTemplate = React.forwardRef<HTMLDivElement, AnnualStatementProps>(({ data, company, mode = 'view', onChange }, ref) => {

    const handleChange = (field: string, val: string) => {
        onChange?.(field, val);
    };

    return (
        <div ref={ref} className="w-[210mm] h-[297mm] bg-white text-black font-serif px-10 py-8 relative flex flex-col mx-auto box-border" style={{ printColorAdjust: 'exact' }}>

            {/* Form Identifier */}
            <div className="text-center text-sm font-bold mb-1">
                નમુનો . ૧૫ (નિયમ ૧૫ )
            </div>

            {/* Title */}
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">વર્ષના અંતનું હિસાબનું લેવડ-દેવડનું વાર્ષિક પત્રક</h1>
            </div>

            {/* Header Info */}
            <div className="space-y-2 mb-4">
                <div className="flex justify-between items-end">
                    <div className="flex items-end flex-1 mr-4">
                        <span className="font-bold whitespace-nowrap">નાણાં ધીરધારનું નામ :</span>
                        <div className="flex-1 ml-2">
                            <EditableField mode={mode} value={data.lenderName || company.name} onChange={(v) => handleChange('lenderName', v)} placeholder="નામ" />
                        </div>
                    </div>
                    <div className="flex items-end w-40">
                        <span className="font-bold">તારીખ:</span>
                        <div className="flex-1 ml-2">
                            <EditableField mode={mode} value={data.headerDate} onChange={(v) => handleChange('headerDate', v)} placeholder="તારીખ" />
                        </div>
                    </div>
                </div>

                <div className="flex items-end">
                    <span className="font-bold">સરનામું:</span>
                    <div className="flex-1 ml-2">
                        <EditableField mode={mode} value={data.lenderAddress || company.address} onChange={(v) => handleChange('lenderAddress', v)} placeholder="સરનામું" multiline />
                    </div>
                </div>

                <div className="flex items-end">
                    <span className="font-bold">રજીસ્ટ્રેશન પ્રમાણપત્ર નંબર :</span>
                    <div className="flex-1 ml-2">
                        <EditableField mode={mode} value={data.registrationNo} onChange={(v) => handleChange('registrationNo', v)} placeholder="રજીસ્ટ્રેશન નંબર" />
                    </div>
                </div>
            </div>

            {/* Debtor Details Section */}
            <div className="border border-black mb-4">
                <div className="flex border-b border-black min-h-[8mm] items-center">
                    <div className="w-8 border-r border-black font-bold flex justify-center h-full items-center">૧</div>
                    <div className="flex-1 flex px-2 py-1 items-center">
                        <span className="font-bold mr-2">દેણદારનું નામ :</span>
                        <div className="flex-1">
                            <EditableField mode={mode} value={data.debtorName} onChange={(v) => handleChange('debtorName', v)} placeholder="દેણદારનું નામ" noBorder />
                        </div>
                    </div>
                </div>
                <div className="flex border-b border-black min-h-[8mm] items-center">
                    <div className="w-8 border-r border-black font-bold flex justify-center h-full items-center">૨</div>
                    <div className="flex-1 flex px-2 py-1 items-center">
                        <span className="font-bold mr-2">ધંધો:</span>
                        <div className="flex-1">
                            <EditableField mode={mode} value={data.debtorBusiness} onChange={(v) => handleChange('debtorBusiness', v)} placeholder="ધંધો" noBorder />
                        </div>
                    </div>
                </div>
                <div className="flex border-b border-black min-h-[8mm] items-center">
                    <div className="w-8 border-r border-black font-bold flex justify-center h-full items-center">૩</div>
                    <div className="flex-1 flex px-2 py-1 items-center">
                        <span className="font-bold mr-2">સરનામું :</span>
                        <div className="flex-1">
                            <EditableField mode={mode} value={data.debtorAddress} onChange={(v) => handleChange('debtorAddress', v)} placeholder="સરનામું" noBorder multiline />
                        </div>
                    </div>
                </div>
                <div className="flex border-b border-black min-h-[8mm] items-center">
                    <div className="w-8 border-r border-black font-bold flex justify-center h-full items-center">૪</div>
                    <div className="flex-1 flex px-2 py-1 items-center">
                        <span className="font-bold mr-2">દેણદાર ક્યાં વર્ગનો છે : (GEN/SC/ST/OBC:) :</span>
                        <div className="flex-1">
                            <EditableField mode={mode} value={data.debtorCategory} onChange={(v) => handleChange('debtorCategory', v)} placeholder="વર્ગ" noBorder />
                        </div>
                    </div>
                </div>
                <div className="flex min-h-[10mm] items-stretch">
                    <div className="w-8 border-r border-black font-bold flex justify-center items-center shrink-0">૫</div>
                    <div className="flex-1 flex border-r border-black px-2 py-1 items-center">
                        <span className="font-bold mr-2">ખાતાવહીનો ખાતા નંબર :</span>
                        <div className="flex-1 h-full">
                            <EditableField mode={mode} value={data.ledgerAccountNo} onChange={(v) => handleChange('ledgerAccountNo', v)} placeholder="ખાતા નંબર" noBorder className="h-full mt-1" />
                        </div>
                    </div>
                    <div className="w-[30mm] border-r border-black flex flex-col items-center">
                        <div className="border-b border-black w-full text-center text-xs font-bold py-0.5">મુદ્રલ</div>
                        <div className="flex-1 w-full">
                            <EditableField mode={mode} value={data.principalHeader} onChange={(v) => handleChange('principalHeader', v)} noBorder className="text-center h-full" />
                        </div>
                    </div>
                    <div className="w-[30mm] border-r border-black flex flex-col items-center">
                        <div className="border-b border-black w-full text-center text-xs font-bold py-0.5">વ્યાજ</div>
                        <div className="flex-1 w-full">
                            <EditableField mode={mode} value={data.interestHeader} onChange={(v) => handleChange('interestHeader', v)} noBorder className="text-center h-full" />
                        </div>
                    </div>
                    <div className="w-[30mm] flex flex-col items-center">
                        <div className="border-b border-black w-full text-center text-xs font-bold py-0.5">ખર્ચના</div>
                        <div className="flex-1 w-full">
                            <EditableField mode={mode} value={data.expensesHeader} onChange={(v) => handleChange('expensesHeader', v)} noBorder className="text-center h-full" />
                        </div>
                    </div>
                </div>

                {/* Main Table Content */}
                {[6, 7, 8, 9, 10].map((num) => (
                    <div key={num} className="flex border-t border-black min-h-[14mm] items-stretch overflow-hidden">
                        <div className="w-8 border-r border-black font-bold flex justify-center items-center shrink-0">{num}</div>
                        <div className="flex-1 border-r border-black px-2 py-1 flex items-center text-[13px] leading-tight font-medium">
                            {num === 6 && "વર્ષની શરૂઆતમાં શાહુકારી લેણી નીકળતી મુદ્રલની રકમ વ્યાજની રકમ અને કરેલા ખર્ચની રકમ:"}
                            {num === 7 && "વર્ષ દરમિયાન આપેલા લોનની કુલ રકમ"}
                            {num === 8 && "વર્ષ દરમિયાન પરત ચૂકવાયેલ નાણાંની કુલ રકમ :"}
                            {num === 9 && "વર્ષને અંતે લેણી થતી મુદ્રલની અને વ્યાજની રકમ:"}
                            {num === 10 && "ગીરો, આડગીરો અથવા જામીનગીરી તરીકે રાખેલી ચીજને જ્યાં રાખવામાં આવી હોય તે સ્થળની વિગતો:"}
                        </div>
                        <div className="w-[30mm] border-r border-black flex items-center justify-center">
                            <EditableField mode={mode} value={data[`row_${num}_principal`]} onChange={(v) => handleChange(`row_${num}_principal`, v)} noBorder className="text-center h-full" />
                        </div>
                        <div className="w-[30mm] border-r border-black flex items-center justify-center">
                            <EditableField mode={mode} value={data[`row_${num}_interest`]} onChange={(v) => handleChange(`row_${num}_interest`, v)} noBorder className="text-center h-full" />
                        </div>
                        <div className="w-[30mm] flex items-center justify-center">
                            <EditableField mode={mode} value={data[`row_${num}_expenses`]} onChange={(v) => handleChange(`row_${num}_expenses`, v)} noBorder className="text-center h-full" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Section */}
            <div className="mt-8 flex flex-col">
                <div className="flex items-end mb-16 w-1/3">
                    <span className="font-bold mr-2">તારીખ:</span>
                    <div className="flex-1">
                        <EditableField mode={mode} value={data.footerDate} onChange={(v) => handleChange('footerDate', v)} placeholder="તારીખ" />
                    </div>
                </div>

                <div className="flex justify-between items-start pt-10">
                    <div className="w-1/2 text-center text-sm font-bold border-t border-black pt-2 mx-4">
                        દેણદારની સહી અથવા અંગૂઠાનું નિશાન
                    </div>
                    <div className="w-1/2 text-center text-sm font-bold border-t border-black pt-2 mx-4">
                        નાણાં ધીરનાર અથવા તેના અભિકર્તાની સહી
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @page { size: A4; margin: 10mm; }
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                }
            `}} />
        </div>
    );
});

GujaratAnnualStatementTemplate.displayName = "GujaratAnnualStatementTemplate";
