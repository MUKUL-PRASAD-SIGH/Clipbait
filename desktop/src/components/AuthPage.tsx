import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from './ui/Card';
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <Card variant="elevated" className="w-full max-w-md animate-fade-in-up">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl text-white">🔐</span>
                    </div>
                    <CardTitle size="lg" className="text-gradient">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </CardTitle>
                    <CardDescription>
                        {isLogin
                            ? 'Sign in to access your smart clipboard'
                            : 'Join Epitychia for intelligent clipboard management'
                        }
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Social Authentication */}
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full"
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
                            className="w-full"
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
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
                            />
                        </div>

                        {!isLogin && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
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
                                />
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="gradient"
                            className="w-full"
                            loading={isLoading}
                            loadingText={isLogin ? 'Signing in...' : 'Creating account...'}
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </Button>
                    </form>

                    {/* Toggle between login/register */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
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
                                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                disabled={isLoading}
                            >
                                Forgot your password?
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};