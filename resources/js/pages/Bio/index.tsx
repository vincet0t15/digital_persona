import { CustomComboBox } from '@/components/CustomComboBox';
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
        setCurrentFingerprint({
            template,
            quality,
            finger_name: selectedFinger,
        });
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
                {/* Header */}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Content Grid */}
                    <div className="bg-background rounded-xl p-6 shadow">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                                    className="bg-background relative flex aspect-square w-full max-w-xs cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed"
                                    onClick={() => document.getElementById('photo')?.click()}
                                >
                                    {photoPreviewUrl ? (
                                        <img src={photoPreviewUrl} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                                            <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                                                <UploadCloud className="text-muted-foreground size-5" />
                                            </div>
                                            <div className="text-sm font-semibold">Upload Photo</div>
                                            <div className="text-muted-foreground text-xs">Click to browse</div>
                                        </div>
                                    )}
                                </button>

                                <div className="flex flex-wrap justify-center gap-2">
                                    <Button type="button" variant="outline" onClick={() => document.getElementById('photo')?.click()}>
                                        <UploadCloud className="mr-1 size-4" />
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
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2">
                                    <div className="flex w-full flex-col gap-1">
                                        <Label>First Name</Label>
                                        <Input name="first_name" placeholder="First Name" />
                                    </div>
                                    <div className="flex w-full flex-col gap-1">
                                        <Label>Middle Name</Label>
                                        <Input name="middle_name" placeholder="Middle Name" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2">
                                    <div className="flex w-full flex-col gap-1">
                                        <Label>Last Name</Label>
                                        <Input name="last_name" placeholder="Last Name" />
                                    </div>
                                    <div className="flex w-full flex-col gap-1">
                                        <Label>Suffix</Label>
                                        <CustomComboBox
                                            items={[
                                                { value: 'Jr.', label: 'Jr.' },
                                                { value: 'Sr.', label: 'Sr.' },
                                                { value: 'II', label: 'II' },
                                                { value: 'III', label: 'III' },
                                            ]}
                                            placeholder="Suffix"
                                        />
                                    </div>
                                </div>

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
                            </div>
                            <div className="space-y-4">
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
                                <FingerprintScanner mode="enroll" onCapture={handleFingerprintCapture} />

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
                                            <div className="space-y-2">
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
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
