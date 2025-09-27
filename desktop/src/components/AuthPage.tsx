import React, { useState } from 'react';
import { Button } from './ui/Button';
// Card components are used in JSX
import { Input } from './ui/Input';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface AuthPageProps {
    onClose?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, register, loginWithGoogle, loginWithGitHub } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password);
            }
            onClose?.();
        } catch (error) {
            // Error is already handled in the store with toast
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        try {
            await loginWithGoogle();
            onClose?.();
        } catch (error) {
            // Error is already handled in the store with toast
        } finally {
            setIsLoading(false);
        }
    };

    const handleGithubAuth = async () => {
        setIsLoading(true);
        try {
            await loginWithGitHub();
            onClose?.();
        } catch (error) {
            // Error is already handled in the store with toast
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-orange-900/20 flex items-center justify-center p-4 transition-all duration-300 relative">
            {/* Ornate background pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-yellow-600 to-amber-600 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md animate-fade-in-up">
                {/* Ornate decorative border */}
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 rounded-2xl blur opacity-20 dark:opacity-30"></div>

                {/* Main card with vintage floral background */}
                <div className="relative rounded-2xl shadow-2xl border border-amber-200/50 dark:border-amber-700/30 overflow-hidden"
                    style={{
                        backgroundImage: 'url(/vintage-floral-bg.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}>
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-[1px]"></div>
                    {/* Decorative corner flourishes */}
                    <div className="absolute top-0 left-0 w-16 h-16 opacity-20 dark:opacity-30">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600 dark:text-amber-400">
                            <path d="M20,20 Q50,5 80,20 Q95,50 80,80 Q50,95 20,80 Q5,50 20,20" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="absolute top-0 right-0 w-16 h-16 opacity-20 dark:opacity-30 rotate-90">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600 dark:text-amber-400">
                            <path d="M20,20 Q50,5 80,20 Q95,50 80,80 Q50,95 20,80 Q5,50 20,20" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 opacity-20 dark:opacity-30 -rotate-90">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600 dark:text-amber-400">
                            <path d="M20,20 Q50,5 80,20 Q95,50 80,80 Q50,95 20,80 Q5,50 20,20" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 opacity-20 dark:opacity-30 rotate-180">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600 dark:text-amber-400">
                            <path d="M20,20 Q50,5 80,20 Q95,50 80,80 Q50,95 20,80 Q5,50 20,20" fill="currentColor" />
                        </svg>
                    </div>

                    {/* Header with elegant styling */}
                    <div className="relative z-10 text-center pt-8 pb-6 px-8">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-lg ring-4 ring-amber-200/50 dark:ring-amber-700/30">
                            <span className="text-3xl text-white">✨</span>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent dark:from-amber-400 dark:via-orange-400 dark:to-yellow-400 mb-2">
                            {isLogin ? 'Welcome Back' : 'Join Epitychia'}
                        </h1>
                        <p className="text-amber-700/80 dark:text-amber-300/80 text-sm font-medium">
                            {isLogin
                                ? 'Enter your realm of intelligent clipboard magic'
                                : 'Begin your journey with smart clipboard mastery'
                            }
                        </p>
                    </div>

                    {/* Content with ornate styling */}
                    <div className="relative z-10 px-8 pb-8 space-y-6">
                        {/* Social Authentication */}
                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full border-2 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 shadow-md hover:shadow-lg transition-all duration-200"
                                onClick={handleGoogleAuth}
                                disabled={isLoading}
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full border-2 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 shadow-md hover:shadow-lg transition-all duration-200"
                                onClick={handleGithubAuth}
                                disabled={isLoading}
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                Continue with GitHub
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-amber-300/50 dark:border-amber-600/50" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 text-amber-700 dark:text-amber-300 font-medium">Or continue with email</span>
                            </div>
                        </div>

                        {/* Email/Password Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    disabled={isLoading}
                                    className="border-2 border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-gray-800/50 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-amber-400/20 dark:focus:ring-amber-500/20"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    disabled={isLoading}
                                    className="border-2 border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-gray-800/50 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-amber-400/20 dark:focus:ring-amber-500/20"
                                />
                            </div>

                            {!isLogin && (
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                        Confirm Password
                                    </label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your password"
                                        required
                                        disabled={isLoading}
                                        className="border-2 border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-gray-800/50 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-amber-400/20 dark:focus:ring-amber-500/20"
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                loading={isLoading}
                                loadingText={isLogin ? 'Signing in...' : 'Creating account...'}
                            >
                                {isLogin ? '✨ Sign In' : '🌟 Create Account'}
                            </Button>
                        </form>

                        {/* Toggle between login/register */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 font-medium transition-colors"
                                disabled={isLoading}
                            >
                                {isLogin
                                    ? "Don't have an account? Sign up"
                                    : "Already have an account? Sign in"
                                }
                            </button>
                        </div>

                        {/* Forgot Password */}
                        {isLogin && (
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => toast('Password reset coming soon!', { icon: 'ℹ️' })}
                                    className="text-sm text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
                                    disabled={isLoading}
                                >
                                    Forgot your password?
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};