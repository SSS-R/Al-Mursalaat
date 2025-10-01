// File: Frontend/app/admin/admins/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';

// Define the type for an Admin user, matching our Pydantic schema
interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
    phone_number: string;
}

export default function AdminManagementPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await fetch('http://localhost:8000/admin/users/', {
                    credentials: 'include', // Send the session cookie
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch admins. You may not have permission.');
                }
                
                const data: AdminUser[] = await response.json();
                setAdmins(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdmins();
    }, []);

    if (isLoading) {
        return <div className="p-10">Loading admins...</div>;
    }

    if (error) {
        return <div className="p-10 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-6 sm:p-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        Admin Management
                    </h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Add, view, and manage other admins.
                    </p>
                </div>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary/90">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add New Admin
                </button>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Phone</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin) => (
                            <tr key={admin.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {admin.name}
                                </td>
                                <td className="px-6 py-4">{admin.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        admin.role === 'supreme-admin' 
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                    }`}>
                                        {admin.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{admin.phone_number}</td>
                                <td className="px-6 py-4">
                                    <button className="font-medium text-red-600 dark:text-red-500 hover:underline">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}