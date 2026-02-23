"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CompanySettings {
    name: string;
    tagline: string;
    address: string;

    mobile: string;
    landline?: string;
    email: string;
    website: string; // Added
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
    landline: "0265-3594185",
    email: "support@apnafinance.com",
    website: "www.apnafinance.com",
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

    // Load from API on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.settings) {
                        // Merge defaults to ensure no missing fields if DB is partial
                        if (data.settings.companySettings) {
                            setCompanySettings(prev => ({ ...prev, ...data.settings.companySettings }));
                        }
                        if (data.settings.printTemplate) {
                            setPrintTemplate(data.settings.printTemplate);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const updateCompanySettings = async (newSettings: Partial<CompanySettings>) => {
        const updated = { ...companySettings, ...newSettings };
        setCompanySettings(updated);

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companySettings: updated })
            });
            if (!res.ok) throw new Error("Save failed");
        } catch (e) {
            console.error("Save failed", e);
            throw e;
        }
    };

    const handleSetTemplate = (t: string) => {
        setPrintTemplate(t);
        fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ printTemplate: t })
        }).catch(e => console.error("Save template failed", e));
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
