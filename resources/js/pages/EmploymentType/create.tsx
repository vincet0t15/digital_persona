import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { EmploymentTypeForm } from '@/types/employmentType';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { ChangeEventHandler, FormEventHandler } from 'react';
import { toast } from 'sonner';
interface Props {
    isOpen: boolean;
    onClose: (open: boolean) => void;
}
export function CreateEmploymentTypeDialog({ isOpen, onClose }: Props) {
    const { data, setData, errors, processing, reset, post } = useForm<EmploymentTypeForm>({
        name: '',
        description: '',
        status: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('employment-types.store'), {
            onSuccess: (response: { props: FlashProps }) => {
                toast.success(response.props.flash?.success);
                reset();
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
                        <DialogTitle>Employment Types</DialogTitle>
                        <DialogDescription>Fill in the details for the employment type. Click save once you're done.</DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="name-1">Name</Label>
                            <Input name="name" placeholder="Enter a name..." onChange={handleInputChange} value={data.name} />
                            <InputError message={errors.name} />
                        </Field>
                        <Field>
                            <Label htmlFor="username-1">Description</Label>
                            <Textarea name="description" placeholder="Enter a description..." onChange={handleInputChange} value={data.description} />
                        </Field>
                        <Field>
                            <Label htmlFor="username-1">Status</Label>
                            <Switch id="status" name="status" checked={data.status} onCheckedChange={(value: boolean) => setData('status', value)} />
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
                                    <span> Creating...</span>
                                </>
                            ) : (
                                'Create'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
