import { FingerprintDeviceStatus } from '@/components/device-status-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FingerprintScanner } from '@/pages/Bio/fingerprint-scanner';
import { Head, router } from '@inertiajs/react';
import { Clock, Fingerprint, LogIn, LogOut, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
    const [recentLogs, setRecentLogs] = useState<TimeLog[]>([]);
    const [lastResult, setLastResult] = useState<ClockResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Set clock result from props
    useEffect(() => {
        if (clock_result) {
            setLastResult(clock_result);
            fetchRecentLogs();
        }
    }, [clock_result]);

    // Fetch recent logs on mount
    useEffect(() => {
        fetchRecentLogs();
        const interval = setInterval(fetchRecentLogs, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchRecentLogs = async () => {
        try {
            const response = await fetch(route('timeclock.recent'));
            if (response.ok) {
                const data = await response.json();
                setRecentLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch recent logs:', error);
        }
    };

    const handleFingerprintCapture = (template: string, quality: number) => {
        setIsProcessing(true);

        router.post(
            route('timeclock.clock'),
            { fingerprint_template: template },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsProcessing(false);
                },
                onError: () => {
                    setIsProcessing(false);
                    toast.error('Failed to record time. Please try again.');
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
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-6xl">
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
                                        <FingerprintScanner mode="identify" onCapture={handleFingerprintCapture} showStatus={false} />
                                    </div>

                                    {isProcessing && (
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                                            <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                            <p className="text-sm text-blue-700">Processing fingerprint...</p>
                                        </div>
                                    )}

                                    {/* Last Result */}
                                    {lastResult && (
                                        <div
                                            className={`rounded-lg border p-6 text-center ${
                                                lastResult.log_type === 'IN' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'
                                            }`}
                                        >
                                            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                                                {lastResult.log_type === 'IN' ? (
                                                    <LogIn className="h-8 w-8 text-green-600" />
                                                ) : (
                                                    <LogOut className="h-8 w-8 text-orange-600" />
                                                )}
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">{lastResult.employee.name}</h3>
                                            <p className="text-3xl font-bold text-gray-900">Time {lastResult.log_type}</p>
                                            <p className="text-xl text-gray-600">{lastResult.time}</p>
                                            <p className="mt-2 text-sm text-gray-500">
                                                {lastResult.log_type === 'IN' ? 'Have a great day at work!' : 'See you tomorrow!'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Instructions */}
                                    {!lastResult && !isProcessing && (
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900">
                                                <UserCheck className="h-4 w-4" />
                                                How it works:
                                            </h4>
                                            <ul className="space-y-1 text-sm text-gray-600">
                                                <li>1. Place your registered finger on the scanner</li>
                                                <li>2. Hold steady until the scan completes</li>
                                                <li>3. The system will automatically record Time IN or Time OUT</li>
                                                <li>4. Check the recent logs on the right</li>
                                            </ul>
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
                                <CardContent>
                                    <div className="max-h-[500px] space-y-2 overflow-y-auto">
                                        {recentLogs.length > 0 ? (
                                            recentLogs.map((log) => (
                                                <div
                                                    key={log.id}
                                                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                                log.log_type === 'IN'
                                                                    ? 'bg-green-100 text-green-600'
                                                                    : 'bg-orange-100 text-orange-600'
                                                            }`}
                                                        >
                                                            {log.log_type === 'IN' ? <LogIn className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{log.employee?.name || 'Unknown'}</p>
                                                            <p className="text-xs text-gray-500">{formatDate(log.date_time)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                log.log_type === 'IN'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-orange-100 text-orange-700'
                                                            }`}
                                                        >
                                                            {log.log_type}
                                                        </span>
                                                        <p className="text-sm font-medium text-gray-900">{formatTime(log.date_time)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-lg border border-dashed p-8 text-center">
                                                <Clock className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                <p className="text-sm text-gray-500">No logs yet today</p>
                                                <p className="text-xs text-gray-400">Be the first to clock in!</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <p className="text-sm text-gray-500">© {new Date().getFullYear()} Bio Attendance System</p>
                    <Button variant="outline" size="sm" onClick={() => router.visit(route('login'))}>
                        Admin Login
                    </Button>
                </div>
            </footer>
        </div>
    );
}
