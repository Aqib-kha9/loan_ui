"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, ArrowRight, Building2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useSettings } from "@/components/providers/settings-provider";

// Validation Schema
const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

import { useAuth } from "@/components/providers/auth-provider"; // Import useAuth

// ...

export default function LoginPage() {
    const router = useRouter();
    const { companySettings } = useSettings();
    const { refreshAuth } = useAuth(); // Get refreshAuth
    const [isLoading, setIsLoading] = useState(false);

    // Helper to check if logo is a valid URL (simplistic check)
    const hasLogo = companySettings.logoUrl && companySettings.logoUrl.startsWith("http");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            // REFRESH AUTH STATE BEFORE REDIRECTING
            await refreshAuth();

            toast.success("Welcome back!", {
                description: "You have successfully logged in.",
            });

            // Determine Redirect Path based on Permissions
            let redirectPath = "/dashboard";
            const user = data.user;
            const perms = user.permissions || [];

            // Priority Order for Landing Page
            if (user.role === 'Admin' || perms.includes('view_dashboard')) {
                redirectPath = "/dashboard";
            } else if (perms.includes('create_payment')) {
                redirectPath = "/";
            } else if (perms.includes('view_loans')) {
                redirectPath = "/loans";
            } else if (perms.includes('view_clients')) {
                redirectPath = "/clients";
            } else if (perms.includes('view_reports')) {
                redirectPath = "/statements";
            } else if (perms.includes('view_settings')) {
                redirectPath = "/settings";
            }

            // Redirect
            router.push(redirectPath);
            router.refresh();

        } catch (error: any) {
            toast.error(error.message || "An error occurred during login");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full min-h-screen grid lg:grid-cols-2 bg-background relative selection:bg-primary/20 overflow-hidden">

            {/* --- Global Background Elements --- */}

            {/* 1. Subtle Grid Texture */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

            {/* 2. Primary ambient glow (Unified) */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />


            {/* --- Left Side: Brand Section --- */}
            <div className="hidden lg:flex flex-col justify-between p-16 xl:p-24 relative z-10">

                {/* Brand Header */}
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
                    {hasLogo ? (
                        <div className="h-16 w-auto flex items-center justify-center">
                            {/* Using standard img for external URLs, or Next Image if configured. Using img for broad compatibility with user input URLs */}
                            <img src={companySettings.logoUrl} alt={companySettings.name} className="h-full w-auto object-contain" />
                        </div>
                    ) : (
                        <div className="h-14 w-14 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-primary/10 shadow-lg shadow-primary/5">
                            <Building2 className="h-7 w-7 text-primary" />
                        </div>
                    )}
                    <span className="text-xl font-bold tracking-tight opacity-90">{companySettings.name}</span>
                </div>

                {/* Main Copy */}
                <div className="space-y-8 max-w-xl animate-in fade-in slide-in-from-left-4 duration-1000 delay-100">
                    <h1 className="text-7xl font-bold tracking-tighter leading-[1.05] text-foreground">
                        Powering <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                            Global Finance.
                        </span>
                    </h1>
                    <p className="text-2xl text-muted-foreground/80 font-light leading-relaxed max-w-md">
                        The secure, scalable infrastructure for modern lending and asset management.
                    </p>

                    {/* Feature List (Pills) */}
                    {/* <div className="flex flex-wrap gap-3 pt-6">
                        {[
                            "Portfolio Analytics",
                            "Bank-Grade Security",
                            "Compliance Ready"
                        ].map((item, i) => (
                            <div key={i} className="px-4 py-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm text-sm font-medium text-muted-foreground shadow-sm">
                                {item}
                            </div>
                        ))}
                    </div> */}
                </div>

                {/* Footer Copyright */}
                <div className="text-sm text-muted-foreground opacity-50 font-medium">
                    © {new Date().getFullYear()} {companySettings.name} Systems
                </div>
            </div>

            {/* --- Right Side: Form Section --- */}
            <div className="flex flex-col justify-center items-center p-8 relative z-10">

                {/* Theme Toggle */}
                <div className="absolute top-6 right-6">
                    <ModeToggle className="bg-transparent border-0 hover:bg-muted/50 transition-colors" />
                </div>

                {/* Form Container (Subtle Glass Card) */}
                <div className="w-full max-w-[500px] p-10 rounded-3xl border border-border/40 bg-background/40 backdrop-blur-sm shadow-xl shadow-black/5 dark:shadow-black/20 animate-in zoom-in-95 fade-in duration-700">

                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
                        {hasLogo ? (
                            <img src={companySettings.logoUrl} alt={companySettings.name} className="h-10 w-auto object-contain" />
                        ) : (
                            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                        )}
                        <span className="text-xl font-bold text-foreground">{companySettings.name}</span>
                    </div>

                    <div className="space-y-2 mb-8 text-center lg:text-left">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h2>
                        <p className="text-sm text-muted-foreground">Enter your credentials to access the secure portal.</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Email Address</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/50 group-hover:text-primary/70 transition-colors" />
                                                <Input
                                                    placeholder="admin@company.com"
                                                    className="h-11 pl-10 bg-muted/20 border-border/60 hover:border-primary/30 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-xl shadow-sm"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        {/* <div className="flex items-center justify-between">
                                            <FormLabel className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Password</FormLabel>
                                            <span className="text-xs font-medium text-primary hover:text-primary/80 cursor-pointer transition-colors">
                                                Forgot?
                                            </span>
                                        </div> */}
                                        <FormControl>
                                            <div className="relative group">
                                                {/* Custom 'Lock' Icon integration in input omitted for simplicity, reusing layout */}
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="h-11 pl-4 bg-muted/20 border-border/60 hover:border-primary/30 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-xl shadow-sm"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full h-11 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 rounded-xl mt-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    {/* <div className="mt-8 pt-6 border-t border-border/40 text-center">
                        <p className="text-xs text-muted-foreground">
                            Secured by <span className="font-semibold text-foreground">FinCorp S.S.O</span>
                        </p>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
