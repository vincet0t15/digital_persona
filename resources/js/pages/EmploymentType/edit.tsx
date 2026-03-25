import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { EmploymentType, EmploymentTypeForm } from '@/types/employmentType';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { ChangeEventHandler, FormEventHandler } from 'react';
import { toast } from 'sonner';
interface Props {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    employmentType: EmploymentType;
}
export function EditEmploymentTypeDialog({ isOpen, onClose, employmentType }: Props) {
    const { data, setData, errors, processing, post } = useForm<EmploymentTypeForm & { _method: string }>({
        _method: 'put',
        name: employmentType.name,
        description: employmentType.description,
        status: employmentType.status,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('employment-types.update', employmentType.id), {
            onSuccess: () => {
                toast.success('Employment type updated successfully');
                onClose(false);
            },
        });
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <form>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit Employment Type</DialogTitle>
                        <DialogDescription>Fill in the details for the employment type. Click update once you're done.</DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="name-1">Name</Label>
                            <Input name="name" placeholder="Enter a name..." onChange={handleInputChange} value={data.name} />
                            <InputError message={errors.name} />
                        </Field>
                        <Field>
                            <Label>Description</Label>
                            <Textarea name="description" placeholder="Enter a description..." onChange={handleInputChange} value={data.description} />
                        </Field>
                        <Field>
                            <Label>Status</Label>
                            <Switch name="status" checked={data.status} onCheckedChange={(value: boolean) => setData('status', value)} />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" onClick={submit} disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span> Updating...</span>
                                </>
                            ) : (
                                'Update'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
