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
import { Shift } from '@/types/shift';

import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface DeleteShiftDialogProps {
    open: boolean;
    onClose: (open: boolean) => void;
    shift: Shift;
}

export function DeleteShiftDialog({ open, onClose, shift }: DeleteShiftDialogProps) {
    const onSubmit = () => {
        router.delete(route('shifts.destroy', shift.id), {
            onSuccess: (response: { props: FlashProps }) => {
                const flash = response.props.flash;
                if (flash?.error) {
                    toast.error(flash.error);
                } else {
                    toast.success(flash?.success);
                }
                onClose(false);
            },
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="rounded-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the shift <span className="font-bold">{shift.name}</span> from our
                        servers.
                        {shift.employment_types_count && shift.employment_types_count > 0 && (
                            <p className="mt-2 text-red-500">Warning: This shift is assigned to {shift.employment_types_count} employment type(s).</p>
                        )}
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
