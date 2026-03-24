import { FingerprintDeviceStatus } from '@/components/device-status-indicator';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Fingerprint, Scan, User, UserCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { FingerprintScanner } from './fingerprint-scanner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Identify Employee',
        href: '/employees/identify',
    },
];

interface IdentifiedEmployee {
    id: number;
    name: string;
}

interface IdentificationResult {
    success: boolean;
    match: boolean;
    score?: number;
    employee_data?: IdentifiedEmployee;
    message?: string;
}

interface PageProps {
    result?: IdentificationResult;

    [key: string]: any;
}

export default function IdentifyEmployee({ result }: PageProps) {
    console.log('data:', result);
    const { props } = usePage<PageProps>();
    const [isIdentifying, setIsIdentifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data, setData, post, processing, reset, transform } = useForm({
        fingerprint_template: '',
    });

    const handleFingerprintCapture = (template: string, quality: number) => {
        // Set the data synchronously then post
        setData('fingerprint_template', template);

        // Use transform to ensure the data is included in the request
        transform((formData) => ({
            ...formData,
            fingerprint_template: template,
        }));

        post(route('biometric.identify'), {
            preserveScroll: true,
            onStart: () => {
                setIsIdentifying(true);
                setError(null);
            },
            onError: () => {
                setError('Something went wrong.');
            },
            onFinish: () => {
                setIsIdentifying(false);
            },
        });
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
    };

    const handleReset = () => {
        setError(null);
        // Reload the page to clear the flash message
        router.reload();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Identify Employee" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Identify Employee" description="Scan a fingerprint to identify an employee" />
                <FingerprintDeviceStatus />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left Column - Scanner */}
                    <div className="lg:col-span-5">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Scan className="h-5 w-5" />
                                    Fingerprint Scanner
                                </CardTitle>
                                <CardDescription>Place your finger on the reader to identify</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FingerprintScanner
                                    mode="identify"
                                    onCapture={handleFingerprintCapture}
                                    onError={handleError}
                                    showStatus={false}
                                    className="mx-auto"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Result */}
                    <div className="space-y-4 lg:col-span-7">
                        {/* Identification Result - Match */}
                        {result?.match && result.employee_data && (
                            <Card className="border-green-200 bg-green-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-800">
                                        <UserCheck className="h-6 w-6" />
                                        Employee Identified
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-full">
                                            <User className="text-primary-foreground h-8 w-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-green-900">{result.employee_data.name}</h3>
                                            <p className="text-green-700">Employee ID: {result.employee_data.id}</p>
                                            {result.score && <p className="text-sm text-green-600">Match Score: {result.score}</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button onClick={handleReset} variant="outline" className="gap-2">
                                            <Scan className="h-4 w-4" />
                                            Scan Again
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* No Match Result */}
                        {result && !result.match && (
                            <Card className="border-red-200 bg-red-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-800">
                                        <XCircle className="h-6 w-6" />
                                        No Match Found
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-red-700">{result.message || 'No matching fingerprint found in the database.'}</p>
                                    <Button onClick={handleReset} variant="outline" className="gap-2">
                                        <Scan className="h-4 w-4" />
                                        Try Again
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Error Display */}
                        {error && !result && (
                            <Card className="border-red-200 bg-red-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-800">
                                        <XCircle className="h-6 w-6" />
                                        Error
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-red-700">{error}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Instructions Card */}
                        {!result && !error && (
                            <Card className="border-blue-200 bg-blue-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-800">
                                        <Fingerprint className="h-5 w-5" />
                                        How to Identify
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-blue-700">
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium text-blue-800">
                                            1
                                        </span>
                                        <p>Make sure the fingerprint reader is connected and ready.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium text-blue-800">
                                            2
                                        </span>
                                        <p>Click "Scan to Identify" button to start scanning.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium text-blue-800">
                                            3
                                        </span>
                                        <p>Place your finger firmly on the reader and hold steady.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium text-blue-800">
                                            4
                                        </span>
                                        <p>The system will match your fingerprint and display the employee information.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
