/**
 * Fingerprint SDK Hook for React
 * Integrates with DigitalPersona U.are.U 4500 fingerprint reader
 */
import { useCallback, useEffect, useRef, useState } from 'react';

interface FingerprintSDKState {
    initialized: boolean;
    readerConnected: boolean;
    mode: 'real' | 'simulated' | 'checking';
    scanning: boolean;
    hasTemplate: boolean;
    selectedReader: string;
}

interface CaptureResult {
    success: boolean;
    template: string;
    quality: number;
    mode: 'real' | 'simulated';
}

interface StatusInfo {
    type: 'scanning' | 'processing' | 'quality' | 'error';
    message?: string;
    quality?: number;
    qualityCode?: string;
}

// Global SDK state
type FingerprintWebApi = {
    onDeviceConnected: ((e: { deviceUid: string }) => void) | null;
    onDeviceDisconnected: ((e: { deviceUid: string }) => void) | null;
    onCommunicationFailed: (() => void) | null;
    onQualityReported: ((e: { quality: number }) => void) | null;
    onSamplesAcquired: ((e: { samples: string }) => void) | null;
    onErrorOccurred: ((e: { error: string }) => void) | null;
    enumerateDevices: () => Promise<string[]>;
    startAcquisition: (format: number, deviceUid: string) => Promise<void>;
    stopAcquisition: (deviceUid: string) => Promise<void>;
};

let sdkInstance: FingerprintWebApi | null = null;
let sdkInitialized = false;
let readerConnected = false;
let sdkMode: 'real' | 'simulated' | 'checking' = 'checking';
let selectedReader = '';
let acquisitionStarted = false;

export function useFingerprint() {
    const [state, setState] = useState<FingerprintSDKState>({
        initialized: sdkInitialized,
        readerConnected,
        mode: sdkMode,
        scanning: false,
        hasTemplate: false,
        selectedReader,
    });

    const [status, setStatus] = useState<string>('Initializing...');
    const [error, setError] = useState<string | null>(null);

    const callbacksRef = useRef<{
        onCapture?: (result: CaptureResult) => void;
        onError?: (error: string) => void;
        onStatus?: (status: StatusInfo) => void;
    }>({});

    // Initialize SDK
    useEffect(() => {
        const init = async () => {
            if (sdkInitialized) {
                setState({
                    initialized: sdkInitialized,
                    readerConnected,
                    mode: sdkMode,
                    scanning: false,
                    hasTemplate: false,
                    selectedReader,
                });
                return;
            }

            // Check if DigitalPersona SDK is loaded
            if (typeof window.Fingerprint !== 'undefined' && typeof window.Fingerprint.WebApi !== 'undefined') {
                try {
                    await initRealSDK();
                } catch (err) {
                    console.warn('[FP] DigitalPersona SDK init failed:', (err as Error).message);
                    setStatus('Simulation Mode — DigitalPersona SDK not detected');
                    setState((prev) => ({ ...prev, mode: 'simulated', initialized: true }));
                }
            } else {
                console.warn('[FP] Fingerprint SDK not loaded. Falling back to simulation mode.');
                sdkMode = 'simulated';
                sdkInitialized = true;
                setStatus('Simulation Mode — Install DigitalPersona SDK for real device');
                setState((prev) => ({ ...prev, mode: 'simulated', initialized: true }));
            }
        };

        init();
    }, []);

    const initRealSDK = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            try {
                const format = window.Fingerprint.SampleFormat.PngImage;
                sdkInstance = new window.Fingerprint.WebApi();

                sdkInstance.onDeviceConnected = (e: { deviceUid: string }) => {
                    readerConnected = true;
                    console.log('[FP] Device connected:', e.deviceUid);
                    setStatus('U.are.U reader connected');
                    if (!selectedReader) {
                        selectedReader = e.deviceUid;
                    }
                    setState((prev) => ({ ...prev, readerConnected: true, selectedReader }));
                };

                sdkInstance.onDeviceDisconnected = (e: { deviceUid: string }) => {
                    console.log('[FP] Device disconnected:', e.deviceUid);
                    if (selectedReader === e.deviceUid) {
                        readerConnected = false;
                        selectedReader = '';
                        setStatus('Fingerprint reader disconnected');
                        setState((prev) => ({ ...prev, readerConnected: false, selectedReader: '' }));
                    }
                };

                sdkInstance.onCommunicationFailed = () => {
                    console.error('[FP] Communication failed with DP Agent');
                    setStatus('Communication with DP Agent failed');
                };

                sdkInstance.onQualityReported = (e: { quality: number }) => {
                    const qualityName = window.Fingerprint.QualityCode[e.quality] || 'Unknown';
                    const qualityPercent = e.quality === 0 ? 100 : Math.max(0, 100 - e.quality * 10);
                    callbacksRef.current.onStatus?.({
                        type: 'quality',
                        quality: qualityPercent,
                        qualityCode: qualityName,
                    });
                };

                sdkInstance.onSamplesAcquired = (s: { samples: string }) => {
                    if (!acquisitionStarted) {
                        console.log('[FP] Sample acquired but acquisition not started — ignoring');
                        return;
                    }
                    console.log('[FP] Sample acquired');
                    processCapturedSample(s);
                };

                sdkInstance.onErrorOccurred = (e: { error: string }) => {
                    console.error('[FP] Error occurred:', e.error);
                    callbacksRef.current.onError?.('Device error: ' + (e.error || 'Unknown error'));
                };

                sdkInstance
                    .enumerateDevices()
                    .then((devices: string[]) => {
                        console.log('[FP] Devices found:', devices);

                        if (devices && devices.length > 0) {
                            selectedReader = devices[0];
                            readerConnected = true;
                            sdkMode = 'real';
                            sdkInitialized = true;
                            setStatus('U.are.U 4500 reader connected and ready');
                            setState({
                                initialized: true,
                                readerConnected: true,
                                mode: 'real',
                                scanning: false,
                                hasTemplate: false,
                                selectedReader,
                            });
                            resolve();
                        } else {
                            sdkMode = 'real';
                            sdkInitialized = true;
                            readerConnected = false;
                            setStatus('DP Agent running — No fingerprint reader detected');
                            setState({
                                initialized: true,
                                readerConnected: false,
                                mode: 'real',
                                scanning: false,
                                hasTemplate: false,
                                selectedReader: '',
                            });
                            resolve();
                        }
                    })
                    .catch((err: Error) => {
                        console.warn('[FP] enumerateDevices failed:', err);
                        reject(new Error('Failed to enumerate devices: ' + (err.message || err)));
                    });
            } catch (err) {
                reject(err);
            }
        });
    };

    const processCapturedSample = (sampleEvent: { samples: string }) => {
        try {
            if (sdkInstance && acquisitionStarted) {
                sdkInstance
                    .stopAcquisition(selectedReader)
                    .then(() => {
                        acquisitionStarted = false;
                        console.log('[FP] Acquisition stopped');
                    })
                    .catch((err: Error) => {
                        console.warn('[FP] stopAcquisition error:', err);
                    });
            }

            callbacksRef.current.onStatus?.({ type: 'processing', message: 'Processing fingerprint data...' });

            const samples = JSON.parse(sampleEvent.samples);
            let sampleData = '';

            if (samples && samples.length > 0) {
                sampleData = window.Fingerprint.b64UrlTo64(samples[0]);
            }

            if (!sampleData) {
                setState((prev) => ({ ...prev, scanning: false }));
                callbacksRef.current.onError?.('No fingerprint data captured. Please try again.');
                return;
            }

            setState((prev) => ({ ...prev, scanning: false, hasTemplate: true }));

            callbacksRef.current.onCapture?.({
                success: true,
                template: sampleData,
                quality: 90,
                mode: sdkMode === 'real' ? 'real' : 'simulated',
            });
        } catch (err) {
            setState((prev) => ({ ...prev, scanning: false }));
            console.error('[FP] processCapturedSample error:', err);
            callbacksRef.current.onError?.('Failed to process fingerprint: ' + (err as Error).message);
        }
    };

    const startSimulatedCapture = () => {
        setStatus('Place your finger on the reader...');
        callbacksRef.current.onStatus?.({ type: 'scanning', message: 'Scanning fingerprint... (Simulated)' });

        setTimeout(() => {
            callbacksRef.current.onStatus?.({ type: 'processing', message: 'Processing fingerprint data...' });
        }, 1000);

        setTimeout(() => {
            const bytes = new Uint8Array(64);
            crypto.getRandomValues(bytes);
            let hex = '';
            for (let i = 0; i < bytes.length; i++) {
                hex += bytes[i].toString(16).padStart(2, '0');
            }
            const template = 'SIM_FP_' + hex;
            const quality = Math.floor(Math.random() * 30) + 70;

            setState((prev) => ({ ...prev, scanning: false, hasTemplate: true }));

            callbacksRef.current.onCapture?.({
                success: true,
                template,
                quality,
                mode: 'simulated',
            });
        }, 2500);
    };

    const startCapture = useCallback(
        (
            purpose: 'enroll' | 'identify',
            onCapture: (result: CaptureResult) => void,
            onError: (error: string) => void,
            onStatus: (status: StatusInfo) => void,
        ) => {
            if (state.scanning) {
                onError('A scan is already in progress');
                return;
            }

            callbacksRef.current = { onCapture, onError, onStatus };
            setState((prev) => ({ ...prev, scanning: true }));
            setError(null);

            if (sdkMode === 'real') {
                startRealCapture(purpose);
            } else {
                startSimulatedCapture();
            }
        },
        [state.scanning],
    );

    const startRealCapture = (purpose: 'enroll' | 'identify') => {
        try {
            if (!sdkInstance) {
                throw new Error('Fingerprint SDK not initialized');
            }

            if (!readerConnected) {
                sdkInstance
                    .enumerateDevices()
                    .then((devices: string[]) => {
                        if (devices && devices.length > 0) {
                            selectedReader = devices[0];
                            readerConnected = true;
                            doStartAcquisition(purpose);
                        } else {
                            setState((prev) => ({ ...prev, scanning: false }));
                            callbacksRef.current.onError?.('No fingerprint reader detected. Please connect your U.are.U 4500.');
                        }
                    })
                    .catch((err: Error) => {
                        setState((prev) => ({ ...prev, scanning: false }));
                        callbacksRef.current.onError?.('Failed to find reader: ' + (err.message || err));
                    });
                return;
            }

            doStartAcquisition(purpose);
        } catch (err) {
            setState((prev) => ({ ...prev, scanning: false }));
            callbacksRef.current.onError?.('Capture error: ' + (err as Error).message);
        }
    };

    const doStartAcquisition = (purpose: 'enroll' | 'identify') => {
        setStatus('Place your finger on the reader...');
        callbacksRef.current.onStatus?.({ type: 'scanning', message: 'Waiting for finger...' });

        // Reset acquisition flag to ensure clean state
        acquisitionStarted = false;

        sdkInstance
            ?.startAcquisition(window.Fingerprint.SampleFormat.PngImage, selectedReader)
            .then(() => {
                acquisitionStarted = true;
                console.log('[FP] Acquisition started for', purpose, '— waiting for finger...');
            })
            .catch((err: Error) => {
                setState((prev) => ({ ...prev, scanning: false }));
                acquisitionStarted = false;
                console.error('[FP] startAcquisition failed:', err);
                callbacksRef.current.onError?.('Failed to start acquisition: ' + (err.message || err));
            });
    };

    const stopCapture = useCallback(() => {
        // Always reset the flag first to prevent race conditions
        acquisitionStarted = false;

        if (sdkMode === 'real' && sdkInstance) {
            sdkInstance
                .stopAcquisition(selectedReader)
                .then(() => {
                    console.log('[FP] Acquisition stopped');
                })
                .catch((err: Error) => {
                    console.warn('[FP] Stop error:', err);
                });
        }
        setState((prev) => ({ ...prev, scanning: false }));
    }, []);

    return {
        ...state,
        status,
        error,
        startCapture,
        stopCapture,
    };
}

// Type declarations for DigitalPersona SDK
declare global {
    interface Window {
        Fingerprint: {
            WebApi: new () => {
                onDeviceConnected: ((e: { deviceUid: string }) => void) | null;
                onDeviceDisconnected: ((e: { deviceUid: string }) => void) | null;
                onCommunicationFailed: (() => void) | null;
                onQualityReported: ((e: { quality: number }) => void) | null;
                onSamplesAcquired: ((e: { samples: string }) => void) | null;
                onErrorOccurred: ((e: { error: string }) => void) | null;
                enumerateDevices: () => Promise<string[]>;
                startAcquisition: (format: number, deviceUid: string) => Promise<void>;
                stopAcquisition: (deviceUid: string) => Promise<void>;
            };
            SampleFormat: {
                PngImage: number;
            };
            QualityCode: Record<number, string>;
            b64UrlTo64: (data: string) => string;
        };
    }
}
