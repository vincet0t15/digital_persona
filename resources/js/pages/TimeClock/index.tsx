import { FingerprintDeviceStatus } from '@/components/device-status-indicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FingerprintScanner } from '@/pages/Bio/fingerprint-scanner';
import { Head, router } from '@inertiajs/react';
import { Clock, Fingerprint } from 'lucide-react';
import { useState } from 'react';

interface TimeLog {
    id: number;
    employee_id: number;
    employee: {
        id: number;
        name: string;
        image: string | null;
    };
    log_type: 'IN' | 'OUT';
    date_time: string;
}

interface ClockResult {
    employee: {
        id: number;
        name: string;
        image: string | null;
    };
    log_type: 'IN' | 'OUT';
    time: string;
}

interface TimeClockProps {
    flash?: {
        success?: string;
        error?: string;
    };
    clock_result?: ClockResult;
}

export default function TimeClock({ flash, clock_result }: TimeClockProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanKey, setScanKey] = useState(0);

    const handleFingerprintCapture = async (template: string, quality: number) => {
        setIsProcessing(true);
        router.post(
            route('timeclock.clock'),
            { fingerprint_template: template },

            {
                preserveScroll: true,
                onFinish: () => {
                    setScanKey((prev) => prev + 1);
                    setIsProcessing(false);
                },
                onError: () => {
                    console.log(1);
                },
            },
        );
    };

    const formatTime = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
            <Head title="Time Clock" />

            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Time Clock</h1>
                            <p className="text-xs text-gray-500">Employee Attendance System</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                            {new Date().toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                            })}
                        </p>
                        <p className="text-sm text-gray-500">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6">
                <div className="mx-auto">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column - Scanner */}
                        <div className="lg:col-span-2">
                            <Card className="h-full">
                                <CardHeader className="text-center">
                                    <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                                        <Fingerprint className="h-6 w-6" />
                                        Scan Fingerprint
                                    </CardTitle>
                                    <CardDescription>Place your finger on the scanner to record your time in or out</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FingerprintDeviceStatus />

                                    <div className="flex justify-center">
                                        <FingerprintScanner
                                            key={scanKey}
                                            mode="identify"
                                            onCapture={handleFingerprintCapture}
                                            showStatus={false}
                                            autoScan={true}
                                        />
                                    </div>

                                    {isProcessing && (
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                                            <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                            <p className="text-sm text-blue-700">Processing fingerprint...</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Recent Logs */}
                        <div>
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Clock className="h-5 w-5" />
                                        Recent Logs
                                    </CardTitle>
                                    <CardDescription>Last 20 time clock entries</CardDescription>
                                </CardHeader>
                                <CardContent>{/*  */}</CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
