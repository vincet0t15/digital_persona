import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { EmployeeCreate } from '@/types/employee';
import { Head, useForm } from '@inertiajs/react';
import { FingerprintScanner } from './fingerprint-scanner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Biometric',
        href: '/biometric/register',
    },
];

export default function RegisterBiometric() {
    const { data, setData } = useForm<EmployeeCreate>({
        name: '',
        username: '',
        office_id: '',
        password: '',
        photo: null,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register Biometric" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <FingerprintScanner mode="enroll" onCapture={() => {}} />
            </div>
        </AppLayout>
    );
}
