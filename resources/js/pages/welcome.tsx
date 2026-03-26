import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Clock, Fingerprint, Shield, Users } from 'lucide-react';

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
            <div className="relative min-h-screen overflow-hidden bg-slate-50 font-['instrument-sans'] text-slate-900 selection:bg-blue-500/30 dark:bg-slate-950 dark:text-slate-100">
                
                {/* Background Animated Blobs */}
                <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-30 mix-blend-multiply dark:opacity-40 dark:mix-blend-screen">
                    <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] animate-pulse rounded-full bg-blue-300/40 blur-[120px] will-change-transform dark:bg-blue-600/30" />
                    <div className="absolute right-[-10%] top-[40%] h-[500px] w-[500px] animate-pulse rounded-full bg-indigo-300/30 blur-[130px] will-change-transform dark:bg-indigo-600/20" style={{ animationDelay: '1s' }} />
                    <div className="absolute bottom-[-10%] left-[20%] h-[700px] w-[700px] animate-pulse rounded-full bg-cyan-200/40 blur-[150px] will-change-transform dark:bg-cyan-700/20" style={{ animationDelay: '2s' }} />
                </div>

                <div className="relative z-10 flex min-h-screen flex-col">
                    {/* Navigation */}
                    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50">
                        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                                    <Fingerprint className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Bio</span>
                            </div>
                            
                            <div className="flex items-center gap-4 sm:gap-6">
                                <Link
                                    href={route('timeclock.index')}
                                    className="group hidden items-center gap-2 rounded-full border border-slate-200 bg-white/50 py-2 pl-3 pr-4 text-sm font-medium text-slate-600 backdrop-blur-md transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 sm:flex dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-blue-400/30 dark:hover:bg-white/10 dark:hover:text-white"
                                >
                                    <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                    Time Clock
                                </Link>
                                <div className="hidden h-6 w-px bg-slate-300 sm:block dark:bg-white/10"></div>
                                <Link
                                    href={route('employee.login')}
                                    className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                >
                                    Portal Login
                                </Link>
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 hover:shadow-blue-500/40"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Admin Dashboard
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </span>
                                        <div className="absolute inset-0 z-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                        >
                                            Admin
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="group relative hidden items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 hover:shadow-blue-500/40 sm:inline-flex"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                Get Started
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </span>
                                            <div className="absolute inset-0 z-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </nav>

                    {/* Hero Section */}
                    <main className="flex-1 pb-20 pt-32">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto max-w-4xl pt-20 text-center">
                                <div className="mb-8 flex justify-center">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm tracking-wide text-blue-700 backdrop-blur-md dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                                        <span className="relative flex h-2 w-2">
                                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                                          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                                        </span>
                                        Biometric Architecture
                                    </div>
                                </div>
                                <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">
                                    Next-Generation
                                    <br className="hidden sm:block" />
                                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400"> Workforce Management</span>
                                </h1>
                                <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                                    Streamline authentication and time tracking with enterprise-grade fingerprint security. Eliminate buddy-punching and secure your employee records perfectly.
                                </p>
                                <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="group relative flex h-14 items-center justify-center gap-2 overflow-hidden rounded-full bg-slate-900 px-8 text-base font-bold text-white transition-all hover:scale-105 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:hover:shadow-white/20"
                                        >
                                            Open Application
                                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('timeclock.index')}
                                                className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-slate-900 px-8 text-base font-bold text-white transition-all hover:scale-105 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:hover:shadow-white/20"
                                            >
                                                <Fingerprint className="h-5 w-5 text-blue-400 dark:text-blue-600" />
                                                Open Time Clock
                                            </Link>
                                            <Link
                                                href={route('employee.login')}
                                                className="group flex h-14 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/50 px-8 text-base font-bold text-slate-900 backdrop-blur-md transition-all hover:border-slate-300 hover:bg-slate-50 sm:w-auto dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10"
                                            >
                                                Employee Portal
                                                <ArrowRight className="h-5 w-5 opacity-50 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {features.map((feature, index) => (
                                    <div key={index} className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/60 px-6 py-8 shadow-sm backdrop-blur-lg transition-all hover:-translate-y-2 hover:border-blue-200 hover:bg-white hover:shadow-md dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10 dark:hover:bg-white/10">
                                        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 blur-2xl transition-all group-hover:bg-blue-200 dark:from-blue-500/20 dark:to-indigo-500/20 dark:group-hover:bg-blue-500/40" />
                                        <div className="relative z-10">
                                            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 shadow-inner ring-1 ring-blue-100 transition-transform group-hover:scale-110 dark:bg-white/5 dark:ring-white/10">
                                                <feature.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="mt-auto border-t border-slate-200 bg-white/80 px-6 py-8 backdrop-blur-md lg:px-8 dark:border-white/10 dark:bg-slate-950/80">
                        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-3">
                                <Fingerprint className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                                <span className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Bio Systems</span>
                            </div>
                            <p className="text-sm font-medium text-slate-500">&copy; {new Date().getFullYear()} Bio Biometric Platform. All rights reserved.</p>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
