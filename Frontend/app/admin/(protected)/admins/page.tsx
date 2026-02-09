"use client";

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { UserPlus, Trash2, X, FileText, Eye, Pencil } from 'lucide-react';
import { apiFetch } from '@/lib/api';

// --- Types ---
interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
    phone_number: string;
    gender: string;
    profile_photo_url?: string;
    cv_url?: string;
}

// --- Add Admin Modal Component ---
function AddAdminModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => Promise<void>; }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isWhatsappDifferent, setIsWhatsappDifferent] = useState(false);
    const [whatsapp, setWhatsapp] = useState('');
    const [gender, setGender] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [cv, setCV] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("gender", gender);
        formData.append("phone_number", phone);
        formData.append("whatsapp_number", isWhatsappDifferent ? whatsapp : phone);
        formData.append("role", "admin");

        if (photo) formData.append("photo", photo);
        if (cv) formData.append("cv", cv);

        try {
            await onSave(formData);
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
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        {error && <div className="p-3 text-red-700 bg-red-100 rounded">{error}</div>}

                        <div><label className="block text-sm font-medium">Full Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div><label className="block text-sm font-medium">Email Address *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div>
                            <label className="block text-sm font-medium">Gender *</label>
                            <select value={gender} onChange={(e) => setGender(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option>
                            </select>
                        </div>
                        <div><label className="block text-sm font-medium">Phone Number *</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" /></div>

                        <div className="flex items-center">
                            <input type="checkbox" checked={isWhatsappDifferent} onChange={(e) => setIsWhatsappDifferent(e.target.checked)} className="h-4 w-4 rounded" />
                            <label className="ml-2 block text-sm">WhatsApp number is different</label>
                        </div>
                        {isWhatsappDifferent && (
                            <div><label className="block text-sm font-medium">WhatsApp Number *</label><input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" /></div>
                        )}

                        <div>
                            <label className="block text-sm font-medium">Photo (Optional - Max 5MB)</label>
                            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">CV (Optional - Max 10MB)</label>
                            <input type="file" accept=".pdf" onChange={e => setCV(e.target.files?.[0] || null)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>
                    <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 mr-2 text-sm bg-white border rounded-md hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50">{isLoading ? 'Saving...' : 'Save Admin'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Edit Admin Modal ---
function EditAdminModal({
    isOpen,
    onClose,
    admin,
    onUpdate,
    onDeletePhoto,
    onDeleteCV
}: {
    isOpen: boolean;
    onClose: () => void;
    admin: AdminUser | null;
    onUpdate: (id: number, data: any) => Promise<void>;
    onDeletePhoto: (id: number) => Promise<void>;
    onDeleteCV: (id: number) => Promise<void>;
}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [cv, setCV] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [existingCvUrl, setExistingCvUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (admin) {
            setName(admin.name);
            setEmail(admin.email);
            setPhone(admin.phone_number);
            setGender(admin.gender);
            setWhatsapp(admin.phone_number);
            setPhotoPreview(admin.profile_photo_url || null);
            setExistingCvUrl(admin.cv_url || null);
            setPhoto(null);
            setCV(null);
            setError(null);
        }
    }, [admin, isOpen]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleDeletePhoto = async () => {
        if (!admin) return;
        if (!window.confirm("Are you sure you want to delete this photo?")) return;

        try {
            await onDeletePhoto(admin.id);
            setPhotoPreview(null);
            setPhoto(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteCV = async () => {
        if (!admin) return;
        if (!window.confirm("Are you sure you want to delete this CV?")) return;

        try {
            await onDeleteCV(admin.id);
            setExistingCvUrl(null);
            setCV(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!admin) return;
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("phone_number", phone);
        formData.append("gender", gender);
        formData.append("whatsapp_number", whatsapp);

        if (photo) formData.append("photo", photo);
        if (cv) formData.append("cv", cv);

        try {
            await onUpdate(admin.id, formData);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Extract filename from URL for display
    const getCvFilename = (url: string | null) => {
        if (!url) return null;
        const parts = url.split('/');
        return parts[parts.length - 1] || 'CV.pdf';
    };

    if (!isOpen || !admin) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                        <h3 className="text-lg font-semibold">Edit Admin</h3>
                        <button type="button" onClick={onClose}><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        {error && <div className="p-3 text-red-700 bg-red-100 rounded">{error}</div>}

                        <div><label className="block text-sm font-medium">Full Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div><label className="block text-sm font-medium">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div><label className="block text-sm font-medium">Phone</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div><label className="block text-sm font-medium">Gender</label><select value={gender} onChange={(e) => setGender(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"><option value="Male">Male</option><option value="Female">Female</option></select></div>

                        <div>
                            <label className="block text-sm font-medium">Update Photo (Max 5MB)</label>
                            {photoPreview && (
                                <div className="mt-2 mb-2 relative inline-block">
                                    <img src={photoPreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                                    <button
                                        type="button"
                                        onClick={handleDeletePhoto}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        title="Delete Photo"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Update CV (Max 10MB)</label>
                            {existingCvUrl && !cv && (
                                <div className="mt-2 mb-2 flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                    <FileText className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                                        {getCvFilename(existingCvUrl)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleDeleteCV}
                                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        title="Delete CV"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                            <input type="file" accept=".pdf" onChange={e => setCV(e.target.files?.[0] || null)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            {cv && <p className="mt-1 text-sm text-green-600">New CV selected: {cv.name}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 mr-2 text-sm bg-white border rounded-md hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50">{isLoading ? 'Updating...' : 'Update Admin'}</button>
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
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

    // Photo modal state
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [photoModalData, setPhotoModalData] = useState<{ url: string; name: string } | null>(null);

    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch<AdminUser[]>('/api/admin/users/');
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

    const getFileUrl = (path: string | undefined) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;

        // Convert static file paths to API endpoints for reliable file serving
        // e.g., /uploads/admin_photos/uuid.jpg -> /api/files/admin-photo/uuid.jpg
        if (path.startsWith("/uploads/teacher_photos/")) {
            const filename = path.replace("/uploads/teacher_photos/", "");
            return `/api/files/teacher-photo/${filename}`;
        }
        if (path.startsWith("/uploads/teacher_cvs/")) {
            const filename = path.replace("/uploads/teacher_cvs/", "");
            return `/api/files/teacher-cv/${filename}`;
        }
        if (path.startsWith("/uploads/admin_photos/")) {
            const filename = path.replace("/uploads/admin_photos/", "");
            return `/api/files/admin-photo/${filename}`;
        }
        if (path.startsWith("/uploads/admin_cvs/")) {
            const filename = path.replace("/uploads/admin_cvs/", "");
            return `/api/files/admin-cv/${filename}`;
        }

        return path;
    };

    const handleSaveAdmin = async (adminData: any) => {
        try {
            await apiFetch('/api/admin/create-admin/', {
                method: 'POST',
                body: adminData, // formData
            });
            setIsModalOpen(false);
            fetchAdmins();
        } catch (err: any) {
            throw err;
        }
    };

    const handleUpdateAdmin = async (id: number, data: any) => {
        try {
            await apiFetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                body: data,
            });
            fetchAdmins();
        } catch (err: any) {
            throw err;
        }
    };

    const handleDeleteAdminPhoto = async (userId: number) => {
        try {
            await apiFetch(`/api/admin/users/${userId}/photo`, {
                method: 'DELETE',
            });
            fetchAdmins();
        } catch (err: any) {
            throw err;
        }
    };

    const handleDeleteAdminCV = async (userId: number) => {
        try {
            await apiFetch(`/api/admin/users/${userId}/cv`, {
                method: 'DELETE',
            });
            fetchAdmins();
        } catch (err: any) {
            throw err;
        }
    };

    const handleDelete = async (userId: number) => {
        if (!window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
            return;
        }
        try {
            await apiFetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });
            alert('Admin deleted successfully.');
            setAdmins(currentAdmins => currentAdmins.filter(admin => admin.id !== userId));
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const openEdit = (admin: AdminUser) => {
        setSelectedAdmin(admin);
        setEditModalOpen(true);
    };

    const handleShowPhoto = (admin: AdminUser) => {
        if (!admin.profile_photo_url) {
            alert("No photo available for this admin.");
            return;
        }
        setPhotoModalData({
            url: getFileUrl(admin.profile_photo_url),
            name: admin.name
        });
        setPhotoModalOpen(true);
    };

    return (
        <Suspense>
            <div className="p-6 sm:p-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Management</h1>
                        <p className="mt-2 text-gray-500">Add, view, and manage other admins.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 text-sm text-white bg-primary rounded-lg shadow-sm hover:bg-primary/90 w-full sm:w-auto justify-center">
                        <UserPlus className="w-5 h-5 mr-2" />
                        Add New Admin
                    </button>
                </div>

                <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[900px]">
                            <thead className="text-xs uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Gender</th>
                                    <th scope="col" className="px-6 py-3">Role</th>
                                    <th scope="col" className="px-6 py-3">Phone</th>
                                    <th scope="col" className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map((admin) => (
                                    <tr key={admin.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{admin.name}</td>
                                        <td className="px-6 py-4">{admin.email}</td>
                                        <td className="px-6 py-4">{admin.gender}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${admin.role === 'supreme-admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{admin.phone_number}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {admin.profile_photo_url && (
                                                    <button onClick={() => handleShowPhoto(admin)} className="text-blue-500 hover:text-blue-700" title="View Photo"><Eye className="w-4 h-4" /></button>
                                                )}
                                                {admin.cv_url && (
                                                    <a href={getFileUrl(admin.cv_url)} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline"><FileText className="w-4 h-4" /></a>
                                                )}
                                                {/* Allow editing of admins, maybe restricted to Supreme Admin? Requirement said "from the creation... or patch via supreme admin" */}
                                                <button onClick={() => openEdit(admin)} className="font-medium text-yellow-600 hover:underline"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(admin.id)} className="font-medium text-red-600 hover:underline"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <AddAdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAdmin} />
                    <EditAdminModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} admin={selectedAdmin} onUpdate={handleUpdateAdmin} onDeletePhoto={handleDeleteAdminPhoto} onDeleteCV={handleDeleteAdminCV} />

                    {/* Photo Modal */}
                    {photoModalOpen && photoModalData && (
                        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPhotoModalOpen(false)}>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                                    <h3 className="text-lg font-semibold">{photoModalData.name}'s Photo</h3>
                                    <button onClick={() => setPhotoModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                                </div>
                                <div className="p-4 flex items-center justify-center min-h-[300px]">
                                    <img src={photoModalData.url} alt={`${photoModalData.name}'s photo`} className="max-w-full max-h-[70vh] object-contain rounded" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Suspense>
    );
}