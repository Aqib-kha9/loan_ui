// Client-side Activity Logger
// For server-side logging, use the Activity model directly

export interface ActivityLog {
    _id: string;
    id?: string; // Compatibility
    type: 'Loan' | 'Payment' | 'System';
    title: string;
    description: string;
    timestamp: string;
    user: string;
    entityName?: string;
    amount?: number;
    action?: 'Disbursed' | 'Received' | 'Created' | 'Updated';
    meta?: any;
}

export const logActivity = async (log: Omit<ActivityLog, '_id' | 'timestamp' | 'id'>) => {
    try {
        await fetch('/api/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log)
        });
    } catch (error) {
        console.error("Failed to log activity client-side:", error);
    }
};
