import Heading from '@/components/heading';
import Pagination from '@/components/paginationData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { EmploymentType } from '@/types/employmentType';
import { PaginatedDataResponse } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { PlusIcon, Search } from 'lucide-react';
import { useState } from 'react';
import { CreateEmploymentTypeDialog } from './create';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Employment Types',
        href: '/employment-types',
    },
];

interface EmploymentTypeProps {
    employmentTypes: PaginatedDataResponse<EmploymentType>;
}
export default function EmploymentTypeIndex({ employmentTypes }: EmploymentTypeProps) {
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employment Types" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Employment Types" description="Manage employment types for employees." />
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex justify-end">
                        <Button onClick={() => setOpenCreateDialog(true)}>
                            <PlusIcon className="h-4 w-4" />
                            Employment Type
                        </Button>
                    </div>
                    <div className="flex w-full items-center gap-2 sm:w-auto">
                        <div className="relative w-full sm:w-[250px]">
                            <Label htmlFor="search" className="sr-only">
                                Search
                            </Label>
                            <Input id="search" placeholder="Search the claim types..." className="w-full pl-8" />
                            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employmentTypes.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground text-center">
                                        No claim types found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employmentTypes.data.map((data, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="text-sm">{data.name}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{data.description || '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant={data.status ? 'default' : 'destructive'} className="rounded-sm">
                                                {data.status ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <span className="cursor-pointer text-sm text-teal-500 hover:underline">Edit</span>

                                                <span className="cursor-pointer text-sm text-red-500 hover:underline">Delete</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div>
                    <Pagination data={employmentTypes} />
                </div>

                {openCreateDialog && <CreateEmploymentTypeDialog isOpen={openCreateDialog} onClose={setOpenCreateDialog} />}
            </div>
        </AppLayout>
    );
}
