import { FingerprintDeviceStatus } from '@/components/device-status-indicator';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Employee, FingerprintData } from '@/types/employee';
import { Office } from '@/types/office';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Fingerprint, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { FingerprintScanner } from '../Bio/fingerprint-scanner';

interface FingerprintsPageProps {
    employee: Employee;
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

const REQUIRED_SAMPLES = 5;

export default function ManageFingerprints({ employee }: FingerprintsPageProps) {
    const { data, setData, post, processing, reset } = useForm({
        fingerprints_json: '',
    });

    const [fingerprints, setFingerprints] = useState<FingerprintData[]>([]);
    const [selectedFinger, setSelectedFinger] = useState<string>('Right Thumb');
    const [currentFingerprint, setCurrentFingerprint] = useState<FingerprintData | null>(null);
    const [pendingSamples, setPendingSamples] = useState<FingerprintData[]>([]);
    const [currentSampleIndex, setCurrentSampleIndex] = useState(0);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Employee List',
            href: '/employees',
        },
        {
            title: `${employee.name} - Fingerprints`,
            href: route('employees.fingerprints', employee.id),
        },
    ];

    const handleFingerprintCapture = (template: string, quality: number) => {
        const sample: FingerprintData = {
            template,
            quality,
            finger_name: selectedFinger,
        };

        const newSamples = [...pendingSamples, sample];
        setPendingSamples(newSamples);

        if (newSamples.length >= REQUIRED_SAMPLES) {
            setCurrentFingerprint({
                template,
                quality,
                finger_name: selectedFinger,
                samples: newSamples,
            });
            setPendingSamples([]);
            setCurrentSampleIndex(0);
            toast.success(`${selectedFinger} fingerprint captured successfully! Click "Add Fingerprint" to save.`);
        } else {
            setCurrentSampleIndex(newSamples.length);
            setCurrentFingerprint(null);
            toast.info(`Sample ${newSamples.length} of ${REQUIRED_SAMPLES} captured. Please scan again.`);
        }
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
            toast.error('Please add at least one fingerprint');
            return;
        }

        post(route('employees.fingerprints.store', employee.id), {
            onSuccess: () => {
                setFingerprints([]);
                setCurrentFingerprint(null);
                setPendingSamples([]);
                setCurrentSampleIndex(0);
                reset();
            },
            onError: () => {
                toast.error('Failed to save fingerprints. Please try again.');
            },
        });
    };

    const handleDeleteFingerprint = (fingerprintId: number) => {
        if (confirm('Are you sure you want to delete this fingerprint?')) {
            router.delete(route('employees.fingerprints.delete', [employee.id, fingerprintId]), {
                onSuccess: () => {
                    toast.success('Fingerprint deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete fingerprint');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${employee.name} - Fingerprints`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.visit(route('employees.index'))}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to List
                    </Button>
                </div>

                <Heading
                    title={`${employee.name} - Fingerprint Management`}
                    description={`Manage fingerprints for ${employee.name}. Currently enrolled: ${employee.fingerprints?.length || 0} fingerprint(s).`}
                />

                <FingerprintDeviceStatus />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Left Column - Existing Fingerprints */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Fingerprint className="h-5 w-5" />
                                Enrolled Fingerprints
                            </CardTitle>
                            <CardDescription>
                                {employee.fingerprints?.length
                                    ? `${employee.fingerprints.length} fingerprint(s) enrolled`
                                    : 'No fingerprints enrolled yet'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {employee.fingerprints && employee.fingerprints.length > 0 ? (
                                <div className="space-y-2">
                                    {employee.fingerprints.map((fp: any) => (
                                        <div key={fp.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
                                            <div className="flex items-center gap-3">
                                                <Fingerprint className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium">{fp.finger_name}</p>
                                                    <p className="text-xs text-gray-500">Quality: {fp.fingerprint_quality}%</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                                onClick={() => handleDeleteFingerprint(fp.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed p-8 text-center">
                                    <Fingerprint className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                    <p className="text-sm text-gray-500">No fingerprints enrolled</p>
                                    <p className="text-xs text-gray-400">Use the form on the right to add fingerprints</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column - Add New Fingerprints */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Fingerprint className="h-5 w-5" />
                                Add New Fingerprints
                            </CardTitle>
                            <CardDescription>Enroll additional fingerprints for this employee</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
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

                                <FingerprintScanner
                                    mode="enroll"
                                    onCapture={handleFingerprintCapture}
                                    showStatus={false}
                                    requiredSamples={REQUIRED_SAMPLES}
                                    currentSample={currentSampleIndex}
                                    autoScan={true}
                                />

                                {/* Sample Progress */}
                                {pendingSamples.length > 0 && pendingSamples.length < REQUIRED_SAMPLES && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-700">Collecting Samples...</p>
                                                <p className="text-xs text-blue-600">
                                                    {pendingSamples.length} of {REQUIRED_SAMPLES} samples collected. Please scan again.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex gap-1">
                                            {Array.from({ length: REQUIRED_SAMPLES }).map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`h-2 flex-1 rounded-full ${
                                                        idx < pendingSamples.length ? 'bg-green-500' : 'bg-blue-200'
                                                    }`}
                                                />
                                            ))}
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

                                {/* List of New Fingerprints to Add */}
                                {fingerprints.length > 0 && (
                                    <>
                                        <Separator />
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium">New Fingerprints to Add ({fingerprints.length})</h4>
                                            <div className="space-y-2">
                                                {fingerprints.map((fp: FingerprintData, index: number) => (
                                                    <div key={index} className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
                                                        <div className="flex items-center gap-3">
                                                            <Fingerprint className="h-4 w-4 text-gray-500" />
                                                            <div>
                                                                <p className="text-sm font-medium">{fp.finger_name}</p>
                                                                <p className="text-xs text-gray-500">Quality: {fp.quality}%</p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveFingerprint(index)}
                                                            className="h-8 w-8 text-gray-500 hover:text-red-500"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" disabled={processing || fingerprints.length === 0} className="flex-1">
                                        {processing ? 'Saving...' : `Save ${fingerprints.length} Fingerprint(s)`}
                                    </Button>
                                    {fingerprints.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setFingerprints([]);
                                                setCurrentFingerprint(null);
                                                setPendingSamples([]);
                                                setCurrentSampleIndex(0);
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
