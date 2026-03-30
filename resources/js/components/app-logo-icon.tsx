import { Fingerprint } from 'lucide-react';
import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <>
            <div className="mb-6 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20">
                    <Fingerprint className="h-6 w-6 text-white" />
                </div>
            </div>
            <div className="ml-2 grid flex-1 text-left">
                <span className="truncate text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">BioTime</span>
                <span className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">Attendance System</span>
            </div>
        </>
    );
}
