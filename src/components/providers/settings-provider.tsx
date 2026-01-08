"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CompanySettings {
    name: string;
    tagline: string;
    address: string;

    mobile: string;
    email: string;
    logoUrl: string; // For now just a placeholder URL or base64
    signatoryText: string;
    showSignatory: boolean;

    // Disclaimer Settings
    showComputerGenerated: boolean;
    computerGeneratedText: string;
    showStatementEnd: boolean;
    statementEndText: string;
    showCertification: boolean;
    certificationText: string;
    showJurisdiction: boolean;
    jurisdictionText: string;
}

interface SettingsContextType {
    companySettings: CompanySettings;
    updateCompanySettings: (settings: Partial<CompanySettings>) => void;
    printTemplate: string;
    setPrintTemplate: (templateId: string) => void;
}

const defaultCompany: CompanySettings = {
    name: "Patni Finance",
    tagline: "Trusted Financial Partner",
    address: "123, Market Road, City Center, Mumbai - 400001",

    mobile: "+91 98765 43210",
    email: "support@apnafinance.com",
    logoUrl: "https://placehold.co/400x200?text=Patni+Finance",
    signatoryText: "Authorized Signatory",
    showSignatory: true,

    showComputerGenerated: true,
    computerGeneratedText: "This is a computer generated statement and does not require a signature.",
    showStatementEnd: true,
    statementEndText: "END OF STATEMENT",
    showCertification: true,
    certificationText: 'I/We hereby certify that the particulars furnished above are true and correct as per our books of accounts.',
    showJurisdiction: true,
    jurisdictionText: "Subject to Mumbai - 400001 Jurisdiction"
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompany);
    const [printTemplate, setPrintTemplate] = useState("classic");

    // Load from localStorage on mount (Simulated persistence)
    useEffect(() => {
        const savedCompany = localStorage.getItem("companySettings");
        const savedTemplate = localStorage.getItem("printTemplate");

        if (savedCompany) {
            try {
                const parsed = JSON.parse(savedCompany);
                // Ensure logoUrl is not overwritten by empty string from old cache
                if (!parsed.logoUrl) {
                    parsed.logoUrl = defaultCompany.logoUrl;
                }
                setCompanySettings({ ...defaultCompany, ...parsed });
            } catch (e) { }
        }
        if (savedTemplate) {
            setPrintTemplate(savedTemplate);
        }
    }, []);

    const updateCompanySettings = (newSettings: Partial<CompanySettings>) => {
        setCompanySettings((prev) => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem("companySettings", JSON.stringify(updated));
            return updated;
        });
    };

    const handleSetTemplate = (t: string) => {
        setPrintTemplate(t);
        localStorage.setItem("printTemplate", t);
    };

    return (
        <SettingsContext.Provider value={{
            companySettings,
            updateCompanySettings,
            printTemplate,
            setPrintTemplate: handleSetTemplate
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
