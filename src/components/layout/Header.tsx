"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "./AppSidebar";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/ui/mode-toggle";

export function Header() {
    const pathname = usePathname();

    // Get current page title based on path
    const getTitle = () => {
        if (pathname === "/") return "Counter & Quick Payments";
        if (pathname.startsWith("/clients")) return "Client Management";
        if (pathname.startsWith("/loans")) return "Loan Portfolio";
        if (pathname.startsWith("/settings")) return "System Settings";
        return "Dashboard";
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background/70 px-4 backdrop-blur-md md:px-6">
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <AppSidebar className="flex w-full h-full border-none shadow-none" />
                    </SheetContent>
                </Sheet>
                <h1 className="text-lg font-semibold md:text-xl text-foreground/80">{getTitle()}</h1>
            </div>
            <div className="flex items-center gap-4">
                {/* Place for global search or notifications if needed */}
                <div className="text-sm text-muted-foreground hidden sm:block">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <ModeToggle />
            </div>
        </header>
    );
}
