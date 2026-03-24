import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Office } from '@/types/office';
import { Head } from '@inertiajs/react';
import { PlusIcon, Search } from 'lucide-react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Employee List',
        href: '/employees',
    },
];
interface EmployeeIndexProps {
    offices: Office[];
}
export default function EmployeeIndex({ offices }: EmployeeIndexProps) {
    // const {data, setData} = useForm = {{

    // }}
    const officeOptions = offices.map((office) => ({
        value: office.id.toString(),
        label: office.name,
    }));
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee List" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading
                    title="Employee List"
                    description="Manage all employees, with options to view, edit, or delete records and track their employment statuses."
                />

                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button>
                        <PlusIcon className="h-4 w-4" />
                        Add Employee
                    </Button>

                    <div className="flex w-full items-center gap-2 sm:w-auto">
                        <div className="w-full">
                            {/* <CustomComboBox
                                items={officeOptions}
                                placeholder="All Offices"
                                value={data.office_id || null}
                                onSelect={(value) => handleOfficeChange(value ?? '')}
                            /> */}
                        </div>

                        <div className="relative w-full sm:w-[250px]">
                            <Label htmlFor="search" className="sr-only">
                                Search
                            </Label>
                            <Input id="search" placeholder="Search the employee..." className="w-full pl-8" />
                            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
