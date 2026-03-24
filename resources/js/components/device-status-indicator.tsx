/**
 * Device Status Indicator Component
 * Reusable status indicator for device connection states
 */
import { useFingerprint } from '@/hooks/use-fingerprint';
import { cn } from '@/lib/utils';

type DeviceStatus = 'connected' | 'disconnected' | 'simulation' | 'error';

interface DeviceStatusIndicatorProps {
    status: DeviceStatus;
    connectedLabel?: string;
    disconnectedLabel?: string;
    simulationLabel?: string;
    errorLabel?: string;
    className?: string;
    showStatus?: boolean;
}

const defaultLabels = {
    connected: 'U.are.U Reader Connected',
    disconnected: 'DP Agent Running — No Reader',
    simulation: 'Simulation Mode',
    error: 'Device Error',
};

export function DeviceStatusIndicator({
    status,
    connectedLabel = defaultLabels.connected,
    disconnectedLabel = defaultLabels.disconnected,
    simulationLabel = defaultLabels.simulation,
    errorLabel = defaultLabels.error,
    className,
    showStatus = true,
}: DeviceStatusIndicatorProps) {
    if (!showStatus) {
        return null;
    }

    const getStatusStyles = () => {
        switch (status) {
            case 'connected':
                return {
                    container: 'bg-green-100 text-green-700',
                    dot: 'bg-green-500',
                    label: connectedLabel,
                };
            case 'disconnected':
                return {
                    container: 'bg-yellow-100 text-yellow-700',
                    dot: 'bg-yellow-500',
                    label: disconnectedLabel,
                };
            case 'error':
                return {
                    container: 'bg-red-100 text-red-700',
                    dot: 'bg-red-500',
                    label: errorLabel,
                };
            case 'simulation':
            default:
                return {
                    container: 'bg-gray-100 text-gray-600',
                    dot: 'bg-gray-400',
                    label: simulationLabel,
                };
        }
    };

    const styles = getStatusStyles();

    return (
        <div className={cn('flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium', styles.container, className)}>
            <span className={cn('h-2 w-2 rounded-full', styles.dot)} />
            {styles.label}
        </div>
    );
}

// Also export a hook-friendly version that uses the fingerprint SDK
export function FingerprintDeviceStatus({ className, showStatus = true }: { className?: string; showStatus?: boolean }) {
    const { initialized, readerConnected, mode } = useFingerprint();

    if (!showStatus) {
        return null;
    }

    if (!initialized) {
        return <DeviceStatusIndicator status="simulation" simulationLabel="Initializing SDK..." className={className} />;
    }

    const status: DeviceStatus =
        mode === 'real' && readerConnected ? 'connected' : mode === 'real' && !readerConnected ? 'disconnected' : 'simulation';

    return <DeviceStatusIndicator status={status} className={className} />;
}
