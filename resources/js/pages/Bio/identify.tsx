import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Fingerprint, Scan, User, UserCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
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
    data?: IdentifiedEmployee;
    message?: string;
}

interface PageProps {
    result?: IdentificationResult;
    [key: string]: any;
}

export default function IdentifyEmployee() {
    const { props } = usePage<PageProps>();
    const [scanResult, setScanResult] = useState<IdentificationResult | null>(null);
    const [isIdentifying, setIsIdentifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data, setData, post, processing, reset, transform } = useForm({
        fingerprint_template: '',
    });

    // Handle flash message from backend
    useEffect(() => {
        console.log('Props changed:', props);
        if (props.result) {
            console.log('Result received:', props.result);
            setScanResult(props.result);
            if (!props.result.success) {
                setError(props.result.message || 'Identification failed');
            }
        }
    }, [props.result]);

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
                setScanResult(null);
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
        setScanResult(null);
    };

    const handleReset = () => {
        setScanResult(null);
        setError(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Identify Employee" />
            <div className="mx-auto max-w-2xl p-4">
                <div className="mb-6 flex items-center gap-3">
                    <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
                        <Fingerprint className="text-primary-foreground h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Identify Employee</h1>
                        <p className="text-muted-foreground text-sm">Scan a fingerprint to identify an employee</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Fingerprint Scanner Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scan className="h-5 w-5" />
                                Fingerprint Scanner
                            </CardTitle>
                            <CardDescription>Place your finger on the reader to identify</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FingerprintScanner mode="identify" onCapture={handleFingerprintCapture} onError={handleError} className="mx-auto" />
                        </CardContent>
                    </Card>

                    {/* Identification Result */}
                    {scanResult?.match && scanResult.data && (
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
                                        <h3 className="text-xl font-semibold text-green-900">{scanResult.data.name}</h3>
                                        <p className="text-green-700">Employee ID: {scanResult.data.id}</p>
                                        {scanResult.score && <p className="text-sm text-green-600">Match Score: {scanResult.score}</p>}
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
                    {scanResult && !scanResult.match && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-800">
                                    <XCircle className="h-6 w-6" />
                                    No Match Found
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-red-700">{scanResult.message || 'No matching fingerprint found in the database.'}</p>
                                <Button onClick={handleReset} variant="outline" className="gap-2">
                                    <Scan className="h-4 w-4" />
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Error Display */}
                    {error && !scanResult && (
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
                </div>
            </div>
        </AppLayout>
    );
}
