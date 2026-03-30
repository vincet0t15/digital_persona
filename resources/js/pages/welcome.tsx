import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Clock, Fingerprint, Shield, Users } from 'lucide-react';
import TimeClock from './TimeClock';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const features = [
        {
            icon: Fingerprint,
            title: 'Biometric Authentication',
            description: 'Secure fingerprint-based employee identification using DigitalPersona U.are.U 4500 scanner.',
        },
        {
            icon: Clock,
            title: 'Time Clock System',
            description: 'Effortless time in/out tracking with real-time logging and recent activity display.',
        },
        {
            icon: Users,
            title: 'Employee Management',
            description: 'Complete employee records with fingerprint enrollment, office assignment, and profile photos.',
        },
        {
            icon: Shield,
            title: 'Secure & Reliable',
            description: 'Role-based access control with admin and user permissions for data security.',
        },
    ];

    return (
        <>
            <Head title="Bio - Biometric Employee Management">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>
            <TimeClock />
        </>
    );
}
