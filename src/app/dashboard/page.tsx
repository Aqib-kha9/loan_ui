"use client";

import Link from "next/link";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DollarSign,
    Users,
    CreditCard,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Briefcase,
    FileText
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

// Mock Data for Charts
const collectionData = [
    { name: "Jul", value: 35 },
    { name: "Aug", value: 42 },
    { name: "Sep", value: 38 },
    { name: "Oct", value: 55 },
    { name: "Nov", value: 48 },
    { name: "Dec", value: 65 },
];

const loanTypeData = [
    { name: "Personal", value: 45, color: "#6366f1" }, // Indigo
    { name: "Business", value: 30, color: "#ec4899" }, // Pink
    { name: "Vehicle", value: 15, color: "#14b8a6" }, // Teal
    { name: "Mortgage", value: 10, color: "#f59e0b" }, // Amber
];

const resentActivity = [
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
        amount: "2,00,000",
        date: "Yesterday",
        status: "Processing",
    },
];

export default function DashboardPage() {
    return (
        <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* 1. HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Overview of your lending business performance.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/statements">
                        <Button variant="outline" className="hidden sm:flex">
                            <Calendar className="mr-2 h-4 w-4" />
                            Download Report
                        </Button>
                    </Link>
                    <Link href="/loans/new" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto">
                            <Briefcase className="mr-2 h-4 w-4" />
                            New Disbursal
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 2. STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Disbursed
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹42,35,000</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                            <span className="text-emerald-500 font-medium">+12%</span> from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Customers
                        </CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,350</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                            <span className="text-emerald-500 font-medium">+48</span> new this month
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Collection Efficiency
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94.2%</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                            <span className="text-red-500 font-medium">-1.4%</span> vs target
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            NPA / Overdue
                        </CardTitle>
                        <Activity className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹1,45,200</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across 12 accounts
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* 3. CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {/* REVENUE TREND */}
                <Card className="col-span-1 lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Collection Trend</CardTitle>
                        <CardDescription>
                            Monthly repayment collection for the last 6 months.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={collectionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value: number) => `₹${value}k`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="currentColor"
                                        radius={[4, 4, 0, 0]}
                                        className="fill-primary"
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* LOAN DISTRIBUTION */}
                <Card className="col-span-1 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Portfolio Distribution</CardTitle>
                        <CardDescription>
                            Active loans by category.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={loanTypeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {loanTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Legend Overlay - Simple */}
                            <div className="absolute bottom-0 w-full flex justify-center gap-4 text-xs text-muted-foreground">
                                {loanTypeData.map((item, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 4. RECENT ACTIVITY & ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest transactions and updates.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {resentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-9 w-9 rounded-full flex items-center justify-center border",
                                            activity.type === 'disbursal' ? "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/10 dark:border-blue-900/50" : "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/10 dark:border-emerald-900/50"
                                        )}>
                                            {activity.type === 'disbursal' ? <Briefcase className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium leading-none">{activity.customer}</p>
                                            <p className="text-xs text-muted-foreground">{activity.type === 'disbursal' ? 'Loan Disbursed' : 'EMI Received'} • {activity.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">₹{activity.amount}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase">{activity.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Link href="/loans/new" className="w-full">
                            <Button variant="outline" className="h-24 w-full flex flex-col items-center justify-center gap-2 border-dashed border-2 hover:border-solid hover:border-primary hover:bg-primary/5 transition-all">
                                <Briefcase className="h-6 w-6 text-muted-foreground" />
                                New Application
                            </Button>
                        </Link>
                        <Link href="/" className="w-full">
                            <Button variant="outline" className="h-24 w-full flex flex-col items-center justify-center gap-2 border-dashed border-2 hover:border-solid hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all">
                                <DollarSign className="h-6 w-6 text-muted-foreground" />
                                Record Payment
                            </Button>
                        </Link>
                        <Link href="/clients" className="w-full">
                            <Button variant="outline" className="h-24 w-full flex flex-col items-center justify-center gap-2 border-dashed border-2 hover:border-solid hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all">
                                <Users className="h-6 w-6 text-muted-foreground" />
                                Add Customer
                            </Button>
                        </Link>
                        <Link href="/statements" className="w-full">
                            <Button variant="outline" className="h-24 w-full flex flex-col items-center justify-center gap-2 border-dashed border-2 hover:border-solid hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                                Generate Report
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Utility for conditional classes (if not already imported globally)
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
