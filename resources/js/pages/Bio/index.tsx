import { CustomComboBox } from '@/components/CustomComboBox';
import { FingerprintDeviceStatus } from '@/components/device-status-indicator';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { EmployeeCreate, FingerprintData } from '@/types/employee';
import { Office } from '@/types/office';
import { Head, useForm } from '@inertiajs/react';
import { Fingerprint, UploadCloud, X, XIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { FingerprintScanner } from './fingerprint-scanner';

interface DuplicateCheckResult {
    duplicate: boolean;
    employee?: {
        id: number;
        name: string;
    };
    message?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Create Employee',
        href: '/employees/create',
    },
];

interface RegisterBiometricProps {
    offices: Office[];
}

const FINGER_OPTIONS = [
    { value: 'Right Thumb', label: 'Right Thumb' },
    { value: 'Right Index', label: 'Right Index' },
    { value: 'Right Middle', label: 'Right Middle' },
    { value: 'Right Ring', label: 'Right Ring' },
    { value: 'Right Pinky', label: 'Right Pinky' },
    { value: 'Left Thumb', label: 'Left Thumb' },
    { value: 'Left Index', label: 'Left Index' },
    { value: 'Left Middle', label: 'Left Middle' },
    { value: 'Left Ring', label: 'Left Ring' },
    { value: 'Left Pinky', label: 'Left Pinky' },
];

export default function RegisterBiometric({ offices }: RegisterBiometricProps) {
    const { data, setData, post, processing } = useForm<EmployeeCreate>({
        name: '',
        username: '',
        office_id: '',
        password: '',
        photo: '',
        fingerprints_json: '',
    });

    const [fingerprints, setFingerprints] = useState<FingerprintData[]>([]);

    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [selectedFinger, setSelectedFinger] = useState<string>('Right Thumb');
    const [currentFingerprint, setCurrentFingerprint] = useState<FingerprintData | null>(null);
    const [duplicateWarning, setDuplicateWarning] = useState<DuplicateCheckResult | null>(null);
    const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
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

    const handleFingerprintCapture = async (template: string, quality: number) => {
        setDuplicateWarning(null);
        setIsCheckingDuplicate(true);

        try {
            const response = await fetch(route('biometric.check-duplicate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    fingerprint_template: template,
                }),
            });

            const result: DuplicateCheckResult = await response.json();

            if (result.duplicate) {
                setDuplicateWarning(result);
                setCurrentFingerprint(null);
            } else {
                setCurrentFingerprint({
                    template,
                    quality,
                    finger_name: selectedFinger,
                });
            }
        } catch (error) {
            console.error('Error checking duplicate fingerprint:', error);
            setCurrentFingerprint({
                template,
                quality,
                finger_name: selectedFinger,
            });
        } finally {
            setIsCheckingDuplicate(false);
        }

        console.log('Fingerprint captured with quality:', quality);
    };

    const handleAddFingerprint = () => {
        if (currentFingerprint) {
            const newFingerprints = [...fingerprints, currentFingerprint];
            setFingerprints(newFingerprints);
            setData('fingerprints_json', JSON.stringify(newFingerprints));
            setCurrentFingerprint(null);
        }
    };

    const handleRemoveFingerprint = (index: number) => {
        const newFingerprints = fingerprints.filter((_, i) => i !== index);
        setFingerprints(newFingerprints);
        setData('fingerprints_json', JSON.stringify(newFingerprints));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (fingerprints.length === 0) {
            alert('Please add at least one fingerprint');
            return;
        }

        post(route('employees.store'), {
            onSuccess: () => {
                console.log('Employee created successfully');
            },
            onError: (errors) => {
                console.error('Form errors:', errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Employee" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Register Employee" description="Register a new employee with biometric data" />
                <FingerprintDeviceStatus />
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Content Grid - 3 columns on desktop */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* LEFT COLUMN - Photo (2 columns) */}
                        <div className="lg:col-span-3">
                            <div className="sticky top-4 flex flex-col items-center space-y-4">
                                <input
                                    id="photo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />

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

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Full Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter full name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                            </div>

                            {/* Office */}
                            <div className="space-y-2">
                                <Label htmlFor="office">
                                    Office <span className="text-destructive">*</span>
                                </Label>
                                <CustomComboBox
                                    items={officeOptions}
                                    placeholder="Select an office"
                                    value={data.office_id || null}
                                    onSelect={(value) => setData('office_id', value ?? '')}
                                />
                            </div>

                            <Separator className="my-4" />

                            {/* Account Credentials */}
                            <h3 className="text-lg font-semibold">Account Credentials</h3>

                            <div className="space-y-2">
                                <Label htmlFor="username">
                                    Username <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="username"
                                    name="username"
                                    placeholder="Enter username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN - Biometric (5 columns) */}
                        <div className="space-y-4 lg:col-span-5">
                            <h3 className="text-lg font-semibold">Biometric Enrollment</h3>

                            <div className="space-y-2">
                                <Label htmlFor="finger-select">Select Finger</Label>
                                <Select value={selectedFinger} onValueChange={setSelectedFinger}>
                                    <SelectTrigger id="finger-select">
                                        <SelectValue placeholder="Select a finger" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FINGER_OPTIONS.map((finger) => (
                                            <SelectItem key={finger.value} value={finger.value}>
                                                {finger.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Scanner */}
                            <FingerprintScanner mode="enroll" onCapture={handleFingerprintCapture} showStatus={false} />

                            {/* Checking Duplicate Loader */}
                            {isCheckingDuplicate && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                        <p className="text-sm text-blue-700">Checking fingerprint database...</p>
                                    </div>
                                </div>
                            )}

                            {/* Duplicate Warning */}
                            {duplicateWarning && duplicateWarning.duplicate && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                                            <XIcon className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-red-900">Duplicate Fingerprint Detected</p>
                                            <p className="text-sm text-red-700">
                                                {duplicateWarning.message || 'This fingerprint is already registered.'}
                                            </p>
                                            {duplicateWarning.employee && (
                                                <p className="mt-1 text-sm font-medium text-red-800">
                                                    Employee: {duplicateWarning.employee.name} (ID: {duplicateWarning.employee.id})
                                                </p>
                                            )}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => setDuplicateWarning(null)}
                                            >
                                                Dismiss
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Current Captured Fingerprint */}
                            {currentFingerprint && (
                                <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                                <Fingerprint className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-900">{currentFingerprint.finger_name}</p>
                                                <p className="text-sm text-green-700">Quality: {currentFingerprint.quality}%</p>
                                            </div>
                                        </div>
                                        <Button type="button" size="sm" onClick={handleAddFingerprint}>
                                            Add Fingerprint
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* List of Added Fingerprints */}
                            {fingerprints.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium">Enrolled Fingerprints ({fingerprints.length})</h4>
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            {fingerprints.map((fp: FingerprintData, index: number) => (
                                                <div key={index} className="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
                                                    <div className="flex items-center gap-3">
                                                        <Fingerprint className="text-muted-foreground h-4 w-4" />
                                                        <div>
                                                            <p className="text-sm font-medium">{fp.finger_name}</p>
                                                            <p className="text-muted-foreground text-xs">Quality: {fp.quality}%</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveFingerprint(index)}
                                                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4 border-t pt-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Registering...' : 'Register Employee'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
