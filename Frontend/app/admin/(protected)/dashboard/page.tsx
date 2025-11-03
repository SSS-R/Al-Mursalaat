"use client";

import { useState, useEffect, Suspense } from "react";
import { Users, BookOpen, UserPlus, AlertCircle } from "lucide-react";

// Define types for the data we expect
type User = {
  email: string;
};
type Stats = {
  total_students: number;
  total_teachers: number;
  unassigned_students: number;
  pending_applications: number;
};

// A reusable card component for displaying stats
function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
      <div className="bg-primary/10 p-3 rounded-full">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  // ...existing code...
  // Session/auth check removed; now handled in layout
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await fetch(
          "/api/v1/admin/dashboard-stats/",
          { credentials: "include" }
        );
        if (!statsRes.ok) throw new Error("Failed to fetch stats.");
        const statsData = await statsRes.json();
        setStats(statsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="p-10">Loading Dashboard...</div>;
  }
  if (error) {
    return <div className="p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <Suspense>
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Dashboard Overview
      </h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Welcome back. Here is a summary of your academy.
      </p>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats && (
          <>
            <StatCard
              title="Total Students"
              value={stats.total_students}
              icon={Users}
            />
            <StatCard
              title="Total Teachers"
              value={stats.total_teachers}
              icon={BookOpen}
            />
            <StatCard
              title="Pending Applications"
              value={stats.pending_applications}
              icon={UserPlus}
            />
            <StatCard
              title="Unassigned Students"
              value={stats.unassigned_students}
              icon={AlertCircle}
            />
          </>
        )}
      </div>
      
      {/* We can add more components like charts or recent activity feeds here later */}
    </div>
    </Suspense>
  );
}
