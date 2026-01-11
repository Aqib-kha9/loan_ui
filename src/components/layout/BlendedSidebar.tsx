"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    PieChart,
    Settings,
    FileText,
    Building2,
    Command,
    Search,
    ChevronRight,
    ArrowUpRight,
    PanelLeftClose,
    PanelLeftOpen,
    Activity,
    LogOut,
    ShieldCheck, // New Icon
    Palette,
    Sun,
    Moon,
    Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { PERMISSIONS } from "@/lib/constants/permissions";

const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Quick Collect", href: "/", icon: CreditCard },
    { title: "Loan Portfolio", href: "/loans", icon: PieChart },
    { title: "Statements", href: "/statements", icon: FileText },
    { title: "Customers", href: "/clients", icon: Users },
    { title: "Team", href: "/team", icon: ShieldCheck }, // New Link
    { title: "Activity", href: "/activity", icon: Activity },
    { title: "Settings", href: "/settings", icon: Settings },
];

export function BlendedSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, checkPermission, logout } = useAuth();
    const { setTheme } = useTheme();

    const changeColorTheme = (newColor: string) => {
        document.documentElement.setAttribute("data-theme", newColor);
    };

    // Change Password State
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [passwordState, setPasswordState] = useState({ current: '', new: '' });

    // Company Settings State
    const [companyInfo, setCompanyInfo] = useState<{ name: string; logoUrl?: string; tagline?: string } | null>(null);
    const [isBrandingLoading, setIsBrandingLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data.success && data.settings?.companySettings) {
                    setCompanyInfo(data.settings.companySettings);
                }
            } catch (err) {
                console.error("Failed to fetch sidebar branding:", err);
            } finally {
                setIsBrandingLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChangePassword = async () => {
        if (!passwordState.current || !passwordState.new) return;
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordState.current,
                    newPassword: passwordState.new
                })
            });

            if (res.ok) {
                // simple alert or toast if available, assuming generic success for now
                alert("Password changed successfully");
                setIsChangePasswordOpen(false);
                setPasswordState({ current: '', new: '' });
            } else {
                const data = await res.json();
                alert(data.error || "Failed to change password");
            }
        } catch (error) {
            alert("Error changing password");
        }
    };

    // Standard items that are always visible or basic access
    // We can filter this list dynamically
    const visibleNavItems = navItems.filter(item => {
        if (item.href === '/loans') return checkPermission(PERMISSIONS.VIEW_LOANS);
        if (item.href === '/team') return checkPermission(PERMISSIONS.VIEW_USERS);
        if (item.href === '/clients') return checkPermission(PERMISSIONS.VIEW_CLIENTS);
        if (item.href === '/activity') return checkPermission(PERMISSIONS.VIEW_ACTIVITY_LOG);
        if (item.href === '/settings') return checkPermission(PERMISSIONS.VIEW_SETTINGS);
        if (item.href === '/statements') return checkPermission(PERMISSIONS.VIEW_REPORTS);
        if (item.href === '/dashboard') return checkPermission(PERMISSIONS.VIEW_DASHBOARD);
        if (item.href === '/') return checkPermission(PERMISSIONS.CREATE_PAYMENT);
        return true;
    });

    // Fallback for user name initials
    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : "U";

    return (
        <aside
            className={cn(
                "flex flex-col h-full text-muted-foreground py-6 z-50 transition-all duration-300 ease-in-out relative",
                isCollapsed ? "w-[80px] items-center px-2" : "w-[260px] px-4",
                className
            )}
        >
            {/* Brand Header */}
            <div className={cn("mb-8 flex items-center gap-3 transition-all duration-300", isCollapsed ? "justify-center px-0" : "px-2")}>
                <div className="h-10 w-10 shrink-0 rounded-xl bg-primary shadow-lg shadow-primary/25 flex items-center justify-center text-primary-foreground ring-2 ring-white/10 overflow-hidden">
                    {isBrandingLoading ? (
                        <div className="h-full w-full animate-pulse bg-white/20" />
                    ) : (companyInfo?.logoUrl ? (
                        <img src={companyInfo.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                        <Building2 className="h-6 w-6" />
                    ))}
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col min-w-0 overflow-hidden whitespace-nowrap text-left flex-1">
                        {isBrandingLoading ? (
                            <div className="space-y-1">
                                <div className="h-4 w-24 animate-pulse bg-white/20 rounded" />
                                <div className="h-3 w-16 animate-pulse bg-white/20 rounded" />
                            </div>
                        ) : (
                            <>
                                <span className="text-foreground font-bold tracking-tight text-lg leading-tight truncate">
                                    {companyInfo?.name?.trim() || "FinCorp"}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-primary truncate">
                                    {companyInfo?.tagline?.trim() || "Enterprise"}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <TooltipProvider delayDuration={0}>
                <div className="space-y-1.5 flex-1 px-2 w-full">
                    {!isCollapsed && <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/50 mb-4 pl-3 whitespace-nowrap">Menu</p>}

                    {visibleNavItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                        const LinkContent = (
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-xl text-sm font-semibold transition-all duration-200 group relative",
                                    isCollapsed ? "justify-center w-10 h-10 mx-auto p-0" : "justify-between px-3 py-2.5 w-full",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                )}
                            >
                                <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                                    <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground/70 group-hover:text-foreground")} />
                                    {!isCollapsed && <span>{item.title}</span>}
                                </div>
                            </Link>
                        );

                        if (isCollapsed) {
                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>{LinkContent}</TooltipTrigger>
                                    <TooltipContent side="right" className="font-semibold bg-foreground text-background border-none ml-2">
                                        {item.title}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return <div key={item.href}>{LinkContent}</div>;
                    })}
                </div>
            </TooltipProvider>

            {/* User Profile & Toggle Footer */}
            <div className={cn("mt-auto w-full transition-all duration-300", isCollapsed ? "px-0 pb-4 items-center flex flex-col gap-4" : "px-3 pb-4")}>

                {/* Island Container (Only in expanded mode) */}
                <div className={cn(
                    "flex flex-col gap-1 transition-all",
                    !isCollapsed && "bg-muted/40 p-1.5 rounded-2xl border border-border/20 shadow-sm"
                )}>
                    {/* User Profile */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className={cn(
                                "flex items-center gap-3 rounded-xl transition-all cursor-pointer group",
                                isCollapsed ? "justify-center h-10 w-10 p-0 hover:bg-muted/60 rounded-full" : "p-2 hover:bg-background hover:shadow-xs"
                            )}>
                                <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary ring-1 ring-primary/20">
                                    {initials}
                                </div>
                                {!isCollapsed && (
                                    <>
                                        <div className="flex flex-col min-w-0 overflow-hidden text-left">
                                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{user?.name || 'User'}</span>
                                            <span className="text-[11px] text-muted-foreground truncate font-medium">{user?.email || 'Loading...'}</span>
                                        </div>
                                        <Settings className="h-4 w-4 ml-auto text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                    </>
                                )}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]" sideOffset={10}>
                            <DropdownMenuLabel>My Account ({user?.role})</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)} className="cursor-pointer">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                <span>Change Password</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Appearance</DropdownMenuLabel>

                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Sun className="mr-2 h-4 w-4" />
                                    <span>Theme</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => setTheme("light")}>
                                            <Sun className="mr-2 h-4 w-4" /> Light
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                                            <Moon className="mr-2 h-4 w-4" /> Dark
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTheme("system")}>
                                            <Monitor className="mr-2 h-4 w-4" /> System
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>

                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Palette className="mr-2 h-4 w-4" />
                                    <span>Accent</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        {[
                                            { name: "Zinc", id: "zinc", color: "bg-zinc-600" },
                                            { name: "Slate", id: "slate", color: "bg-slate-600" },
                                            { name: "Blue", id: "blue", color: "bg-blue-600" },
                                            { name: "Violet", id: "violet", color: "bg-violet-600" },
                                            { name: "Rose", id: "rose", color: "bg-rose-600" },
                                            { name: "Orange", id: "orange", color: "bg-orange-600" },
                                            { name: "Green", id: "green", color: "bg-emerald-600" },
                                        ].map(c => (
                                            <DropdownMenuItem key={c.id} onClick={() => changeColorTheme(c.id)}>
                                                <div className={`mr-2 h-4 w-4 rounded-full ${c.color}`} />
                                                {c.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Change Password Dialog */}
                    <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Change Password</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <Label>Current Password</Label>
                                    <Input
                                        type="password"
                                        value={passwordState.current}
                                        onChange={(e) => setPasswordState({ ...passwordState, current: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>New Password</Label>
                                    <Input
                                        type="password"
                                        value={passwordState.new}
                                        onChange={(e) => setPasswordState({ ...passwordState, new: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleChangePassword} className="w-full">Update Password</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Toggle Button */}
                    <div className={cn("px-1", isCollapsed && "px-0")}>
                        <Button
                            variant="ghost"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={cn(
                                "flex items-center gap-3 text-muted-foreground/70 hover:text-foreground transition-all duration-200",
                                isCollapsed ? "justify-center h-10 w-10 p-0 rounded-full hover:bg-muted/60 mt-2" : "w-full justify-between h-8 hover:bg-background/50 px-2"
                            )}
                        >
                            {isCollapsed ? (
                                <PanelLeftOpen className="h-5 w-5" />
                            ) : (
                                <>
                                    <span className="text-xs font-medium tracking-wide">Collapse</span>
                                    <PanelLeftClose className="h-4 w-4 opacity-50" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

        </aside>
    );
}
