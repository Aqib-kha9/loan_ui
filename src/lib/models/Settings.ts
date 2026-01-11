import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    type: { type: String, default: 'Global', unique: true }, // Singleton marker used to ensure only one settings document exists
    companySettings: {
        name: { type: String, default: "Patni Finance" },
        tagline: { type: String, default: "Trusted Financial Partner" },
        address: { type: String, default: "123, Market Road, City Center, Mumbai - 400001" },
        mobile: { type: String, default: "+91 98765 43210" },
        email: { type: String, default: "support@apnafinance.com" },
        website: String,
        logoUrl: { type: String, default: "https://placehold.co/400x200?text=Patni+Finance" },
        
        signatoryText: { type: String, default: "Authorized Signatory" },
        showSignatory: { type: Boolean, default: true },

        showComputerGenerated: { type: Boolean, default: true },
        computerGeneratedText: { type: String, default: "This is a computer generated statement and does not require a signature." },
        
        showStatementEnd: { type: Boolean, default: true },
        statementEndText: { type: String, default: "END OF STATEMENT" },
        
        showCertification: { type: Boolean, default: true },
        certificationText: { type: String, default: 'I/We hereby certify that the particulars furnished above are true and correct as per our books of accounts.' },
        
        showJurisdiction: { type: Boolean, default: true },
        jurisdictionText: { type: String, default: "Subject to Mumbai - 400001 Jurisdiction" }
    },
    printTemplate: { type: String, default: 'classic' }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
