import Heading from '@/components/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Employee } from '@/types/employee';
import { EmploymentType } from '@/types/employmentType';
import { Office } from '@/types/office';
import { Head } from '@inertiajs/react';
import EmployeeDetails from './details';
import ManageFingerprints from './fingerprint';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Employee List',
        href: '/employees',
    },

    {
        title: 'Manage Employees',
        href: '/manage-employees',
    },
];
interface Props {
    employee: Employee;
    offices: Office[];
    employmentTypes: EmploymentType[];
}
export default function ManageEmployees({ employee, offices, employmentTypes }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Employees" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading
                    title="Manage Employees"
                    description="Manage all employees, with options to view, edit, or delete records and track their employment statuses."
                />
                <Tabs defaultValue="details" className="w-auto">
                    <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="fingerprint">Fingerprint</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                        <EmployeeDetails employee={employee} offices={offices} employmentTypes={employmentTypes} />
                    </TabsContent>
                    <TabsContent value="fingerprint">
                        <ManageFingerprints employee={employee} offices={offices} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
