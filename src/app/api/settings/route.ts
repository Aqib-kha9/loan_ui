import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { cookies } from 'next/headers';
import { verifyJWT, AUTH_COOKIE_NAME } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { uploadToCloudinary } from '@/lib/cloudinary';

async function checkAccess(req: Request, requiredPermission: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return false;
    
    const payload = await verifyJWT(token);
    if (!payload) return false;

    const userPayload = payload as any; 
    if (userPayload.role === 'Admin' || userPayload.role === 'super_admin') return true;
    return userPayload.permissions?.includes(requiredPermission);
}

// GET /api/settings - Fetch Global Settings
export async function GET(req: Request) {
    try {
        await dbConnect();
        
        // Settings are generally readable by authenticated users (or at least those who can view dashboard)
        // We can enforce VIEW_SETTINGS permission if desired, but "SettingsProvider" wraps the whole app or dashboard?
        // Usually basic company info is needed for header/footer so maybe allow all authenticated?
        // Let's stick to VIEW_SETTINGS checking.
        
        // Wait, Header usually needs Company Name.
        // If we block header from getting settings, it looks blank.
        // Let's allow READ for all authenticated users?
        // For now, I'll check VIEW_SETTINGS.
        const hasAccess = await checkAccess(req, PERMISSIONS.VIEW_SETTINGS);
        if (!hasAccess) {
             // Return defaults if no access? Or Error?
             // Since provider is global, getting 403 might break UI if not handled.
             // But page shows AccessDenied.
             return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        let settings = await Settings.findOne({ type: 'Global' });
        
        if (!settings) {
            // Create default
            settings = await Settings.create({ type: 'Global' });
        }

        return NextResponse.json({ success: true, settings });

    } catch (error: any) {
        console.error("Fetch Settings Error:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

// POST /api/settings - Update Settings
export async function POST(req: Request) {
    try {
        await dbConnect();
        
        const hasAccess = await checkAccess(req, PERMISSIONS.EDIT_SETTINGS);
        if (!hasAccess) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        let { companySettings, printTemplate } = body;

        // Handle Logo Upload
        if (companySettings && companySettings.logoUrl && companySettings.logoUrl.startsWith('data:image')) {
            try {
                const uploadedUrl = await uploadToCloudinary(companySettings.logoUrl);
                companySettings.logoUrl = uploadedUrl;
            } catch (err) {
                console.error("Logo upload failed", err);
            }
        }

        const updated = await Settings.findOneAndUpdate(
            { type: 'Global' },
            { 
                $set: {
                    ...(companySettings && { companySettings }),
                    ...(printTemplate && { printTemplate })
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, settings: updated });

    } catch (error: any) {
        console.error("Update Settings Error:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
