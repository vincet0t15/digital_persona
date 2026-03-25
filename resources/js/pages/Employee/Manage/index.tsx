import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Employee } from '@/types/employee';
import { EmploymentType } from '@/types/employmentType';
import { Office } from '@/types/office';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
                <Button variant="outline" className="w-fit" onClick={() => window.history.back()}>
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back
                </Button>
                <Heading
                    title="Manage Employees"
                    description="Manage all employees, with options to view, edit, or delete records and track their employment statuses."
                />
                <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div className="flex items-center gap-5">
                        <Avatar className="border-background h-24 w-24 rounded-2xl border-4 shadow-xl">
                            <AvatarImage src={'/storage/' + employee.image || ''} alt={employee.name} className="object-cover" />
                            <AvatarFallback className="rounded-2xl bg-slate-100 text-xl">{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <div className="flex flex-col items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">{employee.name}</h1>
                            </div>
                            <p className="flex items-center gap-2 font-medium text-slate-500">{employee.office?.name}</p>
                            <Badge className="rounded-sm">{employee.employment_type?.name}</Badge>
                        </div>
                    </div>
                </header>
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
