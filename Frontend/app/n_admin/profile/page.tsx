"use client";

import { useState, useEffect, FormEvent } from 'react';
import { KeyRound, CheckCircle, AlertCircle, UserCircle } from 'lucide-react';

// Define a type for the logged-in user's data
type User = {
    name: string;
    email: string;
    role: string;
};

export default function ProfilePage() {
    // State for the form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // State for user data and notifications
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch the logged-in user's data when the page loads
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me', { credentials: 'include' });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };
        fetchUser();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters long.");
            return;
        }

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
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 sm:p-10">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Profile</h1>
            
            {/* User Info Display */}
            {user && (
                <div className="mt-8 flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-lg">
                    <UserCircle className="w-12 h-12 text-gray-400" />
                    <div>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                </div>
            )}

            {/* Change Password Form */}
            <div className="mt-8 max-w-lg">
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold">Change Password</h2>
                            <p className="text-sm text-gray-500 mt-1">Update the password for your account.</p>
                            
                            <div className="mt-6 space-y-4">
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium">Current Password</label>
                                    <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium">New Password</label>
                                    <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm New Password</label>
                                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
                            <div>
                                {error && <div className="flex items-center text-sm text-red-600"><AlertCircle className="w-4 h-4 mr-2" />{error}</div>}
                                {success && <div className="flex items-center text-sm text-green-600"><CheckCircle className="w-4 h-4 mr-2" />{success}</div>}
                            </div>
                            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50">
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}