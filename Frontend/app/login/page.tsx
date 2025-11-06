"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, AlertCircle } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

// Helper to set a cookie
function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
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

            const response = await fetch('v1/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            });

            if (response.ok) {
                const data = await response.json();
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
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'An unexpected error occurred.');
            }
        } catch (error) {
            console.error('Login request failed:', error);
            setError('Could not connect to the server. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
                        <label htmlFor="password"className="block mb-2 text-sm font-medium">Password</label>
                        <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="••••••••" />
                    </div>
                    {error && (<div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg"><AlertCircle className="w-5 h-5 mr-2" /><span>{error}</span></div>)}
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50">
                            {isLoading ? 'Signing in...' : 'Sign In'}
                            {!isLoading && <LogIn className="w-5 h-5 ml-2" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}