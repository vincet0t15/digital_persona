import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Employee } from '@/types/employee';
import { TimeLog } from '@/types/timeLogs';
import { Head } from '@inertiajs/react';
import { Calendar, Clock, LogIn, LogOut } from 'lucide-react';

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

interface ShowTimeLogsProps {
    employee: Employee;
}

export default function ShowTimeLogs({ employee }: ShowTimeLogsProps) {
    const formatTime = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
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

    const getDateGroup = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const groupLogsByDate = (logs: TimeLog[]) => {
        const grouped: Record<string, TimeLog[]> = {};
        logs.forEach((log) => {
            const dateKey = getDateGroup(log.date_time);
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(log);
        });
        // Sort logs within each date by time (newest first)
        Object.keys(grouped).forEach((date) => {
            grouped[date].sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());
        });
        return grouped;
    };

    const sortedLogs = [...employee.time_logs].sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());
    const groupedLogs = groupLogsByDate(sortedLogs);
    const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Time Logs - {employee.name}" />
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
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Calendar className="h-5 w-5" />
                            Attendance History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sortedDates.length > 0 ? (
                            <div className="space-y-6">
                                {sortedDates.map((date) => (
                                    <div key={date} className="space-y-3">
                                        {/* Date Header */}
                                        <div className="sticky top-0 z-10 -mx-4 border-b bg-slate-50/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80 dark:bg-slate-900/95">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <Calendar className="h-4 w-4 text-slate-500" />
                                                {date}
                                            </h3>
                                        </div>

                                        {/* Logs for this date */}
                                        <div className="space-y-2 pl-6">
                                            {groupedLogs[date].map((log) => (
                                                <div
                                                    key={log.id}
                                                    className="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm transition-colors hover:bg-slate-50"
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
                                                            <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                                                                <Clock className="h-4 w-4 text-slate-400" />
                                                                {formatTime(log.date_time)}
                                                            </p>
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
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-slate-100 p-4">
                                    <Clock className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="mt-4 text-lg font-medium text-slate-900">No time logs found</h3>
                                <p className="mt-1 text-sm text-slate-500">This employee has no attendance records yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
