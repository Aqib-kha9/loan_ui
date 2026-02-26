import React from 'react';
import { CompanySettings } from "@/components/providers/settings-provider";
import { ReactTransliterate } from "react-transliterate";

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

export const GujaratReceiptTemplate = React.forwardRef<HTMLDivElement, ReceiptProps>(({ data, company, mode = 'view', onChange }, ref) => {

    const handleChange = (field: string, val: string) => {
        onChange?.(field, val);
    };

    return (
        <div ref={ref} className="w-[210mm] h-[148.5mm] bg-white text-black font-serif px-10 py-8 relative flex flex-col mx-auto box-border border-b border-dashed border-gray-400" style={{ printColorAdjust: 'exact' }}>

            {/* Header Identifier */}
            <div className="text-center text-xl font-bold mb-1">
                નમુનો નં. ૧૨-૧૩
            </div>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-end text-sm">
                    <span className="font-bold mr-2">અનુક્રમ ન.</span>
                    <div className="w-24">
                        <EditableField mode={mode} value={data.srNo} onChange={(v) => handleChange('srNo', v)} placeholder="નંબર" />
                    </div>
                </div>
                <div className="text-center flex-1">
                    <h1 className="text-2xl font-bold">પહોચ ( નિયમ નં. ૧૪)</h1>
                </div>
                <div className="flex items-end text-sm">
                    <span className="font-bold mr-2">તારીખ:</span>
                    <div className="w-28">
                        <EditableField mode={mode} value={data.headerDate} onChange={(v) => handleChange('headerDate', v)} placeholder="તારીખ" />
                    </div>
                </div>
            </div>

            {/* Lender Info */}
            <div className="space-y-4 mb-6">
                <div className="flex items-end">
                    <span className="font-bold min-w-[150px]">નાણાં ધીરનાર કરનારનું નામ:</span>
                    <div className="flex-1 ml-2">
                        <EditableField mode={mode} value={data.lenderName || company.name} onChange={(v) => handleChange('lenderName', v)} placeholder="નામ" />
                    </div>
                </div>
                <div className="flex items-end">
                    <span className="font-bold min-w-[80px]">સરનામું:</span>
                    <div className="flex-1 ml-2">
                        <EditableField mode={mode} value={data.lenderAddress || company.address} onChange={(v) => handleChange('lenderAddress', v)} placeholder="સરનામું" multiline />
                    </div>
                </div>
                <div className="flex justify-between items-end">
                    <div className="flex items-end flex-1 mr-8">
                        <span className="font-bold whitespace-nowrap">રજીસ્ટ્રેશન પ્રમાણપત્ર નં.:</span>
                        <div className="flex-1 ml-2">
                            <EditableField mode={mode} value={data.registrationNo} onChange={(v) => handleChange('registrationNo', v)} placeholder="નંબર" />
                        </div>
                    </div>
                    <div className="flex items-end w-40">
                        <span className="font-bold">તારીખ:</span>
                        <div className="flex-1 ml-2">
                            <EditableField mode={mode} value={data.regDate} onChange={(v) => handleChange('regDate', v)} placeholder="તારીખ" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Receipt Body */}
            <div className="space-y-5 flex-1">
                <div className="flex items-end justify-between">
                    <div className="flex items-end flex-1">
                        <span className="font-bold text-lg">શ્રી</span>
                        <div className="flex-1 ml-2">
                            <EditableField mode={mode} value={data.debtorName} onChange={(v) => handleChange('debtorName', v)} placeholder="દેણદારનું નામ" />
                        </div>
                    </div>
                    <span className="font-bold ml-4 text-sm">(દેણદારનું નામ )</span>
                </div>

                <div className="flex items-end">
                    <span className="font-bold">પાસેથી રૂપિયા</span>
                    <div className="w-1/2 ml-2 mr-4">
                        <EditableField mode={mode} value={data.amountText} onChange={(v) => handleChange('amountText', v)} placeholder="રકમ શબ્દોમાં" />
                    </div>
                    <span className="font-bold mr-2 whitespace-nowrap">અંકે રૂપિયા :</span>
                    <div className="flex-1">
                        <EditableField mode={mode} value={data.amountInWords} onChange={(v) => handleChange('amountInWords', v)} placeholder="અંકે" />
                    </div>
                </div>

                <div className="flex items-end">
                    <div className="flex-1 h-6 mr-4 border-b border-black">
                        <EditableField mode={mode} value={data.additionalNote} onChange={(v) => handleChange('additionalNote', v)} noBorder />
                    </div>
                    <span className="font-bold">મળ્યા છે . અને નીચે પ્રમાણે જમા કરવામાં આવે છે .</span>
                </div>

                <div className="grid grid-cols-2 gap-x-12 pt-4">
                    <div className="flex items-end">
                        <span className="font-bold min-w-[120px]">મુદ્રલ ખાતે રૂપિયા :</span>
                        <div className="flex-1">
                            <EditableField mode={mode} value={data.principalAmount} onChange={(v) => handleChange('principalAmount', v)} placeholder="મુદ્રલ" />
                        </div>
                    </div>
                </div>

                <div className="flex items-end gap-4 text-sm">
                    <span className="font-bold">વ્યાજ ખાતે રૂપિયા</span>
                    <div className="w-24">
                        <EditableField mode={mode} value={data.interestAmount} onChange={(v) => handleChange('interestAmount', v)} placeholder="વ્યાજ" />
                    </div>
                    <span className="font-bold">તારીખ</span>
                    <div className="w-24">
                        <EditableField mode={mode} value={data.fromDate} onChange={(v) => handleChange('fromDate', v)} placeholder="તારીખ થી" />
                    </div>
                    <span className="font-bold">થી તારીખ</span>
                    <div className="w-24">
                        <EditableField mode={mode} value={data.toDate} onChange={(v) => handleChange('toDate', v)} placeholder="તારીખ સુધી" />
                    </div>
                    <span className="font-bold">સુધી</span>
                </div>

                <div className="flex items-end justify-between pt-2">
                    <div className="flex items-end flex-1 mr-4">
                        <span className="font-bold whitespace-nowrap">તેઓને</span>
                        <div className="flex-1 ml-2">
                            <EditableField mode={mode} value={data.securityName} onChange={(v) => handleChange('securityName', v)} placeholder="ગીરો વસ્તુ" />
                        </div>
                    </div>
                    <span className="font-bold text-sm">(ગીરો વસ્તુની વિગત)</span>
                </div>
                <p className="font-bold">સારી અને જેતે મૂળ સ્થિતિમાં પરત મળેલ છે .</p>
            </div>

            {/* Footer Signatures */}
            <div className="flex justify-between items-end mt-12 pb-4">
                <div className="flex flex-col items-center">
                    <div className="w-48 border-t border-black pt-2 text-center font-bold">દેણદારની સહી</div>
                </div>

                {/* Stamp Space */}
                {/* <div className="w-[120px] h-[80px] border border-black flex items-center justify-center bg-gray-50/30">
                    <span className="text-[10px] text-gray-400 font-bold text-center">Stamp &<br />Signature</span>
                </div> */}

                <div className="flex flex-col items-center">
                    <div className="w-48 border-t border-black pt-2 text-center font-bold">નાણાં ધીરનાર કરનારની સહી</div>
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

GujaratReceiptTemplate.displayName = "GujaratReceiptTemplate";
