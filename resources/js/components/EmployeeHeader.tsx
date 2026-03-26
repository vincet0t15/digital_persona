import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { useInitials } from '@/hooks/use-initials';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, FileText, Fingerprint, LayoutDashboard, LogOut } from 'lucide-react';

interface Employee {
    id: number;
    name: string;
    username?: string;
    image?: string | null;
    office?: any;
}

interface Props {
    employee: Employee;
}

const navItems = [
    { title: 'Dashboard', url: '/employee/dashboard', icon: LayoutDashboard },
    { title: 'My DTR', url: '/employee/dtr', icon: FileText },
];

export function EmployeeHeader({ employee }: Props) {
    const getInitials = useInitials();
    const { url } = usePage();

    return (
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
                        {navItems.map((item) => {
                            const isActive = url.startsWith(item.url);
                            return (
                                <NavigationMenuItem key={item.title}>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            href={item.url}
                                            className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'}`}
                                        >
                                            <item.icon className="h-4 w-4 transition group-hover:scale-110" />
                                            {item.title}
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            );
                        })}
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
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {typeof employee.office === 'string' ? employee.office : (employee.office?.name || 'No office')}
                                </p>
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
                                {employee.username && <span className="text-xs text-slate-500">@{employee.username}</span>}
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
                    {navItems.map((item) => {
                        const isActive = url.startsWith(item.url);
                        return (
                            <Link
                                key={item.title}
                                href={item.url}
                                className={`flex flex-col items-center gap-1 rounded-lg p-2 text-xs font-medium transition ${isActive ? 'text-blue-600' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100'}`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.title}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </header>
    );
}
