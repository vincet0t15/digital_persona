import { CustomComboBox } from '@/components/CustomComboBox';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Employee, EmployeeCreate } from '@/types/employee';
import { EmploymentType } from '@/types/employmentType';
import { Office } from '@/types/office';
import { useForm } from '@inertiajs/react';
import { UploadCloud, XIcon } from 'lucide-react';
import { ChangeEvent, FormEventHandler, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    employee: Employee;
    offices: Office[];
    employmentTypes: EmploymentType[];
}

interface FormData {
    _method: string;
    name: string;
    office_id: string;
    employment_type_id: string;
    is_active: boolean;
    photo: File | null;
    [key: string]: string | number | boolean | File | null;
}

function EmployeeDetails({ employee, offices, employmentTypes }: Props) {
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(employee.image ? `/storage/${employee.image}` : null);
    const photoPreviewUrlRef = useRef<string | null>(null);

    const { data, setData, errors, processing, put } = useForm<EmployeeCreate>({
        name: employee.name,
        office_id: String(employee.office_id),
        employment_type_id: String(employee.employment_type?.id || ''),
        is_active: Boolean(employee.is_active ?? true),
        photo: null,
    });

    const officeOptions = offices.map((office) => ({
        value: String(office.id),
        label: office.name,
    }));

    const employmentTypeOptions = employmentTypes.map((type) => ({
        value: String(type.id),
        label: type.name,
    }));

    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('photo', file);
            const url = URL.createObjectURL(file);
            if (photoPreviewUrlRef.current) {
                URL.revokeObjectURL(photoPreviewUrlRef.current);
            }
            photoPreviewUrlRef.current = url;
            setPhotoPreviewUrl(url);
        }
    };

    const handleRemovePhoto = () => {
        if (photoPreviewUrlRef.current) {
            URL.revokeObjectURL(photoPreviewUrlRef.current);
            photoPreviewUrlRef.current = null;
        }
        setPhotoPreviewUrl(null);
        setData('photo', null);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('manage-employees.update', employee.id), {
            onSuccess: () => {
                toast.success('Employee updated successfully');
            },
            onError: () => {
                toast.error('Failed to update employee');
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* LEFT COLUMN - Photo Upload */}
                    <div className="lg:col-span-3">
                        <div className="sticky top-4 flex flex-col items-center space-y-4">
                            <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
                            <button
                                type="button"
                                className="bg-background hover:border-primary relative flex aspect-square w-full max-w-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors"
                                onClick={() => document.getElementById('photo')?.click()}
                            >
                                {photoPreviewUrl ? (
                                    <img src={photoPreviewUrl} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                                        <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                                            <UploadCloud className="text-muted-foreground size-5" />
                                        </div>
                                        <div className="text-sm font-semibold">Upload Photo</div>
                                        <div className="text-muted-foreground text-xs">Click to browse</div>
                                    </div>
                                )}
                            </button>

                            <div className="flex flex-wrap justify-center gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('photo')?.click()}>
                                    <UploadCloud className="mr-1 size-4" />
                                    {photoPreviewUrl ? 'Change' : 'Choose'}
                                </Button>

                                {photoPreviewUrl && (
                                    <Button type="button" variant="destructive" size="sm" onClick={handleRemovePhoto}>
                                        <XIcon className="mr-1 size-4" />
                                        Remove
                                    </Button>
                                )}
                            </div>

                            <p className="text-muted-foreground text-center text-xs">jpeg, jpg, png, webp (max 2MB)</p>
                        </div>
                    </div>

                    {/* MIDDLE COLUMN - Employee Details */}
                    <div className="space-y-4 lg:col-span-5">
                        <FieldGroup>
                            <Field>
                                <Label>
                                    Full Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter full name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError message={errors.name} />
                            </Field>

                            <Field>
                                <Label>
                                    <span className="flex items-center gap-2">
                                        Office <span className="text-destructive">*</span>
                                    </span>
                                </Label>
                                <CustomComboBox
                                    items={officeOptions}
                                    placeholder="Select an office"
                                    value={data.office_id || null}
                                    onSelect={(value) => setData('office_id', value ?? '')}
                                />
                                <InputError message={errors.office_id} />
                            </Field>

                            <Field>
                                <Label>
                                    <span className="flex items-center gap-2">
                                        Employment Type <span className="text-destructive">*</span>
                                    </span>
                                </Label>
                                <CustomComboBox
                                    items={employmentTypeOptions}
                                    placeholder="Select an employment type"
                                    value={data.employment_type_id || null}
                                    onSelect={(value) => setData('employment_type_id', value ?? '')}
                                />
                                <InputError message={errors.employment_type_id} />
                            </Field>
                        </FieldGroup>
                    </div>

                    {/* RIGHT COLUMN - Account Status */}
                    <div className="space-y-4 lg:col-span-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">Account Status</h3>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Active Status</span>
                                </div>
                                <Switch checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                            </div>
                            <p className="text-muted-foreground mt-2 text-sm">
                                {data.is_active ? 'Employee can login and access the system.' : 'Employee cannot login to the system.'}
                            </p>
                        </div>
                    </div>
                </div>
                {/* Footer Actions */}
                <div className="flex justify-end gap-4 border-t pt-4">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Updating...' : 'Update Employee'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default EmployeeDetails;
