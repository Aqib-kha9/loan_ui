export const PERMISSIONS = {
    // User Management
    VIEW_DASHBOARD: 'view_dashboard', // New
    CREATE_USER: 'create_user',
    VIEW_USERS: 'view_users',
    EDIT_USER: 'edit_user',
    DELETE_USER: 'delete_user',
    
    // Loan Management
    CREATE_LOAN: 'create_loan',
    VIEW_LOANS: 'view_loans',
    APPROVE_LOAN: 'approve_loan',
    DELETE_LOAN: 'delete_loan',

    // Client Management
    CREATE_CLIENT: 'create_client',
    VIEW_CLIENTS: 'view_clients',
    EDIT_CLIENT: 'edit_client',
    DELETE_CLIENT: 'delete_client',

    // Financials
    VIEW_REPORTS: 'view_reports',
    CREATE_PAYMENT: 'create_payment', // Was MANAGE_PAYMENTS
    EDIT_PAYMENT: 'edit_payment',
    DELETE_PAYMENT: 'delete_payment',
    REVERT_PAYMENT: 'revert_payment',

    // System
    VIEW_SETTINGS: 'view_settings',
    EDIT_SETTINGS: 'edit_settings',
    VIEW_ACTIVITY_LOG: 'view_activity_log',
} as const;

export const PERMISSION_GROUPS = []; // Deprecated, using Matrix

export const PERMISSION_MATRIX = [
    {
        feature: "Dashboard",
        permissions: {
            view: PERMISSIONS.VIEW_DASHBOARD,
        }
    },
    {
        feature: "Quick Collect",
        permissions: {
            add: PERMISSIONS.CREATE_PAYMENT,
        }
    },
    {
        feature: "Payments",
        permissions: [
            { id: "view_payments", label: "View Payments", description: "Can view payment history" },
            { id: "create_payment", label: "Create Payment", description: "Can process new payments" },
            { id: "edit_payment", label: "Edit Payment", description: "Can modify existing payments" },
            { id: "delete_payment", label: "Delete Payment", description: "Can delete payment records" },
            { id: "revert_payment", label: "Revert Payment", description: "Can safely revert/rollback active payments" }
        ]
    },
    {
        feature: "Loan Portfolio",
        permissions: {
            view: PERMISSIONS.VIEW_LOANS,
            add: PERMISSIONS.CREATE_LOAN,
            edit: PERMISSIONS.APPROVE_LOAN,
            delete: PERMISSIONS.DELETE_LOAN
        }
    },
    {
        feature: "Statements",
        permissions: {
            view: PERMISSIONS.VIEW_REPORTS,
        }
    },
    {
        feature: "Customers",
        permissions: {
            view: PERMISSIONS.VIEW_CLIENTS,
            add: PERMISSIONS.CREATE_CLIENT,
            edit: PERMISSIONS.EDIT_CLIENT,
            delete: PERMISSIONS.DELETE_CLIENT
        }
    },
    {
        feature: "Team",
        permissions: {
            view: PERMISSIONS.VIEW_USERS,
            add: PERMISSIONS.CREATE_USER,
            edit: PERMISSIONS.EDIT_USER,
            delete: PERMISSIONS.DELETE_USER
        }
    },
    {
        feature: "Activity",
        permissions: {
            view: PERMISSIONS.VIEW_ACTIVITY_LOG,
        }
    },
    {
        feature: "Settings",
        permissions: {
            view: PERMISSIONS.VIEW_SETTINGS,
            edit: PERMISSIONS.EDIT_SETTINGS,
        }
    }
];

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = typeof PERMISSIONS[PermissionKey];

export const ROLE_DEFINITIONS = {
    ADMIN: {
        name: 'Admin',
        description: 'Full system access',
        permissions: Object.values(PERMISSIONS)
    },
    MANAGER: {
        name: 'Manager',
        description: 'Can manage operations but not system settings',
        permissions: [
            PERMISSIONS.VIEW_DASHBOARD,
            PERMISSIONS.VIEW_USERS,
            PERMISSIONS.CREATE_LOAN,
            PERMISSIONS.VIEW_LOANS,
            PERMISSIONS.APPROVE_LOAN,
            PERMISSIONS.CREATE_CLIENT,
            PERMISSIONS.VIEW_CLIENTS,
            PERMISSIONS.EDIT_CLIENT,
            PERMISSIONS.VIEW_REPORTS,
            PERMISSIONS.CREATE_PAYMENT,
            PERMISSIONS.VIEW_ACTIVITY_LOG,
        ]
    },
    STAFF: {
        name: 'Staff',
        description: 'Standard operational access',
        permissions: [
            PERMISSIONS.VIEW_DASHBOARD,
            PERMISSIONS.CREATE_LOAN,
            PERMISSIONS.VIEW_LOANS,
            PERMISSIONS.VIEW_CLIENTS,
            PERMISSIONS.CREATE_PAYMENT, // Can collect payments
        ]
    }
};
