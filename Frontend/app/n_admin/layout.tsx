// File: Frontend/app/n_admin/layout.tsx
"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, UserCircle, LogOut } from 'lucide-react';

type User = {
    email: string;
    role: 'supreme-admin' | 'admin' | 'teacher';
};

export default function NormalAdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
          try {
            const response = await fetch('/api/auth/me');
            if (!response.ok) {
              router.push('/admin/login');
              return;
            }
            const userData: User = await response.json();
            setUser(userData);
          } catch (error) {
            console.error("Failed to fetch user:", error);
            router.push('/admin/login');
          } finally {
            setIsLoading(false);
          }
        };
        fetchUser();
    }, [router]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    const isActive = (path: string) => pathname === path;

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0">
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold text-primary">Admin Portal</h2>
                </div>
                <nav className="mt-6 px-4">
                    {/* We will build this page later */}
                    <Link href="/n_admin/dashboard" className={`flex items-center px-4 py-3 rounded-lg ${isActive('/n_admin/dashboard') ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white'}`}>
                        <Home className="w-5 h-5" />
                        <span className="mx-4 font-medium">Dashboard</span>
                    </Link>
                    
                    <Link href="/n_admin/profile" className={`mt-2 flex items-center px-4 py-3 rounded-lg ${isActive('/n_admin/profile') ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white'}`}>
                        <UserCircle className="w-5 h-5" />
                        <span className="mx-4 font-medium">My Profile</span>
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-64 p-6 border-t dark:border-gray-700">
                   <button className="flex items-center w-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white -mx-2 px-2 py-2 rounded-lg">
                        <LogOut className="w-5 h-5" />
                        <span className="mx-4 font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}