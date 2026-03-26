import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, Clock, Fingerprint, LogOut, User } from 'lucide-react';

interface Employee {
    id: number;
    name: string;
    username: string;
    image: string | null;
    office?: {
        name: string;
    };
}

interface PageProps {
    [key: string]: any;
    employee: Employee;
}

export default function EmployeeDashboard() {
    const { employee } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Employee Dashboard" />

            {/* Header */}
            <header className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                            <Fingerprint className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Employee Portal</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back, {employee.name}</p>
                        </div>
                    </div>
                    <form method="post" action={route('employee.logout')}>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Profile Card */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                {employee.image ? (
                                    <img src={`/storage/${employee.image}`} alt={employee.name} className="h-16 w-16 rounded-full object-cover" />
                                ) : (
                                    <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{employee.name}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">@{employee.username}</p>
                            </div>
                        </div>
                        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Building2 className="h-4 w-4" />
                                {employee.office?.name || 'No office assigned'}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
                        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link
                                href={route('timeclock.index')}
                                className="flex items-center gap-3 rounded-xl bg-blue-50 p-4 transition hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                    <Clock className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Time Clock</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Clock in/out using fingerprint</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                                <Fingerprint className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100">Status</p>
                                <p className="text-lg font-semibold">Active Employee</p>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-blue-100">Your account is active and you can use the time clock system.</p>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
                        <p className="text-center text-slate-500 dark:text-slate-400">Your recent time logs will appear here.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
