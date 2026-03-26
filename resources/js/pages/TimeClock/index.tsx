import { FingerprintDeviceStatus } from '@/components/device-status-indicator';
import { FingerprintScanner } from '@/components/fingerprint-scanner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Head, router } from '@inertiajs/react';
import { Clock, Fingerprint, LogIn, LogOut } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast, Toaster } from 'sonner';

interface TimeLog {
    id: number;
    employee: {
        id: number;
        name: string;
        image: string | null;
    };
    log_type: 'IN' | 'OUT';
    time: string;
    date: string;
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
    recent_logs?: TimeLog[];
}

export default function TimeClock({ clock_result, recent_logs = [] }: TimeClockProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanKey, setScanKey] = useState(0);
    const [selectedLogType, setSelectedLogType] = useState<'IN' | 'OUT'>('IN');
    const [currentTime, setCurrentTime] = useState(new Date());

    const selectedLogTypeRef = useRef(selectedLogType);
    selectedLogTypeRef.current = selectedLogType;

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
        <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
            <Head title="Time Clock" />
            <Toaster position="top-right" richColors />

            {/* Header */}
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Time Clock Platform</h1>
                            <p className="text-sm font-medium text-slate-500">Biometric Attendance System</p>
                        </div>
                    </div>
                    <div className="hidden text-right sm:block">
                        <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                            {currentTime.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                            })}
                        </p>
                        <p className="text-sm font-medium text-slate-500">
                            {currentTime.toLocaleDateString('en-US', {
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
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Left Column - Scanner */}
                        <div className="lg:col-span-2">
                            <Card className="h-full border-slate-200 shadow-sm">
                                <CardHeader className="border-b border-slate-100 pb-8 text-center">
                                    <CardTitle className="flex items-center justify-center gap-2 text-3xl font-bold text-slate-900">
                                        <Fingerprint className="h-8 w-8 text-blue-600" />
                                        Scan Fingerprint
                                    </CardTitle>
                                    <CardDescription className="mt-2 text-base">
                                        Select Time In or Time Out, then place your finger on the scanner
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 px-8 pt-8">
                                    {/* Status Indicator */}
                                    <div className="mx-auto max-w-md">
                                        <FingerprintDeviceStatus />
                                    </div>

                                    {/* Time In / Out Toggle */}
                                    <div className="flex justify-center gap-4">
                                        <Button
                                            type="button"
                                            variant={selectedLogType === 'IN' ? 'default' : 'outline'}
                                            size="lg"
                                            className={`w-40 gap-3 text-sm font-semibold transition-all ${selectedLogType === 'IN' ? 'bg-blue-600 shadow-md hover:bg-blue-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                                            onClick={() => setSelectedLogType('IN')}
                                            disabled={isProcessing}
                                        >
                                            <LogIn className="h-5 w-5" />
                                            TIME IN
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={selectedLogType === 'OUT' ? 'default' : 'outline'}
                                            size="lg"
                                            className={`w-40 gap-3 text-sm font-semibold transition-all ${selectedLogType === 'OUT' ? 'bg-rose-600 text-white shadow-md hover:bg-rose-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                                            onClick={() => setSelectedLogType('OUT')}
                                            disabled={isProcessing}
                                        >
                                            <LogOut className="h-5 w-5" />
                                            TIME OUT
                                        </Button>
                                    </div>

                                    {/* Scanner Area */}
                                    <div className="relative mt-8 flex min-h-[300px] justify-center">
                                        <FingerprintScanner
                                            key={scanKey}
                                            mode="identify"
                                            onCapture={handleFingerprintCapture}
                                            showStatus={false}
                                            autoScan={true}
                                        />

                                        {isProcessing && (
                                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-white/80 backdrop-blur-sm">
                                                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                                                <span className="text-sm font-bold tracking-widest text-blue-700">PROCESSING...</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Recent Logs */}
                        <div className="lg:col-span-1">
                            <Card className="flex h-full flex-col shadow-sm">
                                <CardHeader className="border-b border-slate-100 pb-5">
                                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        Recent Activity
                                    </CardTitle>
                                    <CardDescription>Latest time log entries today</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 p-0">
                                    <div className="divide-y divide-slate-100">
                                        {recent_logs.length > 0 ? (
                                            recent_logs.map((log) => (
                                                <div key={log.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50">
                                                    {/* Avatar / Image */}
                                                    <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                                                        <AvatarImage src={log.employee.image || ''} />
                                                        <AvatarFallback className="bg-blue-100 font-semibold text-blue-700">
                                                            {getInitials(log.employee.name)}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    {/* Details */}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-slate-900">{log.employee.name}</p>
                                                        <p className="text-xs font-medium text-slate-500">{log.time}</p>
                                                    </div>

                                                    {/* Log Type Badge */}
                                                    <div className="text-right">
                                                        <span
                                                            className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
                                                                log.log_type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                                                            }`}
                                                        >
                                                            {log.log_type}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                                <Clock className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                                                <p className="text-sm font-semibold text-slate-600">No recent logs</p>
                                                <p className="mt-1 text-xs text-slate-500">Time entries will appear here.</p>
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
