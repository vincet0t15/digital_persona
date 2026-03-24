import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Fingerprint, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
    [key: string]: string | boolean;
    username: string;
    password: string;
    remember: boolean;
}

interface PageProps {
    [key: string]: any;
    error?: string;
}

export default function EmployeeLogin() {
    const { error } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        username: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('employee.login.post'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800">
            <Head title="Employee Login" />

            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
                            <Fingerprint className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Employee Portal</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Sign in to view your dashboard</p>
                </div>

                <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-800">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    <form className="flex flex-col gap-6" onSubmit={submit}>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    required
                                    autoFocus
                                    autoComplete="username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Enter your username"
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter your password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </div>
                    </form>
                </div>

                <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    <a href="/" className="hover:text-slate-900 dark:hover:text-white">
                        &larr; Back to Home
                    </a>
                </p>
            </div>
        </div>
    );
}
