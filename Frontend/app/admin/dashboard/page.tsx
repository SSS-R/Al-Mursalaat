// File: Frontend/app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link
import {
  Users, Home, BookOpen, LogOut, ChevronDown, Shield
} from 'lucide-react';

type User = {
  email: string;
  role: 'supreme-admin' | 'admin';
};

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const router = useRouter();

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

  // NOTE: The main content is now inside a separate Layout component.
  // This page only needs to render the overview.
  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Dashboard Overview
      </h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Welcome, {user?.email}. Here is a summary of your academy.
      </p>
      {/* We will add stats cards and charts here later */}
    </div>
  );
}