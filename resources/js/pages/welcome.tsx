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
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                {/* Navigation */}
                <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <Fingerprint className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <span className="text-xl font-bold text-slate-900 dark:text-white">Bio</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('timeclock.index')}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                                <Fingerprint className="h-4 w-4" />
                                Time Clock
                            </Link>
                            <Link
                                href={route('employee.login')}
                                className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                            >
                                Employee Login
                            </Link>
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                >
                                    Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                    >
                                        Get Started
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                            Biometric Employee
                            <span className="text-blue-600 dark:text-blue-400"> Management</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                            Streamline your workforce management with fingerprint-based authentication. Track attendance, manage employees, and secure
                            your data with ease.
                        </p>
                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg"
                                    >
                                        Get Started Free
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700"
                                    >
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">Powerful Features</h2>
                            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
                                Everything you need to manage your employees efficiently
                            </p>
                        </div>
                        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature, index) => (
                                <div key={index} className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-slate-800">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 transition group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-900/50">
                                        <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8 dark:border-slate-700 dark:bg-slate-900">
                    <div className="mx-auto max-w-6xl">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <Fingerprint className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                <span className="font-semibold text-slate-900 dark:text-white">Bio</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} Bio. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
