import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, LoaderCircle, Lock, User } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Employee {
    id: number;
    name: string;
    username: string;
}

interface ChangePasswordProps {
    employee: Employee;
}

interface ChangePasswordForm {
    [key: string]: string;
    username: string;
    password: string;
    password_confirmation: string;
}

export default function ChangePassword({ employee }: ChangePasswordProps) {
    const { data, setData, post, processing, errors } = useForm<ChangePasswordForm>({
        username: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('employee.change-password.post'));
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800">
            <Head title="Change Password" />

            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 shadow-lg">
                            <Lock className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome, {employee.name}!</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Please set your new username and password to continue</p>
                </div>

                <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-800">
                    {/* Info Alert */}
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            For security reasons, you must change your temporary credentials before accessing your dashboard.
                        </p>
                    </div>

                    <form className="flex flex-col gap-6" onSubmit={submit}>
                        <div className="grid gap-6">
                            {/* Username */}
                            <div className="grid gap-2">
                                <Label htmlFor="username" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    New Username
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    required
                                    autoFocus
                                    autoComplete="username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Choose a username"
                                />
                                <InputError message={errors.username} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    New Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Minimum 8 characters"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Confirm Password */}
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Confirm Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Confirm your password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Update & Continue
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
