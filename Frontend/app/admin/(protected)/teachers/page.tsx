// File: Frontend/app/admin/(protected)/teachers/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { UserPlus, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Types ---
interface Teacher {
    id: number;
    name: string;
    email: string;
    shift: string;
    phone_number: string;
    gender: string;
}
type User = {
    email: string;
    role: 'supreme-admin' | 'admin';
};

// --- Add Teacher Modal Component ---
function AddTeacherModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => Promise<void>; }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isWhatsappDifferent, setIsWhatsappDifferent] = useState(false);
    const [whatsapp, setWhatsapp] = useState('');
    const [gender, setGender] = useState('');
    const [shift, setShift] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        const teacherData = {
            name, email, gender, shift,
            phone_number: phone,
            whatsapp_number: isWhatsappDifferent ? whatsapp : phone,
        };
        try {
            await onSave(teacherData);
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
                        <h3 className="text-lg font-semibold">Add New Teacher</h3>
                        <button type="button" onClick={onClose}><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                            <label htmlFor="gender" className="block text-sm font-medium">Gender *</label>
                            <select name="gender" id="gender" value={gender} onChange={(e) => setGender(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
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
                        <div>
                            <label htmlFor="shift" className="block text-sm font-medium">Shift *</label>
                            <select name="shift" id="shift" value={shift} onChange={(e) => setShift(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option value="">Select a shift</option>
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                                <option value="Evening">Evening</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 mr-2 text-sm bg-white border rounded-md hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50">
                            {isLoading ? 'Saving...' : 'Save Teacher'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// --- Main Page Component ---
export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const fetchTeachers = async () => {
        try {
            const response = await fetch('http://localhost:8000/admin/teachers/', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch teachers.');
            const teachersData: Teacher[] = await response.json();
            setTeachers(teachersData);
        } catch (err: any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const userResponse = await fetch('/api/auth/me', { credentials: 'include' });
                if (!userResponse.ok) {
                    router.push('/admin/login');
                    return;
                }
                const userData: User = await userResponse.json();
                setUser(userData);
                
                await fetchTeachers();
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [router]);

    const handleSaveTeacher = async (teacherData: any) => {
        const response = await fetch('http://localhost:8000/admin/teachers/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(teacherData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create teacher.');
        }
        setIsModalOpen(false);
        await fetchTeachers();
    };

    const handleDeleteTeacher = async (teacherId: number) => {
        if (!window.confirm('Are you sure you want to delete this teacher?')) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:8000/admin/teachers/${teacherId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to delete teacher.');
            }
            alert('Teacher deleted successfully.');
            setTeachers(currentTeachers => currentTeachers.filter(t => t.id !== teacherId));
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    if (isLoading) return <div className="p-10">Loading teachers...</div>;
    if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 sm:p-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Teacher Management</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Add, view, and manage teachers.</p>
                </div>
                {user?.role === 'supreme-admin' && (
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary/90">
                        <UserPlus className="w-5 h-5 mr-2" />
                        Add New Teacher
                    </button>
                )}
            </div>
            
            {/* Placeholder Sorting Controls */}
            <div className="mt-4 flex items-center space-x-4">
                 {/* We will add functional sorting controls here later */}
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Gender</th>
                            <th scope="col" className="px-6 py-3">Shift</th>
                            <th scope="col" className="px-6 py-3">Phone</th>
                            <th scope="col" className="px-6 py-3">Students</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((teacher) => (
                            <tr key={teacher.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium">{teacher.name}</td>
                                <td className="px-6 py-4">{teacher.email}</td>
                                <td className="px-6 py-4">{teacher.gender}</td>
                                <td className="px-6 py-4">{teacher.shift}</td>
                                <td className="px-6 py-4">{teacher.phone_number}</td>
                                <td className="px-6 py-4">0</td>
                                <td className="px-6 py-4">
                                    {user?.role === 'supreme-admin' && (
                                        <button onClick={() => handleDeleteTeacher(teacher.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {teachers.length === 0 && (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                        No teachers have been added yet.
                    </div>
                )}
            </div>
            <AddTeacherModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTeacher} />
        </div>
    );
}