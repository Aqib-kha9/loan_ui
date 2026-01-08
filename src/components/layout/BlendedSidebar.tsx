"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    Activity // New Icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Quick Collect", href: "/", icon: CreditCard },
    { title: "Loan Portfolio", href: "/loans", icon: PieChart },
    { title: "Statements", href: "/statements", icon: FileText },
    { title: "Customers", href: "/clients", icon: Users },
    { title: "Activity", href: "/activity", icon: Activity }, // New Link
    { title: "Settings", href: "/settings", icon: Settings },
];

export function BlendedSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "flex flex-col h-full text-muted-foreground py-6 z-50 transition-all duration-300 ease-in-out relative",
                isCollapsed ? "w-[80px] items-center px-2" : "w-[260px] px-4",
                className
            )}
        >


            {/* Toggle Button (Visible within layout if hover is tricky, placed at bottom usually, but let's put a clear one near brand for now) */}
            <div className={cn("mb-8 flex items-center gap-3 transition-all duration-300", isCollapsed ? "justify-center px-0" : "px-2")}>
                <div className="h-10 w-10 shrink-0 rounded-xl bg-primary shadow-lg shadow-primary/25 flex items-center justify-center text-primary-foreground ring-2 ring-white/10">
                    <Building2 className="h-6 w-6" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col min-w-0 overflow-hidden whitespace-nowrap">
                        <span className="text-foreground font-bold tracking-tight text-lg leading-tight truncate">FinCorp</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-primary truncate">Enterprise</span>
                    </div>
                )}
            </div>



            {/* Navigation Links */}
            <TooltipProvider delayDuration={0}>
                <div className="space-y-1.5 flex-1 px-2 w-full">
                    {!isCollapsed && <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/50 mb-4 pl-3 whitespace-nowrap">Menu</p>}

                    {navItems.map((item) => {
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




            {/* 5. User Profile & Toggle Footer */}
            <div className={cn("mt-auto w-full transition-all duration-300", isCollapsed ? "px-0 pb-4 items-center flex flex-col gap-4" : "px-3 pb-4")}>

                {/* Island Container (Only in expanded mode) */}
                <div className={cn(
                    "flex flex-col gap-1 transition-all",
                    !isCollapsed && "bg-muted/40 p-1.5 rounded-2xl border border-border/20 shadow-sm"
                )}>
                    {/* User Profile */}
                    <div className={cn(
                        "flex items-center gap-3 rounded-xl transition-all cursor-pointer group",
                        isCollapsed ? "justify-center h-10 w-10 p-0 hover:bg-muted/60 rounded-full" : "p-2 hover:bg-background hover:shadow-xs"
                    )}>
                        <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary ring-1 ring-primary/20">
                            AD
                        </div>
                        {!isCollapsed && (
                            <>
                                <div className="flex flex-col min-w-0 overflow-hidden">
                                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">Admin User</span>
                                    <span className="text-[11px] text-muted-foreground truncate font-medium">admin@fincorp.com</span>
                                </div>
                                <Settings className="h-4 w-4 ml-auto text-muted-foreground/40 group-hover:text-primary transition-colors" />
                            </>
                        )}
                    </div>

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
