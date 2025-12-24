"use client";

import { useState, useEffect, FormEvent } from 'react';
import { KeyRound, CheckCircle, AlertCircle, UserCircle } from 'lucide-react';

type User = { name: string; email: string; role: string; };

interface AttendanceCount {
    teacher_by_course: {
        [course: string]: {
            Present: number;
            Absent: number;
            Late: number;
        };
    };
    students: {
        [studentId: string]: {
            student: {
                id: number;
                name: string;
            };
            counts: {
                Present?: number;
                Absent?: number;
                Late?: number;
            };
        };
    };
}

export default function ProfilePage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Attendance stats state
    const [selectedMonth, setSelectedMonth] = useState<string>(
        new Date().toISOString().split('T')[0].slice(0, 7)
    );
    const [attendanceCount, setAttendanceCount] = useState<AttendanceCount | null>(null);
    const [loadingAttendanceCount, setLoadingAttendanceCount] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me', { credentials: 'include' });
                if (response.ok) setUser(await response.json());
            } catch (error) { console.error("Failed to fetch user data:", error); }
        };
        fetchUser();
        fetchAttendanceCount(selectedMonth);
    }, []);

    const fetchAttendanceCount = async (monthStr: string) => {
        setLoadingAttendanceCount(true);
        const [year, month] = monthStr.split('-');
        try {
            const response = await fetch(
                `/api/teacher/my-attendance-stats?year=${year}&month=${month}`,
                { credentials: 'include' }
            );
            if (response.ok) {
                const data: AttendanceCount = await response.json();
                setAttendanceCount(data);
            }
        } catch (err) {
            console.error('Error fetching attendance count:', err);
        } finally {
            setLoadingAttendanceCount(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null); setSuccess(null);
        if (newPassword !== confirmPassword) { setError("New passwords do not match."); return; }
        if (newPassword.length < 8) { setError("New password must be at least 8 characters long."); return; }

        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/users/me/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update password.');
            }
            setSuccess('Password updated successfully!');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 sm:p-10">
            <h1 className="text-3xl font-bold">My Profile</h1>
            {user && (
                <div className="mt-8 flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-lg">
                    <UserCircle className="w-12 h-12 text-gray-400" />
                    <div>
                        <p className="text-lg font-semibold">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>
            )}
            

            {/* Attendance Stats Section */}
            <div className="mt-8 max-w-4xl">
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">My Attendance Statistics</h2>
                    <div className="flex items-center space-x-4 mb-4">
                        <label htmlFor="month-picker" className="font-medium">
                            Select Month:
                        </label>
                        <input
                            type="month"
                            id="month-picker"
                            value={selectedMonth}
                            onChange={(e) => {
                                setSelectedMonth(e.target.value);
                                fetchAttendanceCount(e.target.value);
                            }}
                            className="p-2 border rounded-md"
                        />
                    </div>

                    {loadingAttendanceCount ? (
                        <p className="text-sm text-gray-500">
                            Loading attendance data...
                        </p>
                    ) : attendanceCount &&
                        (Object.keys(attendanceCount.teacher_by_course || {}).length > 0 ||
                            Object.keys(attendanceCount.students || {}).length > 0) ? (
                        <div className="space-y-4">
                            {/* Teacher Attendance by Course */}
                            {Object.keys(attendanceCount.teacher_by_course || {}).length > 0 && (
                                <div>
                                    <h5 className="font-semibold text-sm mb-2">My Attendance by Course</h5>
                                    <div className="space-y-2">
                                        {Object.entries(attendanceCount.teacher_by_course).map(
                                            ([course, counts]) => (
                                                <div
                                                    key={course}
                                                    className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded"
                                                >
                                                    <p className="font-medium text-sm mb-1">{course}</p>
                                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-300">
                                                                Present:
                                                            </span>
                                                            <p className="font-bold text-green-600">
                                                                {counts.Present || 0}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-300">
                                                                Absent:
                                                            </span>
                                                            <p className="font-bold text-red-600">
                                                                {counts.Absent || 0}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-300">
                                                                Late:
                                                            </span>
                                                            <p className="font-bold text-yellow-600">
                                                                {counts.Late || 0}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Students Attendance */}
                            {Object.keys(attendanceCount.students || {}).length > 0 && (
                                <div>
                                    <h5 className="font-semibold text-sm mb-2">My Students Attendance</h5>
                                    <div className="space-y-2">
                                        {Object.entries(attendanceCount.students).map(
                                            ([studentId, data]) => (
                                                <div
                                                    key={studentId}
                                                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                                                >
                                                    <p className="font-medium">{data.student.name}</p>
                                                    <div className="grid grid-cols-3 gap-2 mt-1 text-xs">
                                                        <span className="text-green-600">
                                                            Present: {data.counts.Present || 0}
                                                        </span>
                                                        <span className="text-red-600">
                                                            Absent: {data.counts.Absent || 0}
                                                        </span>
                                                        <span className="text-yellow-600">
                                                            Late: {data.counts.Late || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                            No attendance data for this month.
                        </p>
                    )}
                </div>
            </div>


            <div className="mt-8 max-w-lg">
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold">Change Password</h2>
                            <p className="text-sm text-gray-500 mt-1">Update the password for your account.</p>
                            <div className="mt-6 space-y-4">
                                <div><label htmlFor="currentPassword">Current Password</label><input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="mt-1 w-full p-2 border rounded-md" /></div>
                                <div><label htmlFor="newPassword">New Password</label><input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="mt-1 w-full p-2 border rounded-md" /></div>
                                <div><label htmlFor="confirmPassword">Confirm New Password</label><input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 w-full p-2 border rounded-md" /></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-b-lg">
                            <div>
                                {error && <div className="flex items-center text-sm text-red-600"><AlertCircle className="w-4 h-4 mr-2" />{error}</div>}
                                {success && <div className="flex items-center text-sm text-green-600"><CheckCircle className="w-4 h-4 mr-2" />{success}</div>}
                            </div>
                            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm text-white bg-primary rounded-md disabled:opacity-50">
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}