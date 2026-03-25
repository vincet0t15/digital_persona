import { CustomComboBox } from '@/components/CustomComboBox';
import Heading from '@/components/heading';
import Pagination from '@/components/paginationData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Employee } from '@/types/employee';
import { EmploymentType } from '@/types/employmentType';
import { FilterProps } from '@/types/filter';
import { Office } from '@/types/office';
import { PaginatedDataResponse } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { PlusIcon, Search, UserIcon } from 'lucide-react';
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
interface TimeLogsProps {
    employees: PaginatedDataResponse<Employee>;
    filters: FilterProps;
    offices: Office[];
    employmentTypes: EmploymentType[];
}
export default function TimeLogs({ employees, filters, offices, employmentTypes }: TimeLogsProps) {
    const officeOptions = offices.map((office) => ({
        value: office.id.toString(),
        label: office.name,
    }));
    const employmentTypeOptions = employmentTypes.map((employmentType) => ({
        value: employmentType.id.toString(),
        label: employmentType.name,
    }));
    const { data, setData } = useForm({
        search: filters.search || '',
        office_id: filters.office_id || '',
        employment_type_id: filters.employment_type_id || '',
    });

    const onOfficeChange = (value: string | null) => {
        const newOfficeId = value || '';
        setData('office_id', newOfficeId);

        const queryParams: Record<string, string> = {};
        if (newOfficeId) {
            queryParams.office_id = newOfficeId;
        }
        if (data.search) {
            queryParams.search = data.search;
        }

        if (data.employment_type_id) {
            queryParams.employment_type_id = data.employment_type_id;
        }

        router.get(route('logs.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const onEmploymentTypeChange = (value: string | null) => {
        const newEmploymentTypeId = value || '';
        setData('employment_type_id', newEmploymentTypeId);

        const queryParams: Record<string, string> = {};
        if (newEmploymentTypeId) {
            queryParams.employment_type_id = newEmploymentTypeId;
        }
        if (data.search) {
            queryParams.search = data.search;
        }
        if (data.office_id) {
            queryParams.office_id = data.office_id;
        }

        router.get(route('logs.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            router.get(
                route('logs.index'),
                {
                    search: data.search,
                    office_id: data.office_id,
                    employment_type_id: data.employment_type_id,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Time Logs" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-md p-4">
                <Heading
                    title="Time Logs"
                    description="Manage all time logs, with options to view, edit, or delete records and track employee attendance."
                />

                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="button">
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
                        <div className="w-full">
                            <CustomComboBox
                                items={employmentTypeOptions}
                                placeholder="All Employment Types"
                                value={data.employment_type_id || null}
                                onSelect={onEmploymentTypeChange}
                            />
                        </div>

                        <div className="relative w-full">
                            <Label htmlFor="search" className="sr-only">
                                Search
                            </Label>
                            <Input
                                id="search"
                                placeholder="Search the employee..."
                                className="w-full pl-8"
                                onChange={(e) => setData('search', e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                value={data.search || ''}
                            />
                            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                        </div>
                    </div>
                </div>
                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-primary font-bold">Name</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.data.length > 0 ? (
                                employees.data.map((employee) => (
                                    <TableRow key={employee.id} className="hover:bg-muted/30 text-sm">
                                        <TableCell className="cursor-pointer text-sm">
                                            <div className="flex cursor-pointer items-center gap-2">
                                                <Avatar className="h-12 w-12 border-2 border-slate-200 shadow-sm dark:border-slate-700">
                                                    {employee.image ? (
                                                        <AvatarImage
                                                            src={'storage/' + employee.image}
                                                            alt={`${employee.name}`}
                                                            className="object-cover"
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800">
                                                        <UserIcon className="h-6 w-6 text-slate-400" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold uppercase">{employee.name}</span>
                                                    <span className="text-muted-foreground text-[0.70rem]">{employee.office?.name}</span>
                                                    <span className="text-muted-foreground text-[0.70rem]">{employee.employment_type?.name}</span>
                                                </div>
                                            </div>
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
