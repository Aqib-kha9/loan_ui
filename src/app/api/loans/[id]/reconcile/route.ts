import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Loan from '@/lib/models/Loan';
import { cookies } from 'next/headers';
import { verifyJWT, AUTH_COOKIE_NAME } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { recalculateLedger } from '@/lib/loan-engine';

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

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        
        // Auth Check (Usually requires high level permission to reconcile/edit statement logic)
        const hasAccess = await checkAccess(req, PERMISSIONS.EDIT_SETTINGS); // Reusing settings perm or define new one
        if (!hasAccess) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const { ledgerEntries } = await req.json();

        if (!ledgerEntries || !Array.isArray(ledgerEntries)) {
            return NextResponse.json({ error: "Invalid ledger data" }, { status: 400 });
        }

        // Find the loan
        const loan = await Loan.findOne({ loanId: id });
        if (!loan) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }

        let changesMade = false;

        // Apply edits to DB
        for (const entry of ledgerEntries) {
            if (entry.linkedType === 'txn' && entry.linkedId) {
                const txn = loan.transactions.find((t: any) => t._id?.toString() === entry.linkedId || t.txnId === entry.linkedId);
                if (txn) {
                    txn.amount = entry.credit;
                    txn.date = new Date(entry.date);
                    txn.reference = entry.refNo;
                    txn.description = entry.particulars;
                    changesMade = true;
                }
            } else if (entry.linkedType === 'schedule' && entry.linkedId) {
                const item = loan.repaymentSchedule.find((s: any) => s._id?.toString() === entry.linkedId);
                if (item) {
                    item.dueDate = new Date(entry.date);
                    item.interestComponent = entry.interestComponent || 0;
                    item.principalComponent = entry.principalComponent || 0;
                    item.amount = (item.interestComponent + item.principalComponent);
                    changesMade = true;
                }
            }
        }

        // Handle Deletions (If entries were deleted in UI, we need to find what's missing)
        // This is complex because we only have 'remaining' entries. 
        // Let's check for Txns that were NOT in the provided list
        const providedTxnIds = ledgerEntries.filter(e => e.linkedType === 'txn').map(e => e.linkedId);
        const originalTxnIds = loan.transactions.map((t: any) => t._id?.toString() || t.txnId);
        
        const txnsToDelete = originalTxnIds.filter((id: string) => !providedTxnIds.includes(id));
        if (txnsToDelete.length > 0) {
            loan.transactions = loan.transactions.filter((t: any) => !txnsToDelete.includes(t._id?.toString() || t.txnId));
            changesMade = true;
        }

        const providedScheduleIds = ledgerEntries.filter(e => e.linkedType === 'schedule').map(e => e.linkedId);
        // Note: We don't delete schedule items usually, just zero them out or leave them. 
        // But if user deleted a row, we should probably handle it.

        if (changesMade) {
            await loan.save();
            // Trigger Engine to fix balances and metadata
            await recalculateLedger(id);
        }

        return NextResponse.json({ success: true, message: "Ledger reconciled successfully" });
    } catch (error: any) {
        console.error("Reconcile Error:", error);
        return NextResponse.json({ error: error.message || "Failed to reconcile ledger" }, { status: 500 });
    }
}
