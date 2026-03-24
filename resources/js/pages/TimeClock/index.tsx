import { FingerprintDeviceStatus } from '@/components/device-status-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FingerprintScanner } from '@/pages/Bio/fingerprint-scanner';
import { Head, router } from '@inertiajs/react';
import { Clock, Fingerprint, LogIn, LogOut } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast, Toaster } from 'sonner';

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
    clock_result?: ClockResult;
}

export default function TimeClock({ clock_result }: TimeClockProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanKey, setScanKey] = useState(0);
    const [selectedLogType, setSelectedLogType] = useState<'IN' | 'OUT'>('IN');

    const selectedLogTypeRef = useRef(selectedLogType);
    selectedLogTypeRef.current = selectedLogType;

    const handleFingerprintCapture = useCallback((template: string, quality: number) => {
        const currentLogType = selectedLogTypeRef.current;

        setIsProcessing(true);

        router.post(
            route('timeclock.clock'),
            { fingerprint_template: template, log_type: currentLogType },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const flash = (page.props as { flash?: { success?: string; error?: string } }).flash;
                    if (flash?.error) {
                        toast.error(flash.error);
                    }
                    if (flash?.success) {
                        toast.success(flash.success);
                    }
                },
                onFinish: () => {
                    setScanKey((prev) => prev + 1);
                    setIsProcessing(false);
                },
            },
        );
    }, []);

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

    const getInitials = (name?: string | null) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        const initials = parts
            .slice(0, 2)
            .map((p) => p[0])
            .join('');
        return initials.toUpperCase();
    };

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
            <Head title="Time Clock" />
            <Toaster position="top-right" />
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-600">
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
                                    <CardDescription>Choose Time In or Time Out then place your finger on the scanner</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FingerprintDeviceStatus />

                                    {/* Time In / Out Toggle */}
                                    <div className="flex justify-center gap-3">
                                        <Button
                                            type="button"
                                            variant={selectedLogType === 'IN' ? 'default' : 'outline'}
                                            className="gap-2"
                                            onClick={() => setSelectedLogType('IN')}
                                            disabled={isProcessing}
                                        >
                                            <LogIn className="h-4 w-4" />
                                            Time In
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={selectedLogType === 'OUT' ? 'default' : 'outline'}
                                            className="gap-2"
                                            onClick={() => setSelectedLogType('OUT')}
                                            disabled={isProcessing}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Time Out
                                        </Button>
                                    </div>

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
                                        <div className="rounded-sm border border-blue-200 bg-blue-50 p-4 text-center">
                                            <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-sm border-2 border-blue-500 border-t-transparent" />
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
                                        Last Time Log
                                    </CardTitle>
                                    <CardDescription>Most recent time in/out entry</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {clock_result ? (
                                            <div className="flex items-center gap-3">
                                                {/* Avatar / Image */}
                                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                                                    {clock_result.employee.image ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={clock_result.employee.image}
                                                            alt={clock_result.employee.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-semibold text-gray-700">
                                                            {getInitials(clock_result.employee.name)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{clock_result.employee.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {clock_result.log_type === 'IN' ? 'Time In' : 'Time Out'} at {clock_result.time}
                                                    </p>
                                                </div>

                                                {/* Log Type Badge */}
                                                <div className="text-right">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            clock_result.log_type === 'IN'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-orange-100 text-orange-700'
                                                        }`}
                                                    >
                                                        {clock_result.log_type}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-dashed p-8 text-center">
                                                <Clock className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                <p className="text-sm text-gray-500">No time logs yet</p>
                                                <p className="text-xs text-gray-400">Scan your fingerprint to record your first log.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
