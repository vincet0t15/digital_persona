import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Time Logs',
        href: '/logs',
    },
];

export default function TimeLogs() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Time Logs" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-md p-4">
                <h1 className="text-2xl font-semibold">Time Logs</h1>
            </div>
        </AppLayout>
    );
}
