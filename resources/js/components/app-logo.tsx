import { Fingerprint } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-lg shadow-emerald-500/20">
                <div className="absolute inset-0 bg-white/10" />
                <Fingerprint className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-2 grid flex-1 text-left">
                <span className="truncate text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">BioTime</span>
                <span className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">Attendance System</span>
            </div>
        </>
    );
}
