import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { useInitials } from '@/hooks/use-initials';
import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, ChevronDown, Clock, FileText, Fingerprint, History, LayoutDashboard, LogOut, User } from 'lucide-react';

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

const navItems = [
    { title: 'Dashboard', url: '/employee/dashboard', icon: LayoutDashboard },
    { title: 'Time Clock', url: '/time-clock', icon: Clock },
    { title: 'My DTR', url: '/employee/dtr', icon: FileText },
];

export default function EmployeeDashboard() {
    const { employee } = usePage<PageProps>().props;
    const getInitials = useInitials();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <Head title="Employee Dashboard" />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/80">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20">
                            <Fingerprint className="h-5 w-5 text-white" />
                        </div>
                        <span className="hidden text-lg font-bold text-slate-900 sm:block dark:text-white">Employee Portal</span>
                    </div>

                    {/* Navigation Menu */}
                    <NavigationMenu className="hidden md:flex">
                        <NavigationMenuList className="gap-1">
                            {navItems.map((item) => (
                                <NavigationMenuItem key={item.title}>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            href={item.url}
                                            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                        >
                                            <item.icon className="h-4 w-4 transition group-hover:scale-110" />
                                            {item.title}
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex h-10 items-center gap-2 p-2 px-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <Avatar className="h-8 w-8 border-2 border-slate-200 dark:border-slate-700">
                                    <AvatarImage src={employee.image ? `/storage/${employee.image}` : ''} alt={employee.name} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-medium text-white">
                                        {getInitials(employee.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden text-left sm:block">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{employee.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{employee.office?.name || 'No office'}</p>
                                </div>
                                <ChevronDown className="h-4 w-4 text-slate-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="flex items-center gap-2 p-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={employee.image ? `/storage/${employee.image}` : ''} alt={employee.name} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                                        {getInitials(employee.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{employee.name}</span>
                                    <span className="text-xs text-slate-500">@{employee.username}</span>
                                </div>
                            </div>

                            <form method="post" action={route('employee.logout')}>
                                <DropdownMenuItem asChild>
                                    <button type="submit" className="flex w-full cursor-pointer items-center gap-2 text-red-600 focus:text-red-600">
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </DropdownMenuItem>
                            </form>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Mobile Navigation */}
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 md:hidden dark:border-slate-700 dark:bg-slate-800/50">
                    <div className="flex justify-around">
                        {navItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.url}
                                className="flex flex-col items-center gap-1 rounded-lg p-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                            >
                                <item.icon className="h-5 w-5" />
                                {item.title}
                            </Link>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Welcome back,{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{employee.name}</span>
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Here's your employee dashboard. You can clock in/out, view your logs, and print your DTR.
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
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-2xl font-bold text-white">
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
                                <Clock className="h-5 w-5 text-blue-600" />
                                Quick Actions
                            </CardTitle>
                            <CardDescription>Access your time clock and records</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link
                                href={route('timeclock.index')}
                                className="group flex items-center gap-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 transition hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20 transition group-hover:scale-110">
                                    <Clock className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-900 dark:text-white">Time Clock</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Clock in/out using fingerprint</p>
                                </div>
                            </Link>

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
                    <Card className="border-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/20">
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
                                    <p className="text-blue-100">Your account is in good standing</p>
                                </div>
                            </div>
                            <div className="mt-6 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                <p className="text-sm text-blue-100">
                                    You can use the time clock system to record your attendance. Make sure to clock in when you arrive and clock out
                                    when you leave.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Section */}
                <Card className="mt-8 border-0 bg-white shadow-lg shadow-slate-200/50 dark:bg-slate-800 dark:shadow-slate-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-slate-600" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>Your latest time clock entries</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 py-12 dark:bg-slate-700/30">
                            <History className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                            <p className="mt-4 text-center text-slate-500 dark:text-slate-400">Your recent time logs will appear here.</p>
                            <p className="mt-2 text-center text-sm text-slate-400 dark:text-slate-500">
                                Use the Time Clock to record your attendance.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
