import { CustomComboBox } from '@/components/CustomComboBox';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { EmployeeCreate } from '@/types/employee';
import { EmploymentType } from '@/types/employmentType';
import { Office } from '@/types/office';
import { Head, useForm } from '@inertiajs/react';
import { UploadCloud, XIcon } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Employee Create',
        href: '/employees/create',
    },
];

interface Props {
    offices: Office[];
    employmentTypes: EmploymentType[];
}
export default function CreateEmployee({ offices, employmentTypes }: Props) {
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const photoPreviewUrlRef = useRef<string | null>(null);

    const officeOptions = offices.map((office) => ({
        value: String(office.id),
        label: office.name,
    }));

    const employmentTypeOptions = employmentTypes.map((employmentType) => ({
        value: String(employmentType.id),
        label: employmentType.name,
    }));
    const { data, setData, post, processing, reset, errors } = useForm<EmployeeCreate>({
        name: '',
        office_id: '',
        employment_type_id: '',
        photo: '',
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;

        if (photoPreviewUrlRef.current) {
            URL.revokeObjectURL(photoPreviewUrlRef.current);
            photoPreviewUrlRef.current = null;
        }

        if (file) {
            const url = URL.createObjectURL(file);
            photoPreviewUrlRef.current = url;
            setPhotoPreviewUrl(url);
        } else {
            setPhotoPreviewUrl(null);
        }

        setData('photo', file);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('employees.store'), {
            onSuccess: (response: { props: FlashProps }) => {
                toast.success(response.props.flash?.success);
                setPhotoPreviewUrl(null);
                reset();
            },
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee Create" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="New Employee" description="Enter the details to register a new employee." />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-3">
                        <div className="sticky top-4 flex flex-col items-center space-y-4">
                            <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
                            <button
                                type="button"
                                className="bg-background relative flex aspect-square w-full max-w-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed"
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
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            if (photoPreviewUrlRef.current) {
                                                URL.revokeObjectURL(photoPreviewUrlRef.current);
                                                photoPreviewUrlRef.current = null;
                                            }
                                            setPhotoPreviewUrl(null);
                                            setData('photo', null);
                                        }}
                                    >
                                        <XIcon className="mr-1 size-4" />
                                        Remove
                                    </Button>
                                )}
                            </div>

                            <p className="text-muted-foreground text-center text-xs">jpeg, jpg, png, webp (max 2MB)</p>
                        </div>
                    </div>

                    {/* MIDDLE COLUMN - Employee Details (5 columns) */}
                    <div className="space-y-4 lg:col-span-4">
                        <h3 className="text-lg font-semibold">Employee Details</h3>
                        <form>
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
                                        Office <span className="text-destructive">*</span>
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
                                        Employment Type <span className="text-destructive">*</span>
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
                            <div className="flex justify-end gap-4 border-t pt-4">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} onClick={handleSubmit}>
                                    {processing ? 'Registering...' : 'Register Employee'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
