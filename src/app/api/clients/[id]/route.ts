import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Client from '@/lib/models/Client';
import Loan from '@/lib/models/Loan';
import { cookies } from 'next/headers';
import { verifyJWT, AUTH_COOKIE_NAME } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

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

// PUT /api/clients/[id] - Update Client Profile
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();

        // 1. Auth Check
        // Reusing 'create_client' permission for editing for simplicity, or use specific 'edit_client' if available
        const hasAccess = await checkAccess(req, PERMISSIONS.EDIT_CLIENT); 
        if (!hasAccess) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        
        // 2. Validate Body
        let { firstName, lastName, mobile, email, address, photoUrl, aadhar, pan } = body;

        // 3. Fetch Existing Client to get old photo
        const existingClient = await Client.findById(id);
        if (!existingClient) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }
        
        let oldPhotoUrl = existingClient.photoUrl;
        let newPhotoUrl = photoUrl;

        // 4. Handle Image Upload (if base64)
        if (photoUrl && photoUrl.startsWith('data:image')) {
            try {
                // Upload NEW image first
                newPhotoUrl = await uploadToCloudinary(photoUrl);
            } catch (err) {
                console.error("Image upload failed:", err);
                // VITAL: If upload fails, throw error. Do NOT delete old image. Do NOT update client.
                throw new Error("Failed to upload new image. Profile not updated.");
            }
        }

        // 5. Update Client in DB
        const updatedClient = await Client.findByIdAndUpdate(
            id,
            {
                firstName,
                lastName,
                mobile,
                email,
                address,
                photoUrl: newPhotoUrl, // Use the new URL (or existing if not changed)
                aadhar,
                pan
            },
            { new: true, runValidators: true }
        );

        if (!updatedClient) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // 6. Cleanup Old Image (Only if URL changed and old one existed)
        if (newPhotoUrl !== oldPhotoUrl && oldPhotoUrl && oldPhotoUrl.includes('cloudinary.com')) {
            // Run deletion asynchronously, don't block response
             deleteFromCloudinary(oldPhotoUrl).catch(err => console.error("Failed to cleanup old image:", err));
        }

        return NextResponse.json({ success: true, client: updatedClient });

    } catch (error: any) {
        console.error("Update Client Error:", error);
        return NextResponse.json({ error: error.message || "Failed to update client" }, { status: 500 });
    }
}

// DELETE /api/clients/[id] - Delete Client and Cascade
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();

        // 1. Auth Check
        const hasAccess = await checkAccess(req, PERMISSIONS.DELETE_CLIENT);
        if (!hasAccess) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;

        // 2. Check for Active Loans
        // Case-insensitive check for 'Active' or 'active'
        const activeLoansCount = await Loan.countDocuments({
            client: id,
            status: { $in: ['Active', 'active', 'Overdue', 'overdue'] }
        });

        if (activeLoansCount > 0) {
            return NextResponse.json({ 
                error: `Cannot delete client. They have ${activeLoansCount} active/overdue loans. Please close or settle them first.` 
            }, { status: 400 });
        }

        // 3. Get Client for Image Cleanup
        const client = await Client.findById(id);
        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // 4. Cascade Delete
        // A. Delete Image from Cloudinary
        if (client.photoUrl) {
            await deleteFromCloudinary(client.photoUrl);
        }

        // B. Delete All Loan History (Closed/Settled/Rejected)
        // Since we already checked for active ones, remaining ones are safe to delete
        await Loan.deleteMany({ client: id });

        // C. Delete Client Profile
        await Client.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: "Client profile and history deleted successfully" });

    } catch (error: any) {
        console.error("Delete Client Error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete client" }, { status: 500 });
    }
}
