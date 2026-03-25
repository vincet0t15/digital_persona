import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Employee } from '@/types/employee';

import { router } from '@inertiajs/react';
import { toast } from 'sonner';
interface DeleteClaimTypeDialogProps {
    open: boolean;
    onClose: (open: boolean) => void;
    employee: Employee;
    fingerprintId: number;
}
export function DeleteFingerPrintDialog({ open, onClose, employee, fingerprintId }: DeleteClaimTypeDialogProps) {
    const onSubmit = () => {
        router.delete(route('employees.fingerprints.delete', [employee.id, fingerprintId]), {
            onSuccess: () => {
                toast.success('Fingerprint deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete fingerprint');
            },
        });
    };
    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="rounded-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the employee <span className="font-bold">{employee.name}</span>{' '}
                        from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onSubmit}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
