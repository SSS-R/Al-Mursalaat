"use client";

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

// --- Types ---
interface Student { 
    id: number; 
    first_name: string; 
    last_name: string; 
    age: number; 
    country: string; 
    gender: string; 
}
interface Teacher { id: number; name: string; students: Student[]; }

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const response = await fetch('/api/teacher/me', { credentials: 'include' });
                if (!response.ok) {
                    throw new Error('Could not fetch data. Please re-login.');
                }
                const data: Teacher = await response.json();
                setStudents(data.students);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeacherData();
    }, []);

    if (isLoading) return <div className="p-10">Loading students...</div>;
    if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 sm:p-10">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Students</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">A list of your assigned students.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.length > 0 ? (
                    students.map(student => (
                        <div key={student.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5">
                            <h3 className="text-lg font-semibold text-primary">{`${student.first_name} ${student.last_name}`}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{student.gender}, Age {student.age}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">From: {student.country}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full">You do not have any students assigned yet.</p>
                )}
            </div>
        </div>
    );
}