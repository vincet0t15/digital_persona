import Heading from '@/components/heading';
import Pagination from '@/components/paginationData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Employee } from '@/types/employee';
import { TimeLog } from '@/types/timeLogs';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, CalendarDays, Clock, Filter, LogIn, LogOut, RotateCcw } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Time Logs',
        href: '/logs',
    },
    {
        title: 'Show Time Logs',
        href: '/logs/show',
    },
];

interface PaginatedTimeLogs {
    data: TimeLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    path: string;
    links: { url: string | null; label: string; active: boolean }[];
}

interface ShowTimeLogsProps {
    employee: Employee;
    timeLogs: PaginatedTimeLogs;
    filters: {
        year: number;
        month: number | null;
    };
    availableYears: number[];
    availableMonths: number[];
}

const MONTHS = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];

export default function ShowTimeLogs({ employee, timeLogs, filters, availableYears, availableMonths }: ShowTimeLogsProps) {
    const [selectedYear, setSelectedYear] = useState(filters.year.toString());
    const [selectedMonth, setSelectedMonth] = useState(filters.month?.toString() || 'all');

    const formatTime = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDateShort = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getMonthYear = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
        });
    };

    const getMonthName = (month: number) => {
        return MONTHS.find((m) => m.value === month)?.label || '';
    };

    const groupLogsByMonth = (logs: TimeLog[]) => {
        const grouped: Record<string, TimeLog[]> = {};
        logs.forEach((log) => {
            const monthKey = getMonthYear(log.date_time);
            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }
            grouped[monthKey].push(log);
        });
        return grouped;
    };

    const handleFilterChange = (year: string, month: string) => {
        const params = new URLSearchParams();
        if (year) params.set('year', year);
        if (month && month !== 'all') params.set('month', month);

        router.get(route('logs.show', employee.id), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
        setSelectedMonth('all');
        handleFilterChange(year, 'all');
    };

    const handleMonthChange = (month: string) => {
        setSelectedMonth(month);
        handleFilterChange(selectedYear, month);
    };

    const handleReset = () => {
        const currentYear = new Date().getFullYear().toString();
        setSelectedYear(currentYear);
        setSelectedMonth('all');
        handleFilterChange(currentYear, 'all');
    };

    const groupedLogs = groupLogsByMonth(timeLogs.data);
    const sortedMonths = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Time Logs - ${employee.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading title="Time Logs" description="View and manage employee attendance records." />

                {/* Employee Profile Card */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-5">
                            <Avatar className="border-background h-20 w-20 rounded-2xl border-4 shadow-lg">
                                <AvatarImage src={employee.image ? `/storage/${employee.image}` : ''} alt={employee.name} className="object-cover" />
                                <AvatarFallback className="rounded-2xl bg-slate-100 text-2xl font-bold">
                                    {employee.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">{employee.name}</h1>
                                <p className="flex items-center gap-2 text-slate-500">
                                    <span className="font-medium">{employee.office?.name}</span>
                                </p>
                                <Badge className="rounded-sm">{employee.employment_type?.name}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Time Logs Section */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CalendarDays className="h-5 w-5" />
                                Attendance History
                            </CardTitle>

                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <Filter className="h-4 w-4" />
                                    Filter:
                                </div>

                                {/* Year Filter */}
                                <Select value={selectedYear} onValueChange={handleYearChange}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableYears.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Month Filter */}
                                <Select value={selectedMonth} onValueChange={handleMonthChange}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Months</SelectItem>
                                        {availableMonths.map((month) => (
                                            <SelectItem key={month} value={month.toString()}>
                                                {getMonthName(month)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Reset Button */}
                                <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
                                    <RotateCcw className="h-3 w-3" />
                                    Reset
                                </Button>
                            </div>
                        </div>

                        {/* Active Filter Display */}
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                            <span>Showing records for:</span>
                            <Badge variant="secondary" className="font-medium">
                                {selectedYear}
                                {selectedMonth !== 'all' && ` - ${getMonthName(parseInt(selectedMonth))}`}
                            </Badge>
                            <span className="text-slate-400">({timeLogs.total} records found)</span>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {timeLogs.data.length > 0 ? (
                            <>
                                <div className="space-y-6">
                                    {sortedMonths.map((monthYear) => (
                                        <div key={monthYear} className="space-y-3">
                                            {/* Month Header */}
                                            <div className="sticky top-0 z-10 -mx-4 border-b bg-slate-50/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80 dark:bg-slate-900/95">
                                                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                    <CalendarDays className="h-4 w-4 text-slate-500" />
                                                    {monthYear}
                                                </h3>
                                            </div>

                                            {/* Logs for this month */}
                                            <div className="space-y-2 pl-6">
                                                {groupedLogs[monthYear].map((log) => (
                                                    <div
                                                        key={log.id}
                                                        className={`flex items-center justify-between rounded-lg border p-3 shadow-sm transition-colors hover:bg-slate-50 ${
                                                            log.is_late || log.is_undertime ? 'border-red-200 bg-red-50/50' : 'bg-white'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                                                                    log.log_type === 'IN' ? 'bg-green-100' : 'bg-orange-100'
                                                                }`}
                                                            >
                                                                {log.log_type === 'IN' ? (
                                                                    <LogIn className="h-5 w-5 text-green-600" />
                                                                ) : (
                                                                    <LogOut className="h-5 w-5 text-orange-600" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                                                                        <Clock className="h-4 w-4 text-slate-400" />
                                                                        {formatTime(log.date_time)}
                                                                    </p>
                                                                    {(log.is_late || log.is_undertime) && (
                                                                        <Badge
                                                                            variant="destructive"
                                                                            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                                                                        >
                                                                            <AlertTriangle className="h-3 w-3" />
                                                                            {log.is_late && `${log.late_minutes} min late`}
                                                                            {log.is_undertime && `${log.undertime_minutes} min undertime`}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-slate-500">{formatDateShort(log.date_time)}</p>
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                log.log_type === 'IN'
                                                                    ? 'border-green-200 bg-green-50 text-green-700'
                                                                    : 'border-orange-200 bg-orange-50 text-orange-700'
                                                            }`}
                                                        >
                                                            Time {log.log_type}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="mt-6 border-t pt-4">
                                    <Pagination data={timeLogs} />
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-slate-100 p-4">
                                    <Clock className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="mt-4 text-lg font-medium text-slate-900">No time logs found</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedMonth !== 'all'
                                        ? `No records found for ${getMonthName(parseInt(selectedMonth))} ${selectedYear}`
                                        : `No records found for ${selectedYear}`}
                                </p>
                                <Button variant="outline" size="sm" onClick={handleReset} className="mt-4 gap-1">
                                    <RotateCcw className="h-3 w-3" />
                                    Reset Filters
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
