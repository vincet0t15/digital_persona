import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ShiftFormData } from '@/types/shift';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { ChangeEventHandler, FormEventHandler } from 'react';
import { toast } from 'sonner';

interface Props {
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

export function CreateShiftDialog({ isOpen, onClose }: Props) {
    const { data, setData, errors, processing, reset, post } = useForm<ShiftFormData>({
        name: '',
        start_time: '08:00',
        end_time: '17:00',
        break_start: null,
        break_end: null,
        grace_minutes: 15,
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('shifts.store'), {
            onSuccess: (response: { props: FlashProps }) => {
                toast.success(response.props.flash?.success);
                reset();
                onClose(false);
            },
        });
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
        setData({ ...data, [e.target.name]: value });
    };

    const handleToggle = (checked: boolean) => {
        setData({ ...data, is_active: checked });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <form>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create Shift Schedule</DialogTitle>
                        <DialogDescription>
                            Define a new work shift schedule for employees. For overnight shifts (e.g., 6pm to 6am), set the end time to be earlier
                            than the start time.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="name">Shift Name</Label>
                            <Input name="name" placeholder="e.g., Regular Shift, Night Shift" onChange={handleInputChange} value={data.name} />
                            <InputError message={errors.name} />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="start_time">Start Time</Label>
                                <Input name="start_time" type="time" onChange={handleInputChange} value={data.start_time} />
                                <InputError message={errors.start_time} />
                            </Field>
                            <Field>
                                <Label htmlFor="end_time">End Time</Label>
                                <Input name="end_time" type="time" onChange={handleInputChange} value={data.end_time} />
                                <InputError message={errors.end_time} />
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="break_start">Break Start (Optional)</Label>
                                <Input name="break_start" type="time" onChange={handleInputChange} value={data.break_start || ''} />
                            </Field>
                            <Field>
                                <Label htmlFor="break_end">Break End (Optional)</Label>
                                <Input name="break_end" type="time" onChange={handleInputChange} value={data.break_end || ''} />
                            </Field>
                        </div>
                        <Field>
                            <Label htmlFor="grace_minutes">Grace Period (minutes)</Label>
                            <Input name="grace_minutes" type="number" min={0} max={60} onChange={handleInputChange} value={data.grace_minutes} />
                            <InputError message={errors.grace_minutes} />
                        </Field>
                        <Field>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="is_active">Active</Label>
                                <Switch id="is_active" name="is_active" checked={data.is_active} onCheckedChange={handleToggle} />
                            </div>
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
