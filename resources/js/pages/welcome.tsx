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
            <div className="min-h-screen bg-slate-50 font-['instrument-sans'] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                <div className="relative z-10 flex min-h-screen flex-col">
                    {/* Navigation */}
                    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50">
                        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20"></div>
                                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Bio</span>
                            </div>

                            <div className="flex items-center gap-4 sm:gap-6">
                                <Link
                                    href={route('timeclock.index')}
                                    className="group hidden items-center gap-2 rounded-full border border-slate-200 bg-white/50 py-2 pr-4 pl-3 text-sm font-medium text-slate-600 backdrop-blur-md transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 sm:flex dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-blue-400/30 dark:hover:bg-white/10 dark:hover:text-white"
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
                                        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-105 hover:shadow-orange-500/40"
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
                    <main className="flex-1">
                        <div className="mx-auto max-w-6xl px-6 py-28">
                            <section className="rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70">
                                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl dark:text-white">
                                    Next-Generation Workforce Management
                                </h1>
                                <p className="mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-300">
                                    Streamline authentication and time tracking with enterprise-grade fingerprint security. Eliminate buddy-punching
                                    and secure your employee records perfectly.
                                </p>
                                <div className="mt-8 flex flex-wrap items-center gap-3">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            Open Application
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('timeclock.index')}
                                                className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-orange-700 dark:bg-orange-400 dark:text-slate-900 dark:hover:bg-orange-300"
                                            >
                                                <Fingerprint className="h-4 w-4 text-blue-300 dark:text-blue-600" />
                                                Open Time Clock
                                            </Link>
                                            <Link
                                                href={route('employee.login')}
                                                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 dark:border-white/20 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                                            >
                                                Employee Portal
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </section>

                            {/* Features Section */}
                            <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-slate-900/70"
                                    >
                                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                                            <feature.icon className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
                                    </div>
                                ))}
                            </section>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="mt-auto border-t border-slate-200 bg-white/80 px-6 py-8 backdrop-blur-md lg:px-8 dark:border-white/10 dark:bg-slate-950/80">
                        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-3">
                                <Fingerprint className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                                <span className="text-sm font-bold tracking-widest text-slate-900 uppercase dark:text-white">Bio Systems</span>
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                                &copy; {new Date().getFullYear()} Bio Biometric Platform. All rights reserved.
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
