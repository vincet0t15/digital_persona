import { CustomComboBox } from '@/components/CustomComboBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { EmployeeCreate } from '@/types/employee';
import { Office } from '@/types/office';
import { Head, useForm } from '@inertiajs/react';
import { UploadIcon, XIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { FingerprintScanner } from './fingerprint-scanner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Biometric',
        href: '/biometric/register',
    },
];

interface RegisterBiometricProps {
    offices: Office[];
}
export default function RegisterBiometric({ offices }: RegisterBiometricProps) {
    const { data, setData } = useForm<EmployeeCreate>({
        name: '',
        username: '',
        office_id: '',
        password: '',
        photo: null,
    });

    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const photoPreviewUrlRef = useRef<string | null>(null);

    const officeOptions = offices.map((office) => ({
        value: String(office.id),
        label: office.name,
    }));

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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register Biometric" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <FingerprintScanner mode="enroll" onCapture={() => {}} />

                <div>
                    <div className="flex flex-col items-center space-y-4 md:col-span-1">
                        <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />

                        <button
                            type="button"
                            className="bg-background relative flex aspect-square w-full max-w-xs cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed"
                            onClick={() => document.getElementById('photo')?.click()}
                        >
                            {photoPreviewUrl ? (
                                <img src={photoPreviewUrl} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 text-center">
                                    <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                                        <UploadIcon className="text-muted-foreground size-5" />
                                    </div>
                                    <div className="text-sm font-semibold">Upload Photo</div>
                                    <div className="text-muted-foreground text-xs">Click to browse</div>
                                </div>
                            )}
                        </button>

                        <div className="flex flex-wrap justify-center gap-2">
                            <Button type="button" variant="outline" onClick={() => document.getElementById('photo')?.click()}>
                                <UploadIcon className="mr-1 size-4" />
                                {photoPreviewUrl ? 'Change' : 'Choose'}
                            </Button>

                            {photoPreviewUrl && (
                                <Button
                                    type="button"
                                    variant="destructive"
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
                <CustomComboBox
                    items={officeOptions}
                    placeholder="Select an office"
                    value={data.office_id || null}
                    onSelect={(value) => setData('office_id', value ?? '')}
                />
                <Input type="text" placeholder="Name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                <Input type="password" placeholder="Password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                <Input type="text" placeholder="Username" value={data.username} onChange={(e) => setData('username', e.target.value)} />
            </div>
        </AppLayout>
    );
}
