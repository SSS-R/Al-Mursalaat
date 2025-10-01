// File: Frontend/app/admin/admins/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { UserPlus, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Types ---
interface AdminUser {
    id: number; name: string; email: string; role: string; phone_number: string;
}

// --- Add Admin Modal Component ---
function AddAdminModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => Promise<void>; }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isWhatsappDifferent, setIsWhatsappDifferent] = useState(false);
    const [whatsapp, setWhatsapp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        const adminData = {
            name,
            email,
            phone_number: phone,
            whatsapp_number: isWhatsappDifferent ? whatsapp : phone,
            role: 'admin', // All manually created users are 'admin' by default
        };
        try {
            await onSave(adminData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                        <h3 className="text-lg font-semibold">Add New Admin</h3>
                        <button type="button" onClick={onClose}><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        {error && <div className="p-3 text-red-700 bg-red-100 rounded">{error}</div>}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">Full Name *</label>
                            <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium">Email Address *</label>
                            <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium">Phone Number *</label>
                            <input type="tel" name="phone" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="whatsapp-check" checked={isWhatsappDifferent} onChange={(e) => setIsWhatsappDifferent(e.target.checked)} className="h-4 w-4 rounded" />
                            <label htmlFor="whatsapp-check" className="ml-2 block text-sm">WhatsApp number is different</label>
                        </div>
                        {isWhatsappDifferent && (
                            <div>
                                <label htmlFor="whatsapp" className="block text-sm font-medium">WhatsApp Number *</label>
                                <input type="tel" name="whatsapp" id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 mr-2 text-sm bg-white border rounded-md hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50">
                            {isLoading ? 'Saving...' : 'Save Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Main Page Component ---
export default function AdminManagementPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const fetchAdmins = async () => {
        try {
            const response = await fetch('http://localhost:8000/admin/users/', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch admins.');
            const data: AdminUser[] = await response.json();
            setAdmins(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleSaveAdmin = async (adminData: any) => {
        const response = await fetch('http://localhost:8000/admin/create-admin/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(adminData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create admin.');
        }

        // Success
        onClose();
        fetchAdmins(); // Re-fetch the list of admins to show the new one
    };
    
    const onClose = () => {
        setIsModalOpen(false);
    };

    if (isLoading) return <div className="p-10">Loading admins...</div>;
    if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 sm:p-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin Management</h1>
                    <p className="mt-2 text-gray-500">Add, view, and manage other admins.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 text-sm text-white bg-primary rounded-lg shadow-sm hover:bg-primary/90">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add New Admin
                </button>
            </div>

            {/* Admin List Table (same as before) */}
            <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left">
                    {/* ... (table head) ... */}
                    <tbody>
                        {admins.map((admin) => (
                            <tr key={admin.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{admin.name}</td>
                                <td className="px-6 py-4">{admin.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${admin.role === 'supreme-admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {admin.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{admin.phone_number}</td>
                                <td className="px-6 py-4">
                                    <button className="font-medium text-red-600 hover:underline"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AddAdminModal isOpen={isModalOpen} onClose={onClose} onSave={handleSaveAdmin} />
        </div>
    );
}