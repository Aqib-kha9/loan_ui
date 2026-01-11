import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Activity from '@/lib/models/Activity';
import { cookies } from 'next/headers';
import { verifyJWT, AUTH_COOKIE_NAME } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';

async function checkAccess(req: Request, requiredPermission: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return false;
    
    const payload = await verifyJWT(token);
    if (!payload) return false;

    const userPayload = payload as any; 
    // Admin bypass
    if (userPayload.role === 'Admin' || userPayload.role === 'super_admin') return true;

    return userPayload.permissions?.includes(requiredPermission);
}

// GET /api/activity - Fetch Logs
export async function GET(req: Request) {
    try {
        await dbConnect();
        
        // Auth Check
        const hasAccess = await checkAccess(req, PERMISSIONS.VIEW_ACTIVITY_LOG);
        if (!hasAccess) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const types = searchParams.get('types'); // comma separated
        const actions = searchParams.get('actions');
        const minAmount = searchParams.get('minAmount');
        const maxAmount = searchParams.get('maxAmount');

        const query: any = {};

        if (search) {
             query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { entityName: { $regex: search, $options: 'i' } },
                { user: { $regex: search, $options: 'i' } }
             ];
        }

        if (startDate && endDate) {
            query.timestamp = { 
                $gte: new Date(startDate), 
                $lte: new Date(endDate) 
            };
        }

        if (types) {
            query.type = { $in: types.split(',') };
        }

        if (actions) {
            query.action = { $in: actions.split(',') };
        }

        if (minAmount || maxAmount) {
            const conditions = [];
            if (minAmount) conditions.push({ $gte: [{ $abs: "$amount" }, parseFloat(minAmount)] });
            if (maxAmount) conditions.push({ $lte: [{ $abs: "$amount" }, parseFloat(maxAmount)] });
            
            // If existing $expr (unlikely in this simple query builder), merge? 
            // For now, simple assignment.
            query.$expr = { $and: conditions };
        }

        const activities = await Activity.find(query)
            .sort({ timestamp: -1 })
            .limit(100);

        return NextResponse.json({ success: true, activities });
    } catch (error: any) {
        console.error("Fetch Activity Error:", error);
        return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
    }
}

// POST /api/activity - Create Log (Client-side usage)
export async function POST(req: Request) {
    try {
        await dbConnect();

        // Optional: Check if user is authenticated at all?
        // Logging should probably be allowed by authenticated users
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { type, title, description, user, entityName, amount, action, meta } = body;

        const newLog = await Activity.create({
            type,
            title,
            description,
            user,
            entityName,
            amount,
            action,
            meta,
            timestamp: new Date()
        });

        return NextResponse.json({ success: true, log: newLog });

    } catch (error: any) {
        console.error("Create Activity Error:", error);
        return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
    }
}
