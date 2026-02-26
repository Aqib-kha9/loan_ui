import React from "react";
import { CompanySettings } from "@/components/providers/settings-provider";

interface LoanRecordProps {
    data: any;
    company: CompanySettings;
    mode?: 'edit' | 'print' | 'view';
    onChange?: (field: string, value: string) => void;
}

const EditableCell = ({
    mode,
    value,
    onChange,
    className = "",
    align = "center",
    onKeyDown,
    rowIdx,
    colIdx
}: {
    mode?: 'edit' | 'print' | 'view',
    value: string,
    onChange?: (val: string) => void,
    className?: string,
    align?: "left" | "center" | "right",
    onKeyDown?: (e: React.KeyboardEvent, r: number, c: number) => void,
    rowIdx: number,
    colIdx: number
}) => {
    const alignClass = align === "left" ? "text-left px-2" : align === "right" ? "text-right px-2" : "text-center";

    if (mode === 'edit') {
        return (
            <input
                id={`cell-${rowIdx}-${colIdx}`}
                type="text"
                value={value || ''}
                onChange={(e) => onChange?.(e.target.value)}
                onKeyDown={(e) => onKeyDown?.(e, rowIdx, colIdx)}
                className={`w-full h-full bg-blue-50/20 outline-none text-[10px] p-0.5 border-none focus:bg-blue-100 transition-colors ${alignClass} ${className}`}
            />
        );
    }
    return <div className={`w-full h-full flex items-center ${align === "left" ? "justify-start px-2" : align === "right" ? "justify-end px-2" : "justify-center"} text-[10px] p-0.5 leading-tight ${className}`}>{value}</div>;
};

export const LoanRecordTemplate = ({ data, mode = 'view', onChange }: LoanRecordProps) => {
    const columns = [
        { label: "અનુક્રમ નંબર", key: "srNo", width: "45px", align: "center" as const },
        { label: "ધીરાણની તારીખ", key: "date", width: "75px", align: "center" as const },
        { label: "કરજદારનું નામ", key: "debtorName", width: "135px", align: "left" as const },
        { label: "જામીનદારનાં નામ", key: "guarantorName", width: "130px", align: "left" as const },
        { label: "કરજ લેવાનું કારણ", key: "reason", width: "100px", align: "left" as const },
        { label: "રકમ", key: "amount", width: "60px", align: "center" as const },
        { label: "જામીનગિરીમાં (મિલકત આપી હોય તેનું વર્ણન)", key: "security", width: "155px", align: "left" as const },
        { label: "નાણાં પાછાં આપવાની તારીખ (વાયદો)", key: "returnDate", width: "85px", align: "center" as const },
        { label: "નાણું લેનારની સહી", key: "receiverSign", width: "75px", align: "center" as const },
        { label: "જામીનદારની સહી", key: "guarantorSign", width: "75px", align: "center" as const },
        { label: "નાણું ધિરાણ પેટા સભાએ કરેલ ઠરાવનો નંબર તારીખ", key: "resolution", width: "110px", align: "left" as const },
        { label: "ધીરેલા નાણાના ખાતાવહીનો પાના નં", key: "ledgerPage", width: "55px", align: "center" as const },
    ];

    const rowsCount = 32;
    const rows = Array.from({ length: rowsCount }, (_, i) => i);

    const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
        let nextR = r;
        let nextC = c;

        switch (e.key) {
            case 'ArrowUp':
                nextR = Math.max(0, r - 1);
                e.preventDefault();
                break;
            case 'ArrowDown':
                nextR = Math.min(rowsCount - 1, r + 1);
                e.preventDefault();
                break;
            case 'ArrowLeft':
                if ((e.target as HTMLInputElement).selectionStart === 0) {
                    nextC = Math.max(0, c - 1);
                } else {
                    return; // Let standard cursor movement happen
                }
                break;
            case 'ArrowRight':
                const input = e.target as HTMLInputElement;
                if (input.selectionStart === input.value.length) {
                    nextC = Math.min(columns.length - 1, c + 1);
                } else {
                    return; // Let standard cursor movement happen
                }
                break;
            case 'Enter':
                nextR = Math.min(rowsCount - 1, r + 1);
                e.preventDefault();
                break;
            default:
                return;
        }

        if (nextR !== r || nextC !== c) {
            const nextCell = document.getElementById(`cell-${nextR}-${nextC}`);
            if (nextCell) {
                nextCell.focus();
                (nextCell as HTMLInputElement).select();
            }
        }
    };

    return (
        <div className="w-[297mm] h-[210mm] bg-white text-black font-sans p-4 relative flex flex-col mx-auto box-border landscape-container" style={{ printColorAdjust: 'exact' }}>
            {/* Header Title */}
            <div className="text-center mb-6">
                <h1 className="text-xl font-bold border-b border-black inline-block px-16 pb-0.5">ધિરાણ નાણાની નોંધ</h1>
            </div>

            {/* Table */}
            <div className="flex-1 border border-black overflow-hidden flex flex-col mb-4">
                <table className="w-full border-collapse table-fixed">
                    <thead>
                        {/* Label Row */}
                        <tr className="h-20">
                            {columns.map((col, idx) => (
                                <th
                                    key={`label-${idx}`}
                                    className="border border-black text-[10.5px] p-1 font-bold leading-snug align-middle text-center break-words bg-white"
                                    style={{ width: col.width }}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                        {/* Number Row */}
                        <tr className="h-6">
                            {columns.map((_, idx) => (
                                <th
                                    key={`num-${idx}`}
                                    className="border border-black text-[10px] p-0 font-bold text-center bg-white"
                                >
                                    {idx + 1}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((rowIdx) => (
                            <tr key={rowIdx} className="h-[5.8mm]">
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className="border border-black p-0">
                                        <EditableCell
                                            rowIdx={rowIdx}
                                            colIdx={colIdx}
                                            mode={mode}
                                            value={data[`row_${rowIdx}_${col.key}`]}
                                            onChange={(val) => onChange?.(`row_${rowIdx}_${col.key}`, val)}
                                            onKeyDown={handleKeyDown}
                                            align={col.align}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};
