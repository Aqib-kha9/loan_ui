"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Settings,
    FileText,
    PlusCircle,
    Landmark,
    LogOut,
    CreditCard,
    PieChart,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navGroups = [
    {
        label: "Overview",
        items: [
            { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        ]
    },
    {
        label: "Operations",
        items: [
            { title: "Counter", href: "/", icon: CreditCard },
            { title: "New Loan", href: "/loans/new", icon: PlusCircle },
            { title: "Statements", href: "/statements", icon: FileText },
        ]
    },
    {
        label: "Management",
        items: [
            { title: "Portfolio", href: "/loans", icon: PieChart },
            { title: "Customers", href: "/clients", icon: Users },
        ]
    },
    {
        label: "System",
        items: [
            { title: "Settings", href: "/settings", icon: Settings },
        ]
    }
];

export function AppSidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "flex h-full w-[260px] flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-50 transition-all duration-300 font-sans tracking-wide",
                className
            )}
        >
            {/* 1. BRAND HEADER - Theme Aware */}
            <div className="flex h-20 shrink-0 items-center px-6 border-b border-sidebar-border bg-sidebar/50 backdrop-blur-md">
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
                    <Landmark className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold tracking-tight text-sidebar-foreground leading-none">FinCorp</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Enterprise</span>
                </div>
            </div>

            {/* 2. NAVIGATION - Spaced & Modern */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
                {navGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        <h4 className="mb-3 px-4 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                            {group.label}
                        </h4>
                        <nav className="grid gap-1.5">
                            {group.items.map((item, index) => {
                                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                                            isActive
                                                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/20"
                                                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 relative z-10">
                                            <item.icon className={cn("h-[18px] w-[18px] transition-colors", isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
                                            <span>{item.title}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                ))}
            </div>

            {/* 3. USER PROFILE - Floating Style */}
            <div className="p-4 border-t border-sidebar-border">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="h-9 w-9 rounded-full bg-sidebar-primary/10 flex items-center justify-center text-xs font-bold shadow-sm text-sidebar-primary border border-sidebar-primary/20">
                        AD
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-sidebar-foreground">Admin User</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Branch Manager
                        </span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 px-2 text-xs font-medium tracking-wide transition-colors"
                >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Secure Logout
                </Button>
            </div>
        </aside>
    );
}
