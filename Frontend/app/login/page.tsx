"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, AlertCircle } from 'lucide-react';

// The old mock apiLogin function has been removed.

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
      // We now call our API endpoint using fetch
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // A successful response (200 OK) means the cookie was set by the server.
        // We can now redirect to the dashboard.
        router.push('/admin/dashboard');
      } else {
        // If the server returns an error (like 401 Unauthorized), display it.
        const data = await response.json();
        setError(data.error || 'An unexpected error occurred.');
      }
    } catch (error) {
      console.error('Login request failed:', error);
      setError('Could not connect to the server. Please try again later.');
    }

    setIsLoading(false);
  };

  // The rest of your JSX form remains exactly the same.
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Panel Login
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome back. Please enter your credentials.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-gray-900 bg-gray-100 border-2 border-gray-200 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="you@example.com"
            />
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-gray-900 bg-gray-100 border-2 border-gray-200 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <LogIn className="w-5 h-5 ml-2" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}