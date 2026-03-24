import { CustomComboBox } from '@/components/CustomComboBox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { EmployeeCreate } from '@/types/employee';
import { Office } from '@/types/office';
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

interface RegisterBiometricProps {
    offices: Office[];
}
export default function RegisterBiometric({ offices }: RegisterBiometricProps) {
    const { data, setData } = useForm<EmployeeCreate>({
        name: '',
        username: '',
        office_id: '',
        password: '',
        photo: null,
    });

    const officeOptions = offices.map((office) => ({
        value: String(office.id),
        label: office.name,
    }));
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register Biometric" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <FingerprintScanner mode="enroll" onCapture={() => {}} />

                <CustomComboBox
                    items={officeOptions}
                    placeholder="Select an office"
                    value={data.office_id || null}
                    onSelect={(value) => setData('office_id', value ?? '')}
                />
            </div>
        </AppLayout>
    );
}
