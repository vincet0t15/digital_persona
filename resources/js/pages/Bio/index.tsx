import { CustomComboBox } from '@/components/CustomComboBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { EmployeeCreate } from '@/types/employee';
import { Office } from '@/types/office';
import { Head, useForm } from '@inertiajs/react';
import { UploadIcon, UserPlus, XIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { FingerprintScanner } from './fingerprint-scanner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Create Employee',
        href: '/biometric/register',
    },
];

interface RegisterBiometricProps {
    offices: Office[];
}

export default function RegisterBiometric({ offices }: RegisterBiometricProps) {
    const { data, setData, post, processing } = useForm<EmployeeCreate>({
        name: '',
        username: '',
        office_id: '',
        password: '',
        photo: null,
    });

    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [fingerprintTemplate, setFingerprintTemplate] = useState<string | null>(null);
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

    const handleFingerprintCapture = (template: string, quality: number) => {
        setFingerprintTemplate(template);
        console.log('Fingerprint captured with quality:', quality);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/biometric/register');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Employee" />
            <div className="mx-auto max-w-5xl p-4">
                <div className="mb-6 flex items-center gap-3">
                    <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
                        <UserPlus className="text-primary-foreground h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Create Employee</h1>
                        <p className="text-muted-foreground text-sm">Register a new employee with biometric data</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                    {/* Left Column - Photo & Fingerprint */}
                    <div className="space-y-6">
                        {/* Photo Upload Card */}
                        <div className="bg-card rounded-xl border p-6">
                            <h3 className="mb-4 text-lg font-medium">Employee Photo</h3>
                            <div className="flex flex-col items-center space-y-4">
                                <input
                                    id="photo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />

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
                                                <UploadIcon className="text-muted-foreground size-5" />
                                            </div>
                                            <div className="text-sm font-semibold">Upload Photo</div>
                                            <div className="text-muted-foreground text-xs">Click to browse</div>
                                        </div>
                                    )}
                                </button>

                                <div className="flex flex-wrap justify-center gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('photo')?.click()}>
                                        <UploadIcon className="mr-1 size-4" />
                                        {photoPreviewUrl ? 'Change Photo' : 'Choose Photo'}
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

                                <p className="text-muted-foreground text-center text-xs">Supported: jpeg, jpg, png, webp (max 2MB)</p>
                            </div>
                        </div>

                        {/* Fingerprint Scanner Card */}
                        <div className="bg-card rounded-xl border p-6">
                            <h3 className="mb-4 text-lg font-medium">Fingerprint Enrollment</h3>
                            <FingerprintScanner mode="enroll" onCapture={handleFingerprintCapture} />
                            {fingerprintTemplate && (
                                <div className="mt-4 rounded-lg bg-green-50 p-3 text-center text-sm text-green-700">
                                    Fingerprint captured successfully
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Employee Details */}
                    <div className="space-y-6">
                        <div className="bg-card rounded-xl border p-6">
                            <h3 className="mb-4 text-lg font-medium">Employee Details</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter full name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username">
                                        Username <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Enter username"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Password <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="office">
                                        Office <span className="text-red-500">*</span>
                                    </Label>
                                    <CustomComboBox
                                        items={officeOptions}
                                        placeholder="Select an office"
                                        value={data.office_id || null}
                                        onSelect={(value) => setData('office_id', value ?? '')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Employee'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
