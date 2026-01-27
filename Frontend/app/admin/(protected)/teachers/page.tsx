"use client";

import { useState, useEffect, FormEvent } from "react";
import { UserPlus, Trash2, X, FileText, Eye, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import { useUser } from "@/app/context/UserContext";
import { apiFetch } from "@/lib/api";

// --- Types ---
interface Teacher {
  id: number;
  name: string;
  email: string;
  shift: string;
  phone_number: string;
  gender: string;
  profile_photo_url?: string;
  cv_url?: string;
}
type User = {
  email: string;
  role: "supreme-admin" | "admin";
};

// --- Photo Modal Component ---
function PhotoModal({
  isOpen,
  onClose,
  photoUrl,
  teacherName,
}: {
  isOpen: boolean;
  onClose: () => void;
  photoUrl?: string;
  teacherName: string;
}) {
  if (!isOpen || !photoUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">{teacherName}'s Photo</h3>
          <button type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="p-6 flex justify-center">
          <img
            src={`${photoUrl}`}
            alt={teacherName}
            className="max-w-full max-h-96 object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

// --- Add Teacher Modal Component ---
function AddTeacherModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isWhatsappDifferent, setIsWhatsappDifferent] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [gender, setGender] = useState("");
  const [shift, setShift] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [cv, setCV] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Photo must be an image file");
      return;
    }

    // Validate file size (5MB = 5242880 bytes)
    if (file.size > 5242880) {
      setError("Photo must be 5MB or smaller");
      return;
    }

    setPhoto(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("CV must be a PDF file");
      return;
    }

    // Validate file size (10MB = 10485760 bytes)
    if (file.size > 10485760) {
      setError("CV must be 10MB or smaller");
      return;
    }

    setCV(file);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Create FormData to handle files
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("gender", gender);
    formData.append("shift", shift);
    formData.append("phone_number", phone);
    formData.append("whatsapp_number", isWhatsappDifferent ? whatsapp : phone);

    if (photo) {
      formData.append("photo", photo);
    }

    if (cv) {
      formData.append("cv", cv);
    }

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
            <h3 className="text-lg font-semibold">Add New Teacher</h3>
            <button type="button" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="p-3 text-red-700 bg-red-100 rounded">{error}</div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium">
                Gender *
              </label>
              <select
                name="gender"
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="whatsapp-check"
                checked={isWhatsappDifferent}
                onChange={(e) => setIsWhatsappDifferent(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="whatsapp-check" className="ml-2 block text-sm">
                WhatsApp number is different
              </label>
            </div>
            {isWhatsappDifferent && (
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}
            <div>
              <label htmlFor="shift" className="block text-sm font-medium">
                Shift *
              </label>
              <select
                name="shift"
                id="shift"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                required
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select a shift</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Afternoon</option>
              </select>
            </div>
            <div>
              <label htmlFor="photo" className="block text-sm font-medium">
                Photo (JPG, PNG, etc. - Max 5MB)
              </label>
              {photoPreview && (
                <div className="mt-2 mb-2">
                  <img
                    src={photoPreview}
                    alt="Photo preview"
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                </div>
              )}
              <input
                type="file"
                name="photo"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
              {photo && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  ✓ Photo selected: {photo.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="cv" className="block text-sm font-medium">
                CV (PDF only - Max 10MB)
              </label>
              <input
                type="file"
                name="cv"
                id="cv"
                accept=".pdf"
                onChange={handleCVChange}
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
              {cv && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  ✓ CV selected: {cv.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 text-sm bg-white border rounded-md hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// --- Edit Teacher Modal Component ---
function EditTeacherModal({
  isOpen,
  onClose,
  teacher,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onUpdate: (teacherId: number, data: any) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [gender, setGender] = useState("");
  const [shift, setShift] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);
  const [cv, setCV] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacher) {
      setName(teacher.name);
      setEmail(teacher.email);
      setPhone(teacher.phone_number);
      // Assuming whatsapp might be same as phone if not in teacher object explicitly or handled differently
      setWhatsapp(teacher.phone_number);
      setGender(teacher.gender);
      setShift(teacher.shift);
      setPhotoPreview(teacher.profile_photo_url || null);
      setPhoto(null);
      setCV(null);
      setError(null);
    }
  }, [teacher, isOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Photo must be an image file");
      return;
    }
    if (file.size > 5242880) { // 5MB
      setError("Photo must be 5MB or smaller");
      return;
    }

    setPhoto(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("CV must be a PDF file");
      return;
    }
    if (file.size > 10485760) { // 10MB
      setError("CV must be 10MB or smaller");
      return;
    }
    setCV(file);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("gender", gender);
    formData.append("shift", shift);
    formData.append("phone_number", phone);
    formData.append("whatsapp_number", whatsapp);

    if (photo) formData.append("photo", photo);
    if (cv) formData.append("cv", cv);

    try {
      await onUpdate(teacher.id, formData);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold">Edit Teacher</h3>
            <button type="button" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {error && <div className="p-3 text-red-700 bg-red-100 rounded">{error}</div>}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)} required
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Shift */}
            <div>
              <label className="block text-sm font-medium">Shift</label>
              <select value={shift} onChange={e => setShift(e.target.value)} required
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Afternoon</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium">WhatsApp</label>
              <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>

            {/* Photo */}
            <div>
              <label className="block text-sm font-medium">Update Photo (Optional)</label>
              {photoPreview && (
                <div className="mt-2 mb-2">
                  <img src={photoPreview} alt="Preview" className="w-24 h-24 object-cover rounded-md border" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handlePhotoChange}
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>

            {/* CV */}
            <div>
              <label className="block text-sm font-medium">Update CV (Optional)</label>
              <input type="file" accept=".pdf" onChange={handleCVChange}
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              {cv && <p className="mt-1 text-sm text-green-600">New CV selected: {cv.name}</p>}
            </div>

          </div>
          <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
            <button type="button" onClick={onClose}
              className="px-4 py-2 mr-2 text-sm bg-white border rounded-md hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50">
              {isLoading ? "Updating..." : "Update Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function TeachersPage() {
  const user = useUser();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  // ...existing code...
  // Session/auth check removed; now handled in layout
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedTeacherPhoto, setSelectedTeacherPhoto] = useState<{
    url?: string;
    name: string;
  }>({ name: "" });
  const router = useRouter();

  const fetchTeachers = async () => {
    try {
      const teachersData = await apiFetch<Teacher[]>("/api/admin/teachers/");
      setTeachers(teachersData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await fetchTeachers();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSaveTeacher = async (teacherData: any) => {
    try {
      await apiFetch("/api/admin/teachers/", {
        method: "POST",
        body: teacherData,
      });
      setIsModalOpen(false);
      await fetchTeachers();
    } catch (err: any) {
      throw err;
    }
  };

  const handleUpdateTeacher = async (teacherId: number, teacherData: any) => {
    try {
      await apiFetch(`/api/admin/teachers/${teacherId}`, {
        method: "PATCH",
        body: teacherData,
      });
      await fetchTeachers(); // Refresh list
    } catch (err: any) {
      throw err;
    }
  };

  const openEditModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditModalOpen(true);
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) {
      return;
    }
    try {
      await apiFetch(`/api/admin/teachers/${teacherId}`, {
        method: "DELETE",
      });
      alert("Teacher deleted successfully.");
      setTeachers((currentTeachers) =>
        currentTeachers.filter((t) => t.id !== teacherId)
      );
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleShowPhoto = (teacher: Teacher) => {
    if (!teacher.profile_photo_url) {
      alert("No photo available for this teacher.");
      return;
    }
    setSelectedTeacherPhoto({
      url: teacher.profile_photo_url,
      name: teacher.name,
    });
    setPhotoModalOpen(true);
  };

  const handleShowCV = (teacher: Teacher) => {
    if (!teacher.cv_url) {
      alert("No CV available for this teacher.");
      return;
    }
    window.open(`${teacher.cv_url}`, "_blank");
  };

  if (isLoading) return <div className="p-10">Loading teachers...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 sm:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Teacher Management
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Add, view, and manage teachers.
          </p>
        </div>
        {user?.role === "supreme-admin" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary/90"
          >
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
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Gender
              </th>
              <th scope="col" className="px-6 py-3">
                Shift
              </th>
              <th scope="col" className="px-6 py-3">
                Phone
              </th>
              <th scope="col" className="px-6 py-3">
                Students
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr
                key={teacher.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="px-6 py-4 font-medium">{teacher.name}</td>
                <td className="px-6 py-4">{teacher.email}</td>
                <td className="px-6 py-4">{teacher.gender}</td>
                <td className="px-6 py-4">{teacher.shift}</td>
                <td className="px-6 py-4">{teacher.phone_number}</td>
                <td className="px-6 py-4">0</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {teacher.profile_photo_url && (
                      <button
                        onClick={() => handleShowPhoto(teacher)}
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                        title="View Photo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {teacher.cv_url && (
                      <button
                        onClick={() => handleShowCV(teacher)}
                        className="font-medium text-green-600 dark:text-green-500 hover:underline"
                        title="Download CV"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                    {user?.role === "supreme-admin" && (
                      <>
                        <button
                          onClick={() => openEditModal(teacher)}
                          className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline"
                          title="Edit Teacher"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(teacher.id)}
                          className="font-medium text-red-600 dark:text-red-500 hover:underline"
                          title="Delete Teacher"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
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
      <PhotoModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        photoUrl={selectedTeacherPhoto.url}
        teacherName={selectedTeacherPhoto.name}
      />
      <AddTeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTeacher}
      />
      <EditTeacherModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        teacher={selectedTeacher}
        onUpdate={handleUpdateTeacher}
      />
    </div>
  );
}
