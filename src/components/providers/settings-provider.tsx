"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CompanySettings {
    name: string;
    tagline: string;
    address: string;
    gstin: string;
    mobile: string;
    email: string;
    logoUrl: string; // For now just a placeholder URL or base64
}

interface SettingsContextType {
    companySettings: CompanySettings;
    updateCompanySettings: (settings: Partial<CompanySettings>) => void;
    printTemplate: string;
    setPrintTemplate: (templateId: string) => void;
}

const defaultCompany: CompanySettings = {
    name: "Apna Finance Corp",
    tagline: "Trusted Financial Partner",
    address: "123, Market Road, City Center, Mumbai - 400001",
    gstin: "27ABCDE1234F1Z5",
    mobile: "+91 98765 43210",
    email: "support@apnafinance.com",
    logoUrl: "",
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
            try { setCompanySettings(JSON.parse(savedCompany)); } catch (e) { }
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
