"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PermissionValue } from "@/lib/constants/permissions";

interface User {
    id: string;
    email: string;
    name: string; // Add name if available
    role: string;
    permissions: string[];
    avatarUrl?: string; // Add avatarUrl
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    permissions: string[];
    role: string | null;
    checkPermission: (permission: PermissionValue) => boolean;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        router.push("/login");
        router.refresh(); // Clear server component cache
    };

    const checkPermission = React.useCallback((requiredPermission: PermissionValue) => {
        if (!user) return false;
        // Admins and Super Admins have all permissions
        if (user.role === 'Admin' || user.role === 'super_admin') return true;

        return (user.permissions || []).includes(requiredPermission);
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            permissions: user?.permissions || [],
            role: user?.role || null,
            checkPermission,
            logout,
            refreshAuth: fetchUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
