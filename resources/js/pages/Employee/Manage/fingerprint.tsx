import { FingerprintDeviceStatus } from '@/components/device-status-indicator';
import { FingerprintScanner } from '@/components/fingerprint-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Employee, FingerprintData } from '@/types/employee';
import { Office } from '@/types/office';
import { router, useForm } from '@inertiajs/react';
import { Fingerprint, Trash2, X, XIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DeleteFingerPrintDialog } from './deleteFingerPrintDialog';

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

interface DuplicateWarning {
    duplicate: boolean;
    message?: string;
    employee?: {
        id: number;
        name: string;
    };
}

export default function ManageFingerprints({ employee }: FingerprintsPageProps) {
    const { data, setData, post, processing, reset } = useForm({
        fingerprints_json: '',
    });

    const [fingerprints, setFingerprints] = useState<FingerprintData[]>([]);
    const [selectedFinger, setSelectedFinger] = useState<string>('Right Thumb');
    const [currentFingerprint, setCurrentFingerprint] = useState<FingerprintData | null>(null);
    const [pendingSamples, setPendingSamples] = useState<FingerprintData[]>([]);
    const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
    const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
    const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedFingerprintId, setSelectedFingerprintId] = useState<number | null>(null);

    const handleFingerprintCapture = (template: string, quality: number) => {
        setDuplicateWarning(null);
        setIsCheckingDuplicate(true);

        router.post(
            route('biometric.check-duplicate'),
            { fingerprint_template: template },
            {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    const result = page.props.result as DuplicateWarning;
                    setIsCheckingDuplicate(false);

                    if (result?.duplicate) {
                        setDuplicateWarning(result);
                        setCurrentFingerprint(null);
                        setPendingSamples([]);
                        setCurrentSampleIndex(0);
                        toast.error(result.message || 'This fingerprint is already registered.');
                        return;
                    }

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
                },
                onError: () => {
                    setIsCheckingDuplicate(false);

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
                },
            },
        );
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
            onSuccess: (response: { props: FlashProps }) => {
                toast.success(response.props.flash?.success);
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
        setSelectedFingerprintId(fingerprintId);
        setDeleteDialogOpen(true);
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
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

                            {/* Sample Progress - Collecting */}
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
                                                className={`h-2 flex-1 rounded-full ${idx < pendingSamples.length ? 'bg-green-500' : 'bg-blue-200'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sample Progress - Complete (Ready to Add) */}
                            {currentFingerprint && currentFingerprint.samples && currentFingerprint.samples.length >= REQUIRED_SAMPLES && (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-green-700">All Samples Collected!</p>
                                            <p className="text-xs text-green-600">
                                                {REQUIRED_SAMPLES} of {REQUIRED_SAMPLES} samples ready. Click &quot;Add Fingerprint&quot; to save.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-1">
                                        {Array.from({ length: REQUIRED_SAMPLES }).map((_, idx) => (
                                            <div key={idx} className="h-2 flex-1 rounded-full bg-green-500" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sample Progress - Added to List */}
                            {fingerprints.length > 0 &&
                                fingerprints[fingerprints.length - 1]?.samples &&
                                fingerprints[fingerprints.length - 1].samples!.length >= REQUIRED_SAMPLES &&
                                !currentFingerprint && (
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-green-700">Fingerprint Added!</p>
                                                <p className="text-xs text-green-600">
                                                    {REQUIRED_SAMPLES} of {REQUIRED_SAMPLES} samples saved. Ready to enroll another finger.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex gap-1">
                                            {Array.from({ length: REQUIRED_SAMPLES }).map((_, idx) => (
                                                <div key={idx} className="h-2 flex-1 rounded-full bg-green-500" />
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* Checking Duplicate Loader */}
                            {isCheckingDuplicate && pendingSamples.length === 0 && (
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
                                                {currentFingerprint.samples && (
                                                    <p className="text-xs text-green-600">{currentFingerprint.samples.length} samples collected</p>
                                                )}
                                            </div>
                                        </div>
                                        <Button type="button" size="sm" onClick={handleAddFingerprint}>
                                            Add Fingerprint
                                        </Button>
                                    </div>
                                    {currentFingerprint.samples && (
                                        <div className="mt-3 flex gap-1">
                                            {currentFingerprint.samples.map((sample, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex h-8 flex-1 items-center justify-center rounded bg-green-100 text-xs font-medium text-green-700"
                                                    title={`Sample ${idx + 1}: ${sample.quality}% quality`}
                                                >
                                                    {sample.quality}%
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                                <div key={index} className="bg-muted/30 flex flex-col rounded-lg border p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Fingerprint className="text-muted-foreground h-4 w-4" />
                                                            <div>
                                                                <p className="text-sm font-medium">{fp.finger_name}</p>
                                                                <p className="text-muted-foreground text-xs">
                                                                    Quality: {fp.quality}%{fp.samples && ` • ${fp.samples.length} samples`}
                                                                </p>
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
                                                    {fp.samples && (
                                                        <div className="mt-2 flex gap-1">
                                                            {fp.samples.map((sample, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="h-1.5 flex-1 rounded-full bg-green-500"
                                                                    title={`Sample ${idx + 1}: ${sample.quality}% quality`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
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
            <DeleteFingerPrintDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                employee={employee}
                fingerprintId={selectedFingerprintId ?? 0}
            />
        </div>
    );
}
