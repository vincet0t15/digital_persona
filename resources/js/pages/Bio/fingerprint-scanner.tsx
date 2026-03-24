/**
 * Fingerprint Scanner Component
 * Provides UI for fingerprint enrollment and identification
 */
import { Button } from '@/components/ui/button';
import { useFingerprint } from '@/hooks/use-fingerprint';
import { cn } from '@/lib/utils';
import { CheckCircle, Fingerprint, Loader2, Scan, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface FingerprintScannerProps {
    mode: 'enroll' | 'identify';
    onCapture: (template: string, quality: number) => void;
    onError?: (error: string) => void;
    onSampleComplete?: () => void;
    className?: string;
    showStatus?: boolean;
    requiredSamples?: number;
    currentSample?: number;
    autoScan?: boolean;
}

export function FingerprintScanner({
    mode,
    onCapture,
    onError,
    onSampleComplete,
    className,
    showStatus = true,
    requiredSamples = 1,
    currentSample = 0,
    autoScan = false,
}: FingerprintScannerProps) {
    const { initialized, readerConnected, mode: sdkMode, scanning, status, startCapture, stopCapture } = useFingerprint();
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'error'>('idle');
    const [quality, setQuality] = useState<number>(0);
    const [message, setMessage] = useState<string>('');

    const handleStartScan = useCallback(() => {
        setScanStatus('scanning');
        setQuality(0);
        setMessage('');

        startCapture(
            mode,
            (result) => {
                setScanStatus('success');
                setQuality(result.quality);
                setMessage(`Fingerprint captured! Quality: ${result.quality}%${result.mode === 'simulated' ? ' (Simulated)' : ''}`);
                onCapture(result.template, result.quality);
                // Notify parent that sample is complete for auto-scanning
                onSampleComplete?.();
            },
            (error) => {
                setScanStatus('error');
                setMessage(error);
                onError?.(error);
            },
            (statusInfo) => {
                if (statusInfo.type === 'scanning') {
                    setScanStatus('scanning');
                    setMessage(statusInfo.message || 'Scanning...');
                } else if (statusInfo.type === 'processing') {
                    setScanStatus('processing');
                    setMessage(statusInfo.message || 'Processing...');
                } else if (statusInfo.type === 'quality' && statusInfo.quality !== undefined) {
                    setQuality(statusInfo.quality);
                }
            },
        );
    }, [mode, startCapture, onCapture, onError, onSampleComplete]);

    const handleStopScan = useCallback(() => {
        stopCapture();
        setScanStatus('idle');
        setMessage('');
    }, [stopCapture]);

    // Use refs to avoid stale closures and unnecessary re-renders
    const onCaptureRef = useRef(onCapture);
    const onErrorRef = useRef(onError);
    const onSampleCompleteRef = useRef(onSampleComplete);

    // Update refs when props change
    useEffect(() => {
        onCaptureRef.current = onCapture;
        onErrorRef.current = onError;
        onSampleCompleteRef.current = onSampleComplete;
    }, [onCapture, onError, onSampleComplete]);

    // Auto-start scan when currentSample changes (for continuous enrollment)
    useEffect(() => {
        if (
            autoScan &&
            mode === 'enroll' &&
            currentSample < requiredSamples &&
            currentSample > 0 &&
            initialized &&
            (sdkMode === 'simulated' || readerConnected)
        ) {
            // Small delay to allow user to lift finger
            const timer = setTimeout(() => {
                // Reset scan status before starting new scan
                setScanStatus('scanning');
                setQuality(0);
                setMessage('');
                startCapture(
                    mode,
                    (result) => {
                        setScanStatus('success');
                        setQuality(result.quality);
                        setMessage(`Fingerprint captured! Quality: ${result.quality}%${result.mode === 'simulated' ? ' (Simulated)' : ''}`);
                        onCaptureRef.current(result.template, result.quality);
                        onSampleCompleteRef.current?.();
                    },
                    (error) => {
                        setScanStatus('error');
                        setMessage(error);
                        onErrorRef.current?.(error);
                    },
                    (statusInfo) => {
                        if (statusInfo.type === 'scanning') {
                            setScanStatus('scanning');
                            setMessage(statusInfo.message || 'Scanning...');
                        } else if (statusInfo.type === 'processing') {
                            setScanStatus('processing');
                            setMessage(statusInfo.message || 'Processing...');
                        } else if (statusInfo.type === 'quality' && statusInfo.quality !== undefined) {
                            setQuality(statusInfo.quality);
                        }
                    },
                );
            }, 800);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoScan, currentSample, requiredSamples, mode, initialized, sdkMode, readerConnected, startCapture]);

    const getStatusColor = () => {
        switch (scanStatus) {
            case 'success':
                return 'text-green-500 border-green-500 bg-green-50';
            case 'error':
                return 'text-red-500 border-red-500 bg-red-50';
            case 'scanning':
            case 'processing':
                return 'text-blue-500 border-blue-500 bg-blue-50';
            default:
                return 'text-gray-400 border-gray-300 bg-gray-50';
        }
    };

    const getStatusIcon = () => {
        switch (scanStatus) {
            case 'success':
                return <CheckCircle className="h-16 w-16" />;
            case 'error':
                return <XCircle className="h-16 w-16" />;
            case 'scanning':
            case 'processing':
                return <Loader2 className="h-16 w-16 animate-spin" />;
            default:
                return <Fingerprint className="h-16 w-16" />;
        }
    };

    if (!initialized) {
        return (
            <div className={cn('flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8', className)}>
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Initializing fingerprint SDK...</p>
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col items-center gap-4', className)}>
            {/* SDK Status Badge */}
            {showStatus && (
                <div
                    className={cn(
                        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium',
                        sdkMode === 'real' && readerConnected
                            ? 'bg-green-100 text-green-700'
                            : sdkMode === 'real' && !readerConnected
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600',
                    )}
                >
                    <span
                        className={cn(
                            'h-2 w-2 rounded-full',
                            sdkMode === 'real' && readerConnected
                                ? 'bg-green-500'
                                : sdkMode === 'real' && !readerConnected
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-400',
                        )}
                    />
                    {sdkMode === 'real' && readerConnected
                        ? 'U.are.U Reader Connected'
                        : sdkMode === 'real' && !readerConnected
                          ? 'DP Agent Running — No Reader'
                          : 'Simulation Mode'}
                </div>
            )}

            {/* Fingerprint Area */}
            <div
                className={cn(
                    'relative flex h-48 w-48 flex-col items-center justify-center rounded-xl border-2 transition-all duration-300',
                    getStatusColor(),
                )}
            >
                {/* Scan Line Animation */}
                {(scanStatus === 'scanning' || scanStatus === 'processing') && (
                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                        <div className="animate-scan absolute right-0 left-0 h-0.5 bg-blue-400" />
                    </div>
                )}

                {getStatusIcon()}

                {quality > 0 && scanStatus !== 'idle' && <div className="absolute bottom-2 text-xs font-medium">Quality: {quality}%</div>}
            </div>

            {/* Status Message */}
            {message && (
                <p
                    className={cn(
                        'text-center text-sm',
                        scanStatus === 'error' ? 'text-red-600' : scanStatus === 'success' ? 'text-green-600' : 'text-gray-600',
                    )}
                >
                    {message}
                </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
                {!scanning ? (
                    <Button
                        type="button"
                        onClick={handleStartScan}
                        disabled={!initialized || (sdkMode === 'real' && !readerConnected)}
                        className="gap-2"
                    >
                        <Scan className="h-4 w-4" />
                        {scanStatus === 'success' ? 'Rescan' : mode === 'enroll' ? 'Enroll Fingerprint' : 'Scan to Identify'}
                    </Button>
                ) : (
                    <Button type="button" onClick={handleStopScan} variant="outline" className="gap-2">
                        <XCircle className="h-4 w-4" />
                        Cancel
                    </Button>
                )}
            </div>

            {/* Sample Counter for Enrollment */}
            {mode === 'enroll' && requiredSamples > 1 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Sample:</span>
                    <div className="flex gap-1">
                        {Array.from({ length: requiredSamples }).map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                                    idx < currentSample ? 'bg-green-500' : idx === currentSample ? 'animate-pulse bg-blue-500' : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-500">
                        {currentSample + 1} of {requiredSamples}
                    </span>
                </div>
            )}

            {/* Instructions */}
            <p className="max-w-xs text-center text-xs text-gray-500">
                {mode === 'enroll'
                    ? requiredSamples > 1
                        ? autoScan
                            ? `Place your finger on the U.are.U 4500 reader ${requiredSamples} times. The scanner will automatically capture each sample - just lift and place your finger again after each beep.`
                            : `Place your finger on the U.are.U 4500 reader ${requiredSamples} times for better accuracy. Lift and place again for each scan.`
                        : 'Place your finger on the U.are.U 4500 reader and hold steady until the scan completes.'
                    : 'Place your finger on the reader to identify yourself.'}
            </p>
        </div>
    );
}
