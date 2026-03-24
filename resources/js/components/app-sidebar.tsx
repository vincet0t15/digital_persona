import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NavGroup } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, FingerprintIcon, LayoutGrid, Users2Icon } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavGroup[] = [
    {
        title: 'Overview',
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
        ],
    },

    {
        title: 'Biometric',
        children: [
            {
                title: 'Register',
                href: '/employees/create',
                icon: FingerprintIcon,
            },
            {
                title: 'Identify',
                href: '/employees/identify',
                icon: BookOpen,
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
