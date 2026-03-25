import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NavGroup } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Clock1, LayoutGrid, Timer, Users2Icon } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavGroup[] = [
    {
        title: 'Main',
        children: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Employees',
                href: '/employees',
                icon: Users2Icon,
            },
            {
                title: 'Identify',
                href: '/employees/identify',
                icon: BookOpen,
            },
        ],
    },
    {
        title: 'Time Clock',
        children: [
            {
                title: 'Time Logs',
                href: '/logs',
                icon: Clock1,
            },
        ],
    },
    {
        title: 'Settings',
        children: [
            {
                title: 'Employment Types',
                href: '/employment-types',
                icon: Users2Icon,
            },
            {
                title: 'Shift Schedules',
                href: '/shifts',
                icon: Timer,
            },
        ],
    },
];
export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
