import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Shift } from '@/types/shift';
import { Head } from '@inertiajs/react';
import { Clock, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { CreateShiftDialog } from './create';
import { DeleteShiftDialog } from './delete';
import { EditShiftDialog } from './edit';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Shifts',
        href: '/shifts',
    },
];

interface ShiftsProps {
    shifts: Shift[];
}

export default function ShiftIndex({ shifts }: ShiftsProps) {
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

    const handleDelete = (shift: Shift) => {
        setSelectedShift(shift);
        setOpenDeleteDialog(true);
    };

    const handleEdit = (shift: Shift) => {
        setSelectedShift(shift);
        setOpenEditDialog(true);
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shifts" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Shift Schedules" description="Manage work shift schedules for employees." />

                <div className="flex justify-end">
                    <Button onClick={() => setOpenCreateDialog(true)}>
                        <PlusIcon className="h-4 w-4" />
                        Add Shift
                    </Button>
                </div>

                {/* TABLE */}
                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Shift Name</TableHead>
                                <TableHead>Start Time</TableHead>
                                <TableHead>End Time</TableHead>
                                <TableHead>Break</TableHead>
                                <TableHead>Grace Period</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shifts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-muted-foreground text-center">
                                        No shifts found. Create your first shift schedule.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                shifts.map((shift) => (
                                    <TableRow key={shift.id}>
                                        <TableCell className="font-medium">{shift.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-slate-400" />
                                                {formatTime(shift.start_time)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-slate-400" />
                                                {formatTime(shift.end_time)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {shift.break_start && shift.break_end ? (
                                                <span className="text-sm">
                                                    {formatTime(shift.break_start)} - {formatTime(shift.break_end)}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{shift.grace_minutes} min</TableCell>
                                        <TableCell>
                                            <Badge variant={shift.is_active ? 'default' : 'secondary'} className="rounded-sm">
                                                {shift.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="rounded-sm">
                                                {shift.employment_types_count || 0} types
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <span
                                                    className="cursor-pointer text-sm text-teal-500 hover:underline"
                                                    onClick={() => handleEdit(shift)}
                                                >
                                                    Edit
                                                </span>
                                                <span
                                                    className="cursor-pointer text-sm text-red-500 hover:underline"
                                                    onClick={() => handleDelete(shift)}
                                                >
                                                    Delete
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {openCreateDialog && <CreateShiftDialog isOpen={openCreateDialog} onClose={setOpenCreateDialog} />}
                {openDeleteDialog && selectedShift && (
                    <DeleteShiftDialog open={openDeleteDialog} onClose={setOpenDeleteDialog} shift={selectedShift} />
                )}
                {openEditDialog && selectedShift && <EditShiftDialog isOpen={openEditDialog} onClose={setOpenEditDialog} shift={selectedShift} />}
            </div>
        </AppLayout>
    );
}
