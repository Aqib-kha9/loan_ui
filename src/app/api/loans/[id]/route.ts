import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Loan from '@/lib/models/Loan';
import Client from '@/lib/models/Client'; // Ensure Client is registered
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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        
        // Auth Check
        const hasAccess = await checkAccess(req, PERMISSIONS.VIEW_LOANS);
        if (!hasAccess) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;

        // Find by loanId (e.g., LN-123456)
        const loan = await Loan.findOne({ loanId: id })
            .populate('client', 'firstName lastName photoUrl mobile address email pan aadhar');

        if (!loan) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, loan });
    } catch (error: any) {
        console.error("Fetch Loan Error:", error);
        return NextResponse.json({ error: "Failed to fetch loan details" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();

        // Auth Check
        const hasAccess = await checkAccess(req, PERMISSIONS.DELETE_LOAN);
        if (!hasAccess) {
            return NextResponse.json({ error: "Unauthorized: Missing 'delete_loan' permission" }, { status: 403 });
        }

        const { id } = await params;

        // Find and Delete
        const deletedLoan = await Loan.findOneAndDelete({ loanId: id });

        if (!deletedLoan) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Loan deleted successfully" });
    } catch (error: any) {
        console.error("Delete Loan Error:", error);
        return NextResponse.json({ error: "Failed to delete loan" }, { status: 500 });
    }
}
