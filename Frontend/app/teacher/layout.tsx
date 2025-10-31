"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  UserCircle,
  LogOut,
  CalendarDays,
  Menu,
  X,
} from "lucide-react";

type User = {
  email: string;
  role: "supreme-admin" | "admin" | "teacher";
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login"); // Redirect to login if not authenticated
          return;
        }

        const userData: User = await response.json();

        // --- THIS IS THE KEY SECURITY CHECK ---
        if (userData.role !== "teacher") {
          // If a non-teacher tries to access, send them away
          alert("Access Denied. Redirecting to login.");
          router.push("/login");
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        Loading...
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile hamburger button */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden flex items-center justify-between bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
        <h2 className="text-xl font-bold text-primary">Teacher Portal</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0 h-screen md:h-auto transition-transform duration-300 z-40 md:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 text-center hidden md:block">
          <h2 className="text-2xl font-bold text-primary">Teacher Portal</h2>
        </div>
        {/* Add padding for mobile to account for fixed header */}
        <div className="pt-20 md:pt-0">
          <nav className="mt-6 px-4">
            <Link
              href="/teacher/dashboard"
              onClick={closeSidebar}
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive("/teacher/dashboard")
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white"
                  : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              <CalendarDays className="w-5 h-5" />
              <span className="mx-4 font-medium">My Schedule</span>
            </Link>
            <Link
              href="/teacher/students"
              onClick={closeSidebar}
              className={`mt-2 flex items-center px-4 py-3 rounded-lg ${
                isActive("/teacher/students")
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white"
                  : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="mx-4 font-medium">My Students</span>
            </Link>
            <Link
              href="/teacher/profile"
              onClick={closeSidebar}
              className={`mt-2 flex items-center px-4 py-3 rounded-lg ${
                isActive("/teacher/profile")
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white"
                  : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              <UserCircle className="w-5 h-5" />
              <span className="mx-4 font-medium">My Profile</span>
            </Link>
          </nav>
          <div className="absolute bottom-0 w-64 p-6 border-t dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white -mx-2 px-2 py-2 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              <span className="mx-4 font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 w-full md:pt-0 pt-20">{children}</main>
    </div>
  );
}
