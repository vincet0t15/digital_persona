import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import TimeClock from './TimeClock';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <TimeClock />
        </>
    );
}
