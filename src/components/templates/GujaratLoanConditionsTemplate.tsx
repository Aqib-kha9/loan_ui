import React from 'react';
import { CompanySettings } from "@/components/providers/settings-provider";
import { ReactTransliterate } from "react-transliterate";

interface LoanConditionsProps {
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

export const GujaratLoanConditionsTemplate = React.forwardRef<HTMLDivElement, LoanConditionsProps>(({ data, company, mode = 'view', onChange }, ref) => {

    const handleChange = (field: string, val: string) => {
        onChange?.(field, val);
    };

    return (
        <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-black font-serif px-10 py-8 relative flex flex-col mx-auto box-border" style={{ printColorAdjust: 'exact' }}>

            {/* Header Identifier */}
            <div className="text-center text-sm font-bold mb-1">
                નમૂનો ક્રમાંક ૧૧ ( નિયમ ૧૪ )
            </div>
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">લોનના શરતોના વિગતો દર્શાવતું પત્રક ( સ્ટેટમેન્ટ)</h1>
            </div>

            {/* Top Info Rows */}
            <div className="space-y-1 mb-4">
                <div className="flex items-end text-[15px]">
                    <span className="font-bold min-w-[100px]">બિલ નંબર :</span>
                    <div className="w-48 mr-auto">
                        <EditableField mode={mode} value={data.billNo} onChange={(v) => handleChange('billNo', v)} placeholder="નંબર" />
                    </div>
                    <span className="font-bold mr-2">રજીસ્ટ્રેશન નંબર:</span>
                    <div className="w-48 mr-auto">
                        <EditableField mode={mode} value={data.regNo} onChange={(v) => handleChange('regNo', v)} placeholder="રજી. નંબર" />
                    </div>
                    <span className="font-bold mr-2">તારીખ:</span>
                    <div className="w-32">
                        <EditableField mode={mode} value={data.headerDate} onChange={(v) => handleChange('headerDate', v)} placeholder="તારીખ" />
                    </div>
                </div>
            </div>

            {/* Numbered List Section */}
            <div className="space-y-3 mb-6">
                <div className="flex items-end">
                    <span className="font-bold min-w-[140px] text-[15px]">(૧) દેણદારનું નામ</span>
                    <div className="flex-1 ml-2">
                        <EditableField mode={mode} value={data.debtorName} onChange={(v) => handleChange('debtorName', v)} placeholder="દેણદારનું નામ" />
                    </div>
                </div>

                <div className="flex items-start">
                    <span className="font-bold min-w-[140px] text-[15px] mt-1">(૨) સરનામું</span>
                    <div className="flex-1 ml-2">
                        <EditableField mode={mode} value={data.debtorAddress} onChange={(v) => handleChange('debtorAddress', v)} placeholder="સરનામું" multiline />
                    </div>
                </div>

                <div className="flex items-end">
                    <span className="font-bold min-w-[140px] text-[15px]">(૩) લોન/વસ્તુની રકમ રૂ. :</span>
                    <div className="w-1/3 ml-2">
                        <EditableField mode={mode} value={data.loanAmount} onChange={(v) => handleChange('loanAmount', v)} placeholder="રકમ" />
                    </div>
                    <span className="font-bold mx-4">અંકે રૂપિયા:</span>
                    <div className="flex-1">
                        <EditableField mode={mode} value={data.loanAmountWords} onChange={(v) => handleChange('loanAmountWords', v)} placeholder="શબ્દોમાં" />
                    </div>
                </div>

                <div className="flex items-start">
                    <span className="font-bold min-w-[140px] text-[15px] mt-1">(૪) લોનનો પ્રકાર:</span>
                    <div className="flex-1 ml-2">
                        <div className="text-[13px] leading-tight mb-2 font-medium">ખેતી વિષયક લોન, ઔદ્યોગિક, વેપારી લોન, અંગત લોન કે પરચુરણ લોન</div>
                        <EditableField mode={mode} value={data.loanType} onChange={(v) => handleChange('loanType', v)} placeholder="લોનનો પ્રકાર" />
                    </div>
                </div>

                <div className="flex items-end">
                    <span className="font-bold min-w-[280px] text-[15px]">(૫) લોન પકવાની તારીખ જો કોઈ હોય તો તે:</span>
                    <div className="flex-1 ml-2">
                        <EditableField mode={mode} value={data.dueDate} onChange={(v) => handleChange('dueDate', v)} placeholder="તારીખ" />
                    </div>
                </div>

                <div className="flex items-end">
                    <span className="font-bold min-w-[170px] text-[15px]">(૬) વ્યાજનો દર વાર્ષિક:</span>
                    <div className="flex-1 ml-2">
                        <EditableField mode={mode} value={data.interestRate} onChange={(v) => handleChange('interestRate', v)} placeholder="દર (%)" />
                    </div>
                </div>

                <div className="flex items-end">
                    <span className="font-bold min-w-[280px] text-[15px]">(૭) જામીનગીરોનો પ્રકાર (વજન અંદાજેલી કિંમત વગેરે) :</span>
                    <div className="flex-1 ml-2">
                        <EditableField mode={mode} value={data.securityInfo} onChange={(v) => handleChange('securityInfo', v)} placeholder="જામીનગીરી વિગત" />
                    </div>
                </div>

                <div className="flex items-end">
                    <span className="font-bold min-w-[210px] text-[15px]">(૮) નાણાં ધીરનાર કરનારનું નામ:</span>
                    <div className="flex-1 ml-2">
                        <EditableField mode={mode} value={data.lenderName || company.name} onChange={(v) => handleChange('lenderName', v)} placeholder="નામ" />
                    </div>
                </div>

                <div className="flex items-start">
                    <span className="font-bold min-w-[100px] text-[15px] mt-1">સરનામું:</span>
                    <div className="flex-1 ml-2">
                        <EditableField mode={mode} value={data.lenderAddress || company.address} onChange={(v) => handleChange('lenderAddress', v)} placeholder="સરનામું" multiline />
                    </div>
                </div>

                <div className="flex items-end space-x-8">
                    <div className="flex items-end flex-1 text-[15px]">
                        <span className="font-bold mr-2">(૯) તારીખ:</span>
                        <div className="flex-1">
                            <EditableField mode={mode} value={data.footerDate} onChange={(v) => handleChange('footerDate', v)} placeholder="તારીખ" />
                        </div>
                    </div>
                    <div className="flex items-end flex-1 text-[15px]">
                        <span className="font-bold mr-2">સ્થળ:</span>
                        <div className="flex-1">
                            <EditableField mode={mode} value={data.place || company.address?.split(',').pop()?.trim()} onChange={(v) => handleChange('place', v)} placeholder="સ્થળ" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Blank Signature Space or Custom Content */}
            <div className="h-24 border border-gray-100 mb-8 rounded-sm">
                <EditableField mode={mode} value={data.customSpace} onChange={(v) => handleChange('customSpace', v)} placeholder="વધારાની નોંધ માટે જગ્યા" noBorder multiline className="h-full" />
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-start mb-10 text-[14px]">
                <div className="w-1/2 text-center font-bold border-t border-black pt-2 mx-8">
                    દેણદારની સહી અથવા અંગૂઠાનું નિશાન
                </div>
                <div className="w-1/2 text-center font-bold border-t border-black pt-2 mx-8">
                    નાણાં ધીરનાર કરનારની સહી
                </div>
            </div>

            {/* Footer Notes (Terms & Conditions) */}
            <div className="border border-black p-4 text-[11px] leading-relaxed">
                <p className="font-bold mb-2">નોંધ: દરેક લોનની લેવડદેવડના સંબંધમાં જુદું પત્રક પૂરું પાડવું. લોન વસ્તુના રૂપમાં ધીરી હોય તો ધીરેલી વસ્તુની લેવડ દેવડની તારીખે સદર હું વસ્તુની બજાર કિંમત સહિત ઉલ્લેખ થવો જોઈએ.</p>

                <div className="grid grid-cols-1 gap-1">
                    <p>(૧) ખેતી વિષયક લોન એટલે પાકના ઉત્પાદન માટે, વાવેતર માટે, ખેતી સાથે સંકળાયેલ હોય તેવા બીજા હેતુઓ માટે ધીરેલ લોન. (૨) ઔદ્યોગિક લોન એટલે માલ બનાવવાના હેતુ સારૂ ધીરેલી લોન.</p>
                    <p>(૩) વેપારી લોન એટલે વેપાર માટે એટલે માલ અથવા બીજી જંગમ અથવા સ્થાવર મિલકત ખરીદવા અને વેચવા માટે ધીરેલી લોન (૪) અંગત લોન એટલે કે જૂના દેવા ભરપાઈ કરવા, લગ્નવિધિ, ધાર્મિક ક્રિયા, અંગત જરૂરિયાતો વિગેરે માટે ધીરેલ લોન (૫) સાનગીરો લોન એટલે કે કબજાવગરના વાહનો અને માલસામાન સામે ધીરેલ લોન. (૬) પરચુરણ લોનમાં (૧) થી (૫) માં નહીં આવતા હેતુ માટે ધીરેલ લોનનો સમાવેશ થાય છે.</p>
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

GujaratLoanConditionsTemplate.displayName = "GujaratLoanConditionsTemplate";
