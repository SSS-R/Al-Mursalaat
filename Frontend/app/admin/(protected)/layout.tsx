"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Home,
  BookOpen,
  LogOut,
  ChevronDown,
  Shield,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import { UserProvider } from "@/app/context/UserContext";

type User = {
  email: string;
  role: "supreme-admin" | "admin";
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const userData: User = await response.json();
        setUser(userData);
      } catch (error) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [pathname]);

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

  const isActive = (path: string) => pathname.startsWith(path);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile hamburger button */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden flex items-center justify-between bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
        <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
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
          <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
        </div>
        {/* Add padding for mobile to account for fixed header */}
        <div className="pt-20 md:pt-0">
          <nav className="mt-6 px-4">
            <Link
              href="/admin/dashboard"
              onClick={closeSidebar}
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive("/admin/dashboard")
                  ? "text-primary font-semibold"
                  : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="mx-4 font-medium">Dashboard</span>
            </Link>

            <div className="mt-2">
              <button
                onClick={() => setIsStudentsOpen(!isStudentsOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white rounded-lg"
              >
                <div className="flex items-center">
                  <Users className="w-5 h-5" />
                  <span className="mx-4 font-medium">Students</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    isStudentsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isStudentsOpen && (
                <div className="py-2 pl-8 pr-4">
                  <Link
                    href="/admin/students?view=all"
                    onClick={closeSidebar}
                    className={`block px-4 py-2 mt-1 text-sm rounded-lg ${
                      pathname === "/admin/students" &&
                      searchParams.get("view") === "all"
                        ? "text-primary font-semibold"
                        : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    All Students
                  </Link>
                  <Link
                    href="/admin/students?view=unassigned"
                    onClick={closeSidebar}
                    className={`block px-4 py-2 mt-1 text-sm rounded-lg ${
                      pathname === "/admin/students" &&
                      searchParams.get("view") === "unassigned"
                        ? "text-primary font-semibold"
                        : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    Unassigned Students
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/admin/teachers"
              onClick={closeSidebar}
              className={`mt-2 flex items-center px-4 py-3 rounded-lg ${
                isActive("/admin/teachers")
                  ? "text-primary font-semibold"
                  : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="mx-4 font-medium">Teachers</span>
            </Link>

            {user?.role === "supreme-admin" && (
              <Link
                href="/admin/admins"
                onClick={closeSidebar}
                className={`mt-2 flex items-center px-4 py-3 rounded-lg ${
                  isActive("/admin/admins")
                    ? "text-primary font-semibold"
                    : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="mx-4 font-medium">Admins</span>
              </Link>
            )}
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

      <main className="flex-1 w-full md:pt-0 pt-20">
        <UserProvider user={user}>{children}</UserProvider>
      </main>
    </div>
  );
}
