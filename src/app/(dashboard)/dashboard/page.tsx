"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    DollarSign,
    Users,
    CreditCard,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Briefcase,
    FileText,
    TrendingUp,
    MoreHorizontal
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
type DashboardStats = {
    totalDisbursed: number;
    activeCustomers: number;
    collectionRate: string;
    npaAmount: number;
    recentActivities: any[];
    collectionTrend: { name: string; value: number }[];
    portfolioStatus: { name: string; value: number; color: string }[];
};

// --- Components ---

function StatCard({
    title,
    value,
    trend,
    trendUp,
    icon: Icon,
    className
}: {
    title: string;
    value: string;
    trend: string;
    trendUp?: boolean;
    icon: any;
    className?: string
}) {
    return (
        <div className={cn("relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-zinc-900/50 dark:ring-white/10", className)}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold tracking-tight">{value}</h3>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary ring-1 ring-primary/20">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
                <Badge variant="secondary" className={cn("rounded-lg px-2 font-medium", trendUp ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "text-rose-600 bg-rose-50 dark:bg-rose-950/30")}>
                    {trendUp ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                    {trend}
                </Badge>
                <span className="text-xs text-muted-foreground">vs. last month</span>
            </div>
        </div>
    );
}

function ActionTile({
    title,
    icon: Icon,
    href,
    colorClass
}: {
    title: string;
    icon: any;
    href: string;
    colorClass: string
}) {
    return (
        <Link href={href} className="group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-zinc-900/50 dark:ring-white/10">
            <div className={cn("absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10", colorClass)} />
            <div className={cn("rounded-2xl p-4 transition-transform group-hover:scale-110", colorClass.replace("bg-", "text-").replace("/5", "/100").replace("bg-", "bg-opacity-10 bg-"))}>
                {/* Hacky way to derive light bg from color class, ideally pass separate props */}
                <Icon className={cn("h-8 w-8", colorClass.replace("bg-", "text-").replace("/5", ""))} />
            </div>
            <span className="font-semibold text-foreground/80 group-hover:text-foreground">{title}</span>
        </Link>
    );
}


import { useAuth } from "@/components/providers/auth-provider";
import { PERMISSIONS } from "@/lib/constants/permissions";
import AccessDenied from "@/components/auth/access-denied";

function DashboardSkeleton() {
    return (
        <div className="-m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] h-[calc(100vh-1rem)] bg-muted/10 flex flex-col overflow-hidden">
            {/* Header Skeleton */}
            <div className="h-12 md:h-16 border-b border-border/50 flex items-center justify-between px-6 bg-white shrink-0 dark:bg-zinc-950 sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-9 w-24 hidden md:block" />
                    <Skeleton className="h-9 w-24 hidden sm:block" />
                    <Skeleton className="h-9 w-32" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 md:space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-black/5 dark:border-white/10 space-y-4">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-10 rounded-xl" />
                            </div>
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-6 w-32 rounded-lg" />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="col-span-1 lg:col-span-2 bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-black/5 dark:border-white/10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                    </div>
                    <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-black/5 dark:border-white/10">
                        <div className="space-y-2 mb-6">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-3 w-36" />
                        </div>
                        <div className="flex justify-center mb-8">
                            <Skeleton className="h-[150px] w-[150px] rounded-full" />
                        </div>
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="flex gap-2 items-center">
                                        <Skeleton className="h-3 w-3 rounded-full" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                    <Skeleton className="h-3 w-8" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-black/5 dark:border-white/10">
                    <div className="flex justify-between mb-6">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="flex gap-4 items-center">
                                    <Skeleton className="h-10 w-10 rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { checkPermission, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (authLoading) return;

            if (!checkPermission(PERMISSIONS.VIEW_DASHBOARD)) {
                setStatsLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/dashboard/stats');
                const data = await res.json();
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (err) {
                console.error("Failed to fetch dash stats", err);
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, [authLoading, checkPermission]);

    if (authLoading || statsLoading) {
        return <DashboardSkeleton />;
    }

    if (!checkPermission(PERMISSIONS.VIEW_DASHBOARD)) {
        return <AccessDenied message="You do not have permission to view the analytics dashboard." />;
    }

    if (!stats) return null;

    const collectionData = stats.collectionTrend;
    const loanStatusData = stats.portfolioStatus;
    const recentActivityLogs = stats.recentActivities;

    return (
        <div className="-m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] h-[calc(100vh-1rem)] bg-muted/10 flex flex-col overflow-hidden">

            {/* === 1. STICKY HEADER === */}
            <div className="h-12 md:h-16 border-b border-border/50 flex items-center justify-between px-6 bg-white/95 backdrop-blur-xl shrink-0 dark:bg-zinc-950/95 sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center text-primary shadow-sm">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-none tracking-tight">Dashboard</h1>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Overview & Analytics</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {checkPermission(PERMISSIONS.VIEW_REPORTS) && (
                        <Link href="/statements">
                            <Button variant="ghost" className="h-9 gap-2 text-xs font-semibold text-muted-foreground hidden md:flex hover:bg-muted/50">
                                <FileText className="h-4 w-4" /> Reports
                            </Button>
                        </Link>
                    )}
                    <div className="h-5 w-[1px] bg-border mx-1 hidden md:block" />
                    {checkPermission(PERMISSIONS.CREATE_CLIENT) && (
                        <Link href="/clients">
                            <Button variant="outline" className="h-9 gap-2 text-xs font-bold border-dashed hidden sm:flex">
                                <Users className="h-4 w-4" /> Add Client
                            </Button>
                        </Link>
                    )}
                    {checkPermission(PERMISSIONS.CREATE_LOAN) && (
                        <Link href="/loans/new">
                            <Button className="h-9 gap-2 text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all">
                                <Briefcase className="h-4 w-4" /> New Disbursal
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* === 2. SCROLLABLE CONTENT === */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 md:space-y-6">

                {/* Key Metrics - Compact Bento */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <StatCard
                        title="Portfolio Outstanding"
                        value={`₹${(stats.totalDisbursed / 100000).toFixed(2)} L`}
                        trend="+100%"
                        trendUp={true}
                        icon={DollarSign}
                        className="p-4 rounded-2xl"
                    />
                    <StatCard
                        title="Active Customers"
                        value={stats.activeCustomers.toLocaleString()}
                        trend="+0"
                        trendUp={true}
                        icon={Users}
                        className="p-4 rounded-2xl"
                    />
                    <StatCard
                        title="Recovery Rate"
                        value={`${stats.collectionRate}%`}
                        trend="Real-time"
                        trendUp={true}
                        icon={CreditCard}
                        className="p-4 rounded-2xl"
                    />
                    <StatCard
                        title="NPA / Overdue"
                        value={`₹${(stats.npaAmount / 100000).toFixed(2)} L`}
                        trend="Immediate"
                        trendUp={false}
                        icon={Activity}
                        className="p-4 rounded-2xl"
                    />
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Main Chart */}
                    <div className="col-span-1 lg:col-span-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900/50 dark:ring-white/10">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-sm">Collection Trends</h3>
                                <p className="text-[10px] text-muted-foreground">Monthly repayment performance</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={collectionData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                                    <Tooltip
                                        cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: 'var(--background)', fontSize: '12px' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={30} className="fill-primary" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Portfolio Status */}
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900/50 dark:ring-white/10">
                        <h3 className="font-semibold text-sm mb-0.5">Portfolio Status</h3>
                        <p className="text-[10px] text-muted-foreground mb-4">Distribution by status</p>

                        <div className="h-[160px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={loanStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                                        {loanStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <span className="block text-xl font-bold">100%</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            {loanStatusData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-muted-foreground">{item.name}</span>
                                    </div>
                                    <span className="font-medium">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                {checkPermission(PERMISSIONS.VIEW_ACTIVITY_LOG) && (
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900/50 dark:ring-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-sm">Recent Activity</h3>
                                <p className="text-[10px] text-muted-foreground">Latest movements</p>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                                <Link href="/activity">View All</Link>
                            </Button>
                        </div>

                        <div className="space-y-1">
                            {recentActivityLogs.length === 0 ? (
                                <p className="text-center py-8 text-xs text-muted-foreground italic">No recent activity detected.</p>
                            ) : recentActivityLogs.map((activity) => (
                                <div key={activity._id} className="group flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-muted/50 cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                                            activity.type === 'Loan'
                                                ? "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-900/50"
                                                : "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-900/50"
                                        )}>
                                            {activity.type === 'Loan' ? <Briefcase className="h-3.5 w-3.5" /> : <DollarSign className="h-3.5 w-3.5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-foreground truncate max-w-[150px]">{activity.entityName || 'System'}</p>
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                {activity.action || activity.type}
                                                <span className="opacity-50">•</span>
                                                {format(new Date(activity.timestamp), 'h:mm a, MMM dd')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("font-bold text-sm font-mono", activity.amount && activity.amount < 0 ? "text-rose-600" : "text-emerald-600")}>
                                            {activity.amount ? (activity.amount < 0 ? '-' : '+') + '₹' + Math.abs(activity.amount).toLocaleString() : '-'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bottom Spacer for Mobile */}
                <div className="h-12 md:hidden"></div>
            </div>



        </div>
    );
}
