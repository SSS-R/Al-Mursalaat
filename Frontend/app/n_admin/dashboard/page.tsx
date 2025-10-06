// File: Frontend/app/n_admin/dashboard/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

// --- Types ---
interface Student {
    id: number;
    first_name: string;
    last_name: string;
    course: string;
}
interface Teacher {
    id: number;
    name: string;
    email: string;
    shift: string;
    gender: string;
    students: Student[];
}

export default function NormalAdminDashboard() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for UI controls
    const [openTeacherId, setOpenTeacherId] = useState<number | null>(null);
    const [shiftFilter, setShiftFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Default');

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await fetch('http://localhost:8000/admin/teachers/', {
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch teachers. Please log in again.');
                }
                const data: Teacher[] = await response.json();
                setTeachers(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeachers();
    }, []);

    const sortedAndFilteredTeachers = useMemo(() => {
        let processedTeachers = [...teachers];

        // 1. Filter by shift
        if (shiftFilter !== 'All') {
            processedTeachers = processedTeachers.filter(t => t.shift === shiftFilter);
        }

        // 2. Sort the list
        if (sortBy === 'Most Students') {
            processedTeachers.sort((a, b) => b.students.length - a.students.length);
        } else if (sortBy === 'Name') {
            processedTeachers.sort((a, b) => a.name.localeCompare(b.name));
        }

        return processedTeachers;
    }, [teachers, shiftFilter, sortBy]);

    const handleToggle = (teacherId: number) => {
        setOpenTeacherId(currentId => (currentId === teacherId ? null : teacherId));
    };

    if (isLoading) return <div className="p-10">Loading teacher data...</div>;
    if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 sm:p-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Teacher & Student Management</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">View and manage assigned teachers and their students.</p>
            </div>
            
            <div className="mt-6 flex items-center space-x-4">
                <div>
                    <label htmlFor="shiftFilter" className="block text-sm font-medium">Filter by Shift</label>
                    <select id="shiftFilter" value={shiftFilter} onChange={e => setShiftFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 border rounded-md">
                        <option>All</option>
                        <option>Morning</option>
                        <option>Afternoon</option>
                        <option>Evening</option>
                        <option>Night</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="sortBy" className="block text-sm font-medium">Sort By</label>
                    <select id="sortBy" value={sortBy} onChange={e => setSortBy(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 border rounded-md">
                        <option>Default</option>
                        <option>Name</option>
                        <option>Most Students</option>
                    </select>
                </div>
            </div>

            <div className="mt-8 space-y-4">
                {sortedAndFilteredTeachers.length > 0 ? (
                    sortedAndFilteredTeachers.map((teacher) => (
                        <div key={teacher.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
                           <button onClick={() => handleToggle(teacher.id)} className="w-full flex items-center justify-between p-4 text-left">
                                <div>
                                    <p className="font-semibold">{teacher.name} <span className="text-sm font-normal text-gray-500">({teacher.gender})</span></p>
                                    <p className="text-sm text-gray-500">{teacher.email} - {teacher.shift} Shift</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">Students: {teacher.students.length}</span>
                                    <ChevronDown className={`w-5 h-5 transition-transform ${openTeacherId === teacher.id ? 'rotate-180' : ''}`} />
                                </div>
                           </button>
                           {/* Expandable "pop down" section */}
                           {openTeacherId === teacher.id && (
                                <div className="border-t dark:border-gray-700 p-4">
                                    <h4 className="font-semibold mb-2">Assigned Students:</h4>
                                    {teacher.students.length > 0 ? (
                                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                            {teacher.students.map(student => (
                                                <li key={student.id}>{student.first_name} {student.last_name} - {student.course}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">No students are currently assigned to this teacher.</p>
                                    )}
                                </div>
                           )}
                        </div>
                    ))
                ) : (
                    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <p className="text-gray-500 dark:text-gray-400">No teachers match the current filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}