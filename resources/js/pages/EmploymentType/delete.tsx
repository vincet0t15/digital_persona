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
import { EmploymentType } from '@/types/employmentType';

import { router } from '@inertiajs/react';
import { toast } from 'sonner';
interface DeleteClaimTypeDialogProps {
    open: boolean;
    onClose: (open: boolean) => void;
    employmentType: EmploymentType;
}
export function DeleteEmploymentTypeDialog({ open, onClose, employmentType }: DeleteClaimTypeDialogProps) {
    const onSubmit = () => {
        router.delete(route('employment-types.destroy', employmentType.id), {
            onSuccess: (response: { props: FlashProps }) => {
                toast.success(response.props.flash?.success);
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
                        This action cannot be undone. This will permanently delete the office <span className="font-bold">{employmentType.name}</span>{' '}
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
