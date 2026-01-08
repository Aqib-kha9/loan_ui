import { LoanAccount } from "./mock-data";

export interface ActivityLog {
    id: string;
    type: 'Loan' | 'Payment' | 'System';
    title: string;
    description: string;
    timestamp: string;
    user: string;
    entityName?: string; // e.g., Customer Name
    amount?: number; // Positive or Negative
    action?: 'Disbursed' | 'Received' | 'Created' | 'Updated';
    meta?: any;
}

// In-memory store for demo (would be database in real app)
let activityLogs: ActivityLog[] = [
    {
        id: '1',
        type: 'System',
        title: 'System Initialized',
        description: 'Loan ERP System started successfully.',
        timestamp: new Date().toISOString(),
        user: 'System'
    }
];

export const getActivities = (): ActivityLog[] => {
    return activityLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const logActivity = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
        ...log,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString()
    };
    activityLogs = [newLog, ...activityLogs];
    return newLog;
};
