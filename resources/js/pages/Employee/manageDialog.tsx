import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { Employee } from '@/types/employee';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface EmployeeShowProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee;
}

export function EmployeeManageDialog({ isOpen, onClose, employee }: EmployeeShowProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleManage = () => {
        onClose();
        router.get(route('manage.employees.index', employee.id));
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('employees.destroy', employee.id), {
            onSuccess: () => {
                toast.success('Employee deleted successfully');
                setShowDeleteDialog(false);
                onClose();
            },
            onError: () => {
                toast.error('Failed to delete employee');
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogTitle>Employee Details</DialogTitle>
                <DialogContent className="bg-background w-[400px] overflow-hidden rounded-lg border p-0 shadow-lg">
                    {/* Header with Avatar */}
                    <div className="bg-muted/30 flex flex-col items-center gap-3 pt-8 pb-4">
                        <Avatar className="ring-background h-24 w-24 shadow-lg ring-4">
                            <AvatarImage src={employee.image || ''} alt="Employee" />
                            <AvatarFallback className="text-lg font-semibold">{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="space-y-1 text-center">
                            <h2 className="text-foreground text-xl font-semibold tracking-tight uppercase">{employee.name}</h2>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 px-6 py-4">
                        {/* Info Section */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between border-b py-2 text-sm">
                                <span className="text-muted-foreground">Department</span>
                                <span className="truncate text-right font-medium uppercase">{employee.office?.code}</span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 pt-2">
                            <Button variant="destructive" className="flex-1" onClick={() => setShowDeleteDialog(true)}>
                                Delete
                            </Button>
                            <Button variant="default" className="flex-1" onClick={handleManage}>
                                Manage
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
