"use client";

import { useState, useEffect } from "react";
import { ActivityLog } from "@/lib/activity-logger";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Activity,
    Filter,
    Calendar as CalendarIcon,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    SlidersHorizontal,
    X,
    FilterX,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { PERMISSIONS } from "@/lib/constants/permissions";
import AccessDenied from "@/components/auth/access-denied";

// Filter Types
type FilterState = {
    types: string[];
    actions: string[];
    minAmount: string;
    maxAmount: string;
};

export default function ActivityPage() {
    const getTodayString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const { user, checkPermission, isLoading } = useAuth();
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [filterDate, setFilterDate] = useState<string>(getTodayString());
    const [searchTerm, setSearchTerm] = useState("");

    // Advanced Filters State
    const [filters, setFilters] = useState<FilterState>({
        types: [],
        actions: [],
        minAmount: "",
        maxAmount: ""
    });

    const loadData = async () => {
        if (isLoading || !checkPermission(PERMISSIONS.VIEW_ACTIVITY_LOG)) return;

        setIsDataLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);

            if (filterDate) {
                // Convert Local Date (YYYY-MM-DD) to UTC Range
                const [y, m, d] = filterDate.split('-').map(Number);
                const start = new Date(y, m - 1, d, 0, 0, 0, 0);
                const end = new Date(y, m - 1, d, 23, 59, 59, 999);

                params.append('startDate', start.toISOString());
                params.append('endDate', end.toISOString());
            }

            if (filters.types.length > 0) params.append('types', filters.types.join(','));
            if (filters.actions.length > 0) params.append('actions', filters.actions.join(','));
            if (filters.minAmount) params.append('minAmount', filters.minAmount);
            if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);

            const res = await fetch(`/api/activity?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                let logs = data.activities.map((a: any) => ({ ...a, id: a._id }));
                setActivities(logs);
            }
        } catch (error) {
            console.error("Failed to load activities:", error);
        } finally {
            setIsDataLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [searchTerm, filterDate, filters]);

    // Polling with current filters
    useEffect(() => {
        const interval = setInterval(loadData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [searchTerm, filterDate, filters]);

    const filteredActivities = activities;

    // Helper to toggle array items
    const toggleFilter = (category: 'types' | 'actions', value: string) => {
        setFilters(prev => {
            const current = prev[category];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
    };

    const clearFilters = () => {
        setFilters({
            types: [],
            actions: [],
            minAmount: "",
            maxAmount: ""
        });
        setSearchTerm("");
        // Keep date? User request implies "advanced filters", usually keeps context.
    };

    const hasActiveFilters = filters.types.length > 0 || filters.actions.length > 0 || filters.minAmount || filters.maxAmount || searchTerm;

    if (isLoading) return null;
    if (!checkPermission(PERMISSIONS.VIEW_ACTIVITY_LOG)) return <AccessDenied message="You do not have permission to view activity logs." />;

    return (
        <div className="-m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] h-[calc(100vh-5rem)] flex flex-col bg-muted/5 overflow-hidden">

            {/* STICKY HEADER */}
            <header className="h-16 border-b bg-background/80 backdrop-blur z-20 sticky top-0 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight leading-none">Activity Log</h1>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">System-wide transaction history</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative hidden md:block w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search activity..."
                            className="pl-9 h-9 bg-muted/50 border-transparent focus:bg-background focus:border-input transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Separator orientation="vertical" className="h-8 hidden md:block" />

                    {/* Date Filter */}
                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
                        <div className="px-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <CalendarIcon className="h-3.5 w-3.5" />
                        </div>
                        <Input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="h-7 w-auto border-0 bg-transparent shadow-none focus-visible:ring-0 min-w-[130px] text-xs p-1"
                        />
                    </div>

                    {/* Advanced Filter Popover */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className={cn("h-9 border-dashed gap-2", (filters.types.length > 0 || filters.actions.length > 0) && "border-primary bg-primary/5 text-primary")}>
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Filters</span>
                                {(filters.types.length > 0 || filters.actions.length > 0) && (
                                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary text-primary-foreground">
                                        {filters.types.length + filters.actions.length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="end">
                            <div className="p-4 border-b bg-muted/30">
                                <h4 className="font-medium leading-none mb-1">Advanced Filters</h4>
                                <p className="text-xs text-muted-foreground">Refine your activity view.</p>
                            </div>
                            <div className="p-4 space-y-4">
                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Activity Type</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Loan', 'Payment', 'System'].map(type => (
                                            <div key={type} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`type-${type}`}
                                                    checked={filters.types.includes(type)}
                                                    onCheckedChange={() => toggleFilter('types', type)}
                                                />
                                                <Label htmlFor={`type-${type}`} className="text-sm font-medium">{type}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                {/* Action Filter */}
                                <div className="space-y-2">
                                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Disbursed', 'Received', 'Created', 'Updated'].map(action => (
                                            <div key={action} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`action-${action}`}
                                                    checked={filters.actions.includes(action)}
                                                    onCheckedChange={() => toggleFilter('actions', action)}
                                                />
                                                <Label htmlFor={`action-${action}`} className="text-sm font-medium">{action}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                {/* Amount Filter */}
                                <div className="space-y-2">
                                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount Range</h5>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                                            <Input
                                                placeholder="Min"
                                                className="h-8 pl-6 text-xs"
                                                type="number"
                                                value={filters.minAmount}
                                                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                                            />
                                        </div>
                                        <span className="text-muted-foreground text-xs self-center">-</span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                                            <Input
                                                placeholder="Max"
                                                className="h-8 pl-6 text-xs"
                                                type="number"
                                                value={filters.maxAmount}
                                                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {(hasActiveFilters) && (
                                <div className="p-2 border-t bg-muted/30">
                                    <Button variant="ghost" className="w-full h-8 text-xs text-muted-foreground hover:text-red-500" onClick={clearFilters}>
                                        <FilterX className="h-3 w-3 mr-2" /> Reset All Filters
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>

                    {/* Quick Clear (if filters active) */}
                    {hasActiveFilters && (
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" onClick={clearFilters} title="Clear all filters">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </header>

            {/* SCROLLABLE CONTENT */}
            <main className="flex-1 overflow-y-auto p-2 md:p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent border-b border-border">
                                <TableHead className="w-[180px] font-bold text-xs uppercase tracking-wider py-4 pl-6">Date & Time</TableHead>
                                <TableHead className="w-[250px] font-bold text-xs uppercase tracking-wider py-4">Entity / User</TableHead>
                                <TableHead className="w-[150px] font-bold text-xs uppercase tracking-wider py-4">Type</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Description</TableHead>
                                <TableHead className="w-[150px] font-bold text-xs uppercase tracking-wider text-right py-4 pr-6">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isDataLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-[400px]">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="relative">
                                                <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                                <Activity className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                            </div>
                                            <p className="text-sm font-medium animate-pulse text-muted-foreground">Syncing activities...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredActivities.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-[400px] text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                                                <Filter className="h-6 w-6 opacity-20" />
                                            </div>
                                            <p className="font-medium">No results match your filters</p>
                                            <p className="text-xs">Try clearing filters or adjusting your date range.</p>
                                            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                                                Clear Filters
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredActivities.map((log) => (
                                    <TableRow key={log.id} className="group hover:bg-muted/50 transition-colors border-b last:border-0 border-border/50">
                                        <TableCell className="font-mono text-xs text-muted-foreground py-4 pl-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground">{format(new Date(log.timestamp), 'dd MMM yyyy')}</span>
                                                <span className="opacity-50">{format(new Date(log.timestamp), 'h:mm a')}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-zinc-900 border shadow-sm",
                                                    log.type === 'Loan' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                                                        log.type === 'Payment' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' :
                                                            'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                                                )}>
                                                    {log.entityName ? log.entityName.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-foreground">{log.entityName || 'System'}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                                        BY: {log.user || 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <Badge variant="outline" className={cn(
                                                "font-semibold border text-[10px] px-2 py-0.5",
                                                log.action === 'Disbursed' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' :
                                                    log.action === 'Received' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' :
                                                        'bg-muted text-muted-foreground border-border'
                                            )}>
                                                {log.action || log.type}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-sm text-muted-foreground py-4 max-w-[400px]">
                                            <p className="line-clamp-2 md:line-clamp-1" title={log.description}>
                                                {log.description}
                                            </p>
                                        </TableCell>

                                        <TableCell className="text-right py-4 pr-6">
                                            {log.amount ? (
                                                <span className={cn(
                                                    "font-mono font-bold text-sm flex items-center justify-end gap-1.5",
                                                    log.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                                )}>
                                                    {log.amount > 0 ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                                                    ₹{Math.abs(log.amount).toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground/30 text-xs font-mono">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </div>
    );
}
