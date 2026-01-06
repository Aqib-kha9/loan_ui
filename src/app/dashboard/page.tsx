"use client";

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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Mock Data ---

const collectionData = [
    { name: "Jul", value: 35 },
    { name: "Aug", value: 42 },
    { name: "Sep", value: 38 },
    { name: "Oct", value: 55 },
    { name: "Nov", value: 48 },
    { name: "Dec", value: 65 },
];

const loanStatusData = [
    { name: "Active", value: 65, color: "var(--chart-1)" },
    { name: "Closed", value: 25, color: "var(--chart-2)" },
    { name: "Pending", value: 5, color: "var(--chart-3)" },
    { name: "NPA", value: 5, color: "var(--chart-4)" },
];

const recentActivity = [
    {
        id: 1,
        type: "disbursal",
        customer: "Rajesh Kumar",
        amount: "50,000",
        date: "Today, 10:42 AM",
        status: "Success",
    },
    {
        id: 2,
        type: "payment",
        customer: "Sarah Khan",
        amount: "12,500",
        date: "Today, 09:15 AM",
        status: "Received",
    },
    {
        id: 3,
        type: "payment",
        customer: "Amit Patel",
        amount: "8,200",
        date: "Yesterday",
        status: "Received",
    },
    {
        id: 4,
        type: "disbursal",
        customer: "Tech Solutions Ltd",
        amount: "2.0 L",
        date: "Yesterday",
        status: "Processing",
    },
];

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


export default function DashboardPage() {
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
                    <Link href="/statements">
                        <Button variant="ghost" className="h-9 gap-2 text-xs font-semibold text-muted-foreground hidden md:flex hover:bg-muted/50">
                            <FileText className="h-4 w-4" /> Reports
                        </Button>
                    </Link>
                    <div className="h-5 w-[1px] bg-border mx-1 hidden md:block" />
                    <Link href="/clients">
                        <Button variant="outline" className="h-9 gap-2 text-xs font-bold border-dashed hidden sm:flex">
                            <Users className="h-4 w-4" /> Add Client
                        </Button>
                    </Link>
                    <Link href="/loans/new">
                        <Button className="h-9 gap-2 text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all">
                            <Briefcase className="h-4 w-4" /> New Disbursal
                        </Button>
                    </Link>
                </div>
            </div>

            {/* === 2. SCROLLABLE CONTENT === */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 md:space-y-6">

                {/* Key Metrics - Compact Bento */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <StatCard
                        title="Disbursed"
                        value="₹42.35 L"
                        trend="+12%"
                        trendUp={true}
                        icon={DollarSign}
                        className="p-4 rounded-2xl"
                    />
                    <StatCard
                        title="Active Customers"
                        value="2,350"
                        trend="+48"
                        trendUp={true}
                        icon={Users}
                        className="p-4 rounded-2xl"
                    />
                    <StatCard
                        title="Collection"
                        value="94.2%"
                        trend="-1.4%"
                        trendUp={false}
                        icon={CreditCard}
                        className="p-4 rounded-2xl"
                    />
                    <StatCard
                        title="NPA / Overdue"
                        value="₹1.45 L"
                        trend="12 Accs"
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
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900/50 dark:ring-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-sm">Recent Activity</h3>
                            <p className="text-[10px] text-muted-foreground">Latest movements</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                            <Link href="/statements">View All</Link>
                        </Button>
                    </div>

                    <div className="space-y-1">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="group flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-muted/50 cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                                        activity.type === 'disbursal'
                                            ? "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-900/50"
                                            : "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-900/50"
                                    )}>
                                        {activity.type === 'disbursal' ? <Briefcase className="h-3.5 w-3.5" /> : <DollarSign className="h-3.5 w-3.5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs text-foreground">{activity.customer}</p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            {activity.type === 'disbursal' ? 'Disbursed' : 'Payment'}
                                            <span className="opacity-50">•</span>
                                            {activity.date}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={cn("font-bold text-sm font-mono", activity.type === 'disbursal' ? "text-foreground" : "text-emerald-600")}>
                                        {activity.type === 'disbursal' ? '-' : '+'}₹{activity.amount}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Spacer for Mobile */}
                <div className="h-12 md:hidden"></div>
            </div>



        </div>
    );
}
