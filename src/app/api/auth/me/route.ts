import Link from 'next/link';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { verifyJWT, AUTH_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Role from '@/lib/models/Role'; // Ensure Role model is registered for populate
import User from '@/lib/models/User';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Fetch fresh data from DB to ensure user updates are reflected
        await dbConnect();
        
        // DEBUG: Check registered models
        if (!mongoose.models.Role) {
            console.log("Re-registering Role model...");
            // Force Reference: Access the exported model to ensure file is loaded/schema registered.
            // If the import alone was tree-shaken, using it here prevents that.
            const _forcedRole = Role; 
            console.log("Registered models after force:", mongoose.modelNames());
        }

        const user = await User.findById(payload.id).populate('role');
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

        // Transform to same shape as payload but with fresh data
        const roleData = user.role as any;
        const freshUser = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: roleData?.name || payload.role,
            permissions: roleData?.permissions || []
        };

        return NextResponse.json({ 
            user: freshUser 
        });

    } catch (error: any) {
        console.error("Auth/Me Error:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
