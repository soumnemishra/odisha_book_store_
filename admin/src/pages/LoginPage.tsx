import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context';
import { cn } from '@/lib/utils';
import { Store, Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        try {
            await login({ email, password });
            navigate('/');
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.message ||
                'Login failed. Please check your credentials.'
            );
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Form */}
            <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16">
                <div className="mx-auto w-full max-w-md">
                    {/* Logo */}
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                            <Store className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Odisha Book Store</h1>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Admin Panel</p>
                        </div>
                    </div>

                    {/* Welcome Text */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
                            Sign in to access your admin dashboard
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium" htmlFor="email">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@odishabookstore.com"
                                className={cn(
                                    'w-full rounded-lg border bg-[hsl(var(--background))] px-4 py-3 text-sm',
                                    'placeholder:text-[hsl(var(--muted-foreground))]',
                                    'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]',
                                    'transition-all'
                                )}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className={cn(
                                        'w-full rounded-lg border bg-[hsl(var(--background))] px-4 py-3 pr-12 text-sm',
                                        'placeholder:text-[hsl(var(--muted-foreground))]',
                                        'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]',
                                        'transition-all'
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))]"
                                />
                                <span className="text-sm">Remember me</span>
                            </label>
                            <a
                                href="#"
                                className="text-sm font-medium text-[hsl(var(--primary))] hover:underline"
                            >
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                'flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white',
                                'gradient-primary hover:opacity-90 transition-opacity',
                                'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {/* Demo credentials hint */}
                    <div className="mt-8 rounded-lg bg-[hsl(var(--muted))] p-4">
                        <p className="text-sm font-medium">Demo Credentials</p>
                        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                            Use an admin account to access the dashboard
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center gradient-primary relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/10" />
                <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10" />

                <div className="relative z-10 max-w-md text-center text-white">
                    <div className="mb-8 flex justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                            <Store className="h-12 w-12" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold">Odisha Book Store</h2>
                    <p className="mt-4 text-lg text-white/80">
                        Manage your bookstore effortlessly with our powerful admin dashboard.
                        Track sales, manage inventory, and grow your business.
                    </p>

                    <div className="mt-12 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-3xl font-bold">1.5K+</p>
                            <p className="text-sm text-white/70">Active Users</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">5K+</p>
                            <p className="text-sm text-white/70">Orders</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">₹12L+</p>
                            <p className="text-sm text-white/70">Revenue</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
