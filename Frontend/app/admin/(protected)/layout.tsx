// File: Frontend/app/admin/layout.tsx
"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Users, Home, BookOpen, LogOut, ChevronDown, Shield
} from 'lucide-react';

type User = {
    email: string;
    role: 'supreme-admin' | 'admin';
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStudentsOpen, setIsStudentsOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname(); // Hook to get the current URL

    // This useEffect fetches the user's role to display the correct sidebar links
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
        return <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">Loading...</div>;
    }
    
    // Helper function to determine if a link is active
    const isActive = (path: string) => pathname === path;

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0">
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
                </div>
                <nav className="mt-6 px-4">
                    <Link href="/admin/dashboard" className={`flex items-center px-4 py-3 rounded-lg ${isActive('/admin/dashboard') ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white'}`}>
                        <Home className="w-5 h-5" />
                        <span className="mx-4 font-medium">Dashboard</span>
                    </Link>
            
                    <div className="mt-2">
                        <button onClick={() => setIsStudentsOpen(!isStudentsOpen)} className="w-full flex items-center justify-between px-4 py-3 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white rounded-lg">
                        <div className="flex items-center">
                            <Users className="w-5 h-5" />
                            <span className="mx-4 font-medium">Students</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 transition-transform ${isStudentsOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isStudentsOpen && (
                            <div className="py-2 pl-8 pr-4">
                                <Link 
                                    href="/admin/students?view=all" 
                                    className={`block px-4 py-2 mt-1 text-sm rounded-lg ${pathname === '/admin/students' ? 'text-primary font-semibold' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white'}`}>
                                    All Students
                                </Link>
                                <Link 
                                    href="/admin/students?view=unassigned" 
                                    className={`block px-4 py-2 mt-1 text-sm rounded-lg ${pathname === '/admin/students' ? 'text-primary font-semibold' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white'}`}>
                                    Unassigned Students
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* We'll create this page later */}
                    <Link href="/admin/teachers" className={`mt-2 flex items-center px-4 py-3 rounded-lg ${isActive('/admin/teachers') ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white'}`}>
                        <BookOpen className="w-5 h-5" />
                        <span className="mx-4 font-medium">Teachers</span>
                    </Link>

                    {user?.role === 'supreme-admin' && (
                        <Link href="/admin/admins" className={`mt-2 flex items-center px-4 py-3 rounded-lg ${isActive('/admin/admins') ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white'}`}>
                            <Shield className="w-5 h-5" />
                            <span className="mx-4 font-medium">Admins</span>
                        </Link>
                    )}
                </nav>
                <div className="absolute bottom-0 w-64 p-6 border-t dark:border-gray-700">
                    <button className="flex items-center w-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white -mx-2 px-2 py-2 rounded-lg">
                        <LogOut className="w-5 h-5" />
                        <span className="mx-4 font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* This renders the content of the current page (e.g., your dashboard overview) */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}