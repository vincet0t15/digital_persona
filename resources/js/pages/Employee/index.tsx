import { CustomComboBox } from '@/components/CustomComboBox';
import Heading from '@/components/heading';
import Pagination from '@/components/paginationData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Employee } from '@/types/employee';
import { FilterProps } from '@/types/filter';
import { Office } from '@/types/office';
import { PaginatedDataResponse } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
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
    employees: PaginatedDataResponse<Employee>;
    filters: FilterProps;
}
export default function EmployeeIndex({ offices, employees, filters }: EmployeeIndexProps) {
    const { data, setData } = useForm({
        search: filters.search || '',
        office_id: filters.office_id || '',
    });

    const officeOptions = offices.map((office) => ({
        value: office.id.toString(),
        label: office.name,
    }));

    const onOfficeChange = (value: string | null) => {
        setData('office_id', value || '');

        const queryString = data.office_id ? { office_id: data.office_id, search: data.search } : undefined;

        router.get(route('employees.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

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
                            <CustomComboBox
                                items={officeOptions}
                                placeholder="All Offices"
                                value={data.office_id || null}
                                onSelect={onOfficeChange}
                            />
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

                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-primary font-bold">Name</TableHead>
                                <TableHead className="text-primary font-bold">Code</TableHead>

                                <TableHead className="text-primary text-right font-bold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.data.length > 0 ? (
                                employees.data.map((employee) => (
                                    <TableRow key={employee.id} className="hover:bg-muted/30 text-sm">
                                        <TableCell className="text-sm">{employee.name}</TableCell>
                                        <TableCell className="text-sm">
                                            {employee.office?.name ?? <span className="text-muted-foreground">—</span>}
                                        </TableCell>

                                        <TableCell className="flex items-center justify-end gap-2 text-sm">
                                            <span className="cursor-pointer text-teal-600 hover:underline">Edit</span>
                                            <span className="cursor-pointer text-orange-600 hover:underline">Delete</span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-3 text-center text-gray-500">
                                        No data available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div>
                    <Pagination data={employees} />
                </div>
            </div>
        </AppLayout>
    );
}
