import { CustomComboBox } from '@/components/CustomComboBox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { EmployeeCreate, FingerprintData } from '@/types/employee';
import { Office } from '@/types/office';
import { Head, useForm } from '@inertiajs/react';
import { Camera, Fingerprint, Trash2, Upload, UserPlus, X } from 'lucide-react';
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
            <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-xl shadow-sm">
                            <UserPlus className="text-primary-foreground h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Create Employee</h1>
                            <p className="text-muted-foreground text-sm">Register a new employee with biometric data</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Content Grid */}
                    <div className="grid gap-6 lg:grid-cols-12">
                        {/* Left Column - Biometric Data */}
                        <div className="space-y-6 lg:col-span-5">
                            {/* Photo Upload Card */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Camera className="h-5 w-5" />
                                        Employee Photo
                                    </CardTitle>
                                    <CardDescription>Upload a profile photo for the employee</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <input
                                        id="photo"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handlePhotoChange}
                                    />

                                    <div className="flex flex-col items-center gap-4">
                                        {/* Photo Preview */}
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('photo')?.click()}
                                            className="bg-muted/50 hover:bg-muted group relative flex aspect-square w-full max-w-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all"
                                        >
                                            {photoPreviewUrl ? (
                                                <img src={photoPreviewUrl} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                                                    <div className="bg-background group-hover:bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition-colors">
                                                        <Upload className="text-muted-foreground group-hover:text-primary h-6 w-6 transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">Click to upload photo</p>
                                                        <p className="text-muted-foreground text-xs">JPG, PNG, WebP up to 2MB</p>
                                                    </div>
                                                </div>
                                            )}
                                        </button>

                                        {/* Photo Actions */}
                                        <div className="flex flex-wrap justify-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.getElementById('photo')?.click()}
                                            >
                                                <Camera className="mr-2 h-4 w-4" />
                                                {photoPreviewUrl ? 'Change Photo' : 'Choose Photo'}
                                            </Button>

                                            {photoPreviewUrl && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (photoPreviewUrlRef.current) {
                                                            URL.revokeObjectURL(photoPreviewUrlRef.current);
                                                            photoPreviewUrlRef.current = null;
                                                        }
                                                        setPhotoPreviewUrl(null);
                                                        setData('photo', null);
                                                    }}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Fingerprint Enrollment Card */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Fingerprint className="h-5 w-5" />
                                        Fingerprint Enrollment
                                    </CardTitle>
                                    <CardDescription>Enroll one or more fingerprints for biometric identification</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Finger Selection */}
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
                                                        <div
                                                            key={index}
                                                            className="bg-muted/30 flex items-center justify-between rounded-lg border p-3"
                                                        >
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
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Employee Details */}
                        <div className="space-y-6 lg:col-span-7">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg">Employee Information</CardTitle>
                                    <CardDescription>Enter the employee's personal and account details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Full Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="Enter employee's full name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    {/* Username & Password Grid */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">
                                                Username <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="username"
                                                type="text"
                                                placeholder="Enter username"
                                                value={data.username}
                                                onChange={(e) => setData('username', e.target.value)}
                                                required
                                                className="h-11"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password">
                                                Password <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Enter password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                required
                                                className="h-11"
                                            />
                                        </div>
                                    </div>

                                    {/* Office Field */}
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
                                </CardContent>
                            </Card>

                            {/* Submit Actions */}
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" onClick={() => window.history.back()} className="w-full sm:w-auto">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                    {processing ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Create Employee
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
