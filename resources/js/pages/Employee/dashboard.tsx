import { EmployeeHeader } from '@/components/EmployeeHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInitials } from '@/hooks/use-initials';
import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, Clock, FileText, Fingerprint, History, User } from 'lucide-react';

interface Employee {
    id: number;
    name: string;
    username: string;
    image: string | null;
    office?: {
        name: string;
    };
}

interface LogEntry {
    id: number;
    log_type: string;
    time: string;
    date: string;
}

interface PageProps {
    [key: string]: any;
    employee: Employee;
    recentLogs?: LogEntry[];
}

export default function EmployeeDashboard() {
    const { employee, recentLogs = [] } = usePage<PageProps>().props;
    const getInitials = useInitials();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <Head title="Employee Dashboard" />

            <EmployeeHeader employee={employee as any} />

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Welcome back,{' '}
                        <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">{employee.name}</span>
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Here's your employee dashboard. You can view your logs and print your DTR.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Profile Card */}
                    <Card className="overflow-hidden border-0 bg-white shadow-lg shadow-slate-200/50 dark:bg-slate-800 dark:shadow-slate-900/50">
                        <div className="h-24" />
                        <CardContent className="relative -mt-12">
                            <div className="flex flex-col items-center">
                                <Avatar className="h-24 w-24 border-4 border-white shadow-lg dark:border-slate-800">
                                    <AvatarImage src={employee.image ? `/storage/${employee.image}` : ''} alt={employee.name} />
                                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-2xl font-bold text-white">
                                        {getInitials(employee.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="mt-4 text-center">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{employee.name}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">@{employee.username}</p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
                                    <Building2 className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Office</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{employee.office?.name || 'Not assigned'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
                                    <Fingerprint className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                                        <p className="font-medium text-green-600 dark:text-green-400">Active</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-0 bg-white shadow-lg shadow-slate-200/50 dark:bg-slate-800 dark:shadow-slate-900/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                Quick Actions
                            </CardTitle>
                            <CardDescription>Access your time clock and records</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <button
                                disabled
                                className="flex w-full cursor-not-allowed items-center gap-4 rounded-xl bg-slate-50 p-4 opacity-60 dark:bg-slate-700/30"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-300 dark:bg-slate-600">
                                    <History className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-slate-900 dark:text-white">My Logs</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">View your time logs (Soon)</p>
                                </div>
                            </button>

                            <Link
                                href={route('employee.dtr')}
                                className="group flex items-center gap-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4 transition hover:from-emerald-100 hover:to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-600/20 transition group-hover:scale-110">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-900 dark:text-white">My DTR</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">View and print your DTR</p>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Status Card */}
                    <Card className="border-0 bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Fingerprint className="h-5 w-5" />
                                Account Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                    <User className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">Active</p>
                                    <p className="text-orange-100">Your account is in good standing</p>
                                </div>
                            </div>
                            <div className="mt-6 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                <p className="text-sm text-orange-100">
                                    You can keep track of your attendance and manage your DTR digitally through this portal.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Section */}
                <Card className="mt-8 border-0 bg-white shadow-lg shadow-slate-200/50 dark:bg-slate-800 dark:shadow-slate-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-orange-600" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>Your latest time clock entries</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentLogs && recentLogs.length > 0 ? (
                            <div className="space-y-4">
                                {recentLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-center justify-between rounded-lg border border-slate-100 p-4 dark:border-slate-800"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full ${log.log_type === 'IN' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}
                                            >
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">Time {log.log_type}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{log.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 dark:text-white">{log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 py-12 dark:bg-slate-700/30">
                                <History className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                                <p className="mt-4 text-center text-slate-500 dark:text-slate-400">Your recent time logs will appear here.</p>
                                <p className="mt-2 text-center text-sm text-slate-400 dark:text-slate-500">
                                    Please check back later when you have active logs.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
