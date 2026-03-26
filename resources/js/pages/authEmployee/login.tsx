import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowRight, Fingerprint, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

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
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 p-4 selection:bg-blue-500/30">
            <Head title="Employee Login" />

            {/* Background Effects */}
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-60">
                <div className="absolute h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[120px] will-change-transform" />
                <div className="absolute h-[600px] w-[600px] translate-x-1/3 translate-y-1/4 rounded-full bg-indigo-600/20 blur-[130px] will-change-transform" />
                <div className="absolute h-[400px] w-[400px] translate-x-1/4 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[100px] will-change-transform" />
            </div>

            <div className="z-10 w-full max-w-[440px]">
                <div className="mb-8 text-center sm:mb-10">
                    <div className="mb-6 flex justify-center">
                        <div className="group relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20 ring-1 ring-white/10 transition-transform duration-500 hover:scale-105">
                            <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            <Fingerprint className="h-10 w-10 text-white drop-shadow-md" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl">Employee Portal</h1>
                    <p className="mt-3 text-sm font-medium text-slate-400 sm:text-base">Secure access to your digital workspace</p>
                </div>

                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl sm:p-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                    
                    <div className="relative">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 backdrop-blur-md">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
                                <p className="text-sm font-medium text-rose-200">{error}</p>
                            </div>
                        )}

                        <form className="flex flex-col gap-6" onSubmit={submit}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="username" className="pl-1 text-sm font-medium text-slate-300">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        required
                                        autoFocus
                                        autoComplete="username"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        placeholder="Enter your username"
                                        className="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-base text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    />
                                    <InputError message={errors.username} className="pl-1 text-rose-400" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="pl-1 text-sm font-medium text-slate-300">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••••"
                                        className="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-base text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/20 transition-all font-mono"
                                    />
                                    <InputError message={errors.password} className="pl-1 text-rose-400" />
                                </div>

                                <Button 
                                    type="submit" 
                                    className="group relative mt-2 h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-base font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] hover:shadow-blue-500/40" 
                                    disabled={processing}
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
                                    <span className="relative flex items-center justify-center">
                                        {processing ? (
                                            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                Sign In to Portal
                                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-8 text-center flex justify-center">
                    <a href="/" className="group inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-sm font-medium text-slate-400 backdrop-blur-md transition-all hover:border-white/10 hover:bg-white/10 hover:text-white">
                        <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
