"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { LogIn, AlertCircle } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Helper to set a cookie
function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Define the shape of the decoded token
interface DecodedToken {
    email: string;
    role: 'supreme-admin' | 'admin' | 'teacher';
    exp: number;
}

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotError, setForgotError] = useState<string | null>(null);
    const [forgotSuccess, setForgotSuccess] = useState(false);
    const [isForgotLoading, setIsForgotLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // FastAPI's OAuth2PasswordRequestForm expects 'username' and 'password'
            // sent as form data, not JSON.
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const data = await apiFetch<any>('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            });

            const token = data.access_token;

            // Decode the token to get the user's role
            const decodedToken: DecodedToken = jwtDecode(token);
            const userRole = decodedToken.role;

            // Save the token in a cookie
            setCookie('sessionToken', token, 7); // Save for 7 days

            // Redirect based on the user's role
            if (userRole === 'supreme-admin') {
                router.push('/admin/dashboard');
            } else if (userRole === 'admin') {
                router.push('/n_admin/dashboard');
            } else if (userRole === 'teacher') {
                router.push('/teacher/dashboard'); // <-- This is the fix
            } else {
                // Fallback in case of an unknown role
                setError('Unknown user role. Cannot redirect.');
            }
        } catch (error) {
            console.error('Login request failed:', error);
            setError('Could not connect to the server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!forgotEmail || !forgotEmail.includes('@')) {
            setForgotError('Please enter a valid email address.');
            return;
        }

        setIsForgotLoading(true);
        setForgotError(null);
        setForgotSuccess(false);

        try {
            await apiFetch('/api/forgot-pass', {
                method: 'POST',
                body: JSON.stringify({ email: forgotEmail }),
            });

            setForgotSuccess(true);
            setForgotEmail('');
        } catch (error: any) {
            // console.error('Forgot password request failed:', error);
            setForgotError(error.message || 'Could not connect to the server. Please try again.');
        } finally {
            setIsForgotLoading(false);
        }
    };

    const handleCloseForgotDialog = () => {
        setShowForgotPassword(false);
        setForgotEmail('');
        setForgotError(null);
        setForgotSuccess(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg dark:bg-gray-800">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Admin Panel Login</h1>
                    <p className="mt-2 text-sm text-gray-600">Welcome back. Please enter your credentials.</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* ... (The form JSX is unchanged) ... */}
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium">Email Address</label>
                        <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-medium">Password</label>
                        <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="••••••••" />
                    </div>
                    {error && (<div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg"><AlertCircle className="w-5 h-5 mr-2" /><span>{error}</span></div>)}
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50">
                            {isLoading ? 'Signing in...' : 'Sign In'}
                            {!isLoading && <LogIn className="w-5 h-5 ml-2" />}
                        </button>
                    </div>
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-sm text-primary hover:underline"
                        >
                            Forgot password?
                        </button>
                    </div>
                </form>

                {/* Forgot Password Dialog */}
                <Dialog open={showForgotPassword} onOpenChange={handleCloseForgotDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription>
                                Enter your email address and we'll send you instructions to reset your password.
                            </DialogDescription>
                        </DialogHeader>

                        {!forgotSuccess ? (
                            <>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="forgot-email">Email Address</Label>
                                        <Input
                                            id="forgot-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            disabled={isForgotLoading}
                                        />
                                    </div>
                                    {forgotError && (
                                        <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                                            <AlertCircle className="w-5 h-5 mr-2" />
                                            <span>{forgotError}</span>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={handleCloseForgotDialog}
                                        disabled={isForgotLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleForgotPassword}
                                        disabled={isForgotLoading}
                                    >
                                        {isForgotLoading ? 'Sending...' : 'Send Reset Link'}
                                    </Button>
                                </DialogFooter>
                            </>
                        ) : (
                            <>
                                <div className="py-4">
                                    <div className="flex items-center p-4 text-sm text-green-700 bg-green-100 rounded-lg">
                                        <span>Request has been sent. Please follow the instructions sent to your email address.</span>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCloseForgotDialog}>
                                        Close
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}