"use client";

import { useState, useEffect } from "react";
import { getActivities, ActivityLog } from "@/lib/activity-logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, CreditCard, FileText, Filter, Calendar as CalendarIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { format } from "date-fns";

export default function ActivityPage() {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default Today

    const loadData = () => {
        const allLogs = getActivities();
        if (filterDate) {
            const filtered = allLogs.filter(log => log.timestamp.split('T')[0] === filterDate);
            setActivities(filtered);
        } else {
            setActivities(allLogs);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [filterDate]);

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 h-full flex flex-col animate-in fade-in duration-500">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Global Activity Log</h1>
                    <p className="text-muted-foreground mt-1 text-sm">System-wide transaction and event history.</p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-1.5 rounded-xl border shadow-sm">
                    <div className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5" /> Filter Date
                    </div>
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="h-9 w-[140px] border-0 bg-muted/20 focus:bg-muted/30 focus:ring-0 text-sm font-medium"
                    />
                </div>
            </div>

            {/* Main Content Card */}
            <Card className="flex-1 shadow-md border-border/60 bg-card/50 overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                    <Table>
                        <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur-sm">
                            <TableRow className="hover:bg-transparent border-b border-border/60">
                                <TableHead className="w-[180px] font-bold text-xs uppercase tracking-wider py-4 pl-6">Date & Time</TableHead>
                                <TableHead className="w-[300px] font-bold text-xs uppercase tracking-wider py-4">Entity / Customer</TableHead>
                                <TableHead className="w-[150px] font-bold text-xs uppercase tracking-wider py-4">Type</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Description</TableHead>
                                <TableHead className="w-[150px] font-bold text-xs uppercase tracking-wider text-right py-4 pr-6">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-[400px] text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <CalendarIcon className="h-8 w-8 opacity-20" />
                                            <p>No activity found for this date.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                activities.map((log) => (
                                    <TableRow key={log.id} className="group hover:bg-muted/30 transition-colors border-border/40">
                                        <TableCell className="font-mono text-xs text-muted-foreground py-4 pl-6">
                                            {format(new Date(log.timestamp), 'dd/MM/yyyy')}
                                            <span className="ml-2 opacity-50">{format(new Date(log.timestamp), 'HH:mm')}</span>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border ${log.type === 'Loan' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800' :
                                                        log.type === 'Payment' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800' :
                                                            'bg-gray-50 text-gray-600 border-gray-100'
                                                    }`}>
                                                    {log.entityName ? log.entityName.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-foreground/90">{log.entityName || 'System'}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{log.user || 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <Badge variant="outline" className={`font-medium border ${log.action === 'Disbursed' ? 'bg-red-50 text-red-700 border-red-200/50' :
                                                    log.action === 'Received' ? 'bg-green-50 text-green-700 border-green-200/50' :
                                                        'bg-muted/50 text-muted-foreground'
                                                }`}>
                                                {log.action || log.type}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-sm text-muted-foreground/80 py-4 max-w-[400px] truncate" title={log.description}>
                                            {log.description}
                                        </TableCell>

                                        <TableCell className="text-right py-4 pr-6">
                                            {log.amount ? (
                                                <span className={`font-mono font-bold text-sm flex items-center justify-end gap-1 ${log.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                                                    }`}>
                                                    {log.amount > 0 ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                                                    ₹{Math.abs(log.amount).toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground/30 text-xs">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
