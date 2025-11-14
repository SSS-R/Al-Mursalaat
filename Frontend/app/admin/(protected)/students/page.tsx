"use client";

import { useState, useMemo, useEffect, Suspense, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UserPlus, X, PlusCircle, Trash2 } from "lucide-react";

// --- Types (Corrected to match backend) ---
interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  preferred_course: string;
  status: string;
  teacher: { name: string } | null;
  teacher_id: number | null;
  country: string;
  state?: string;
  age: number;
  phone_number: string;
  parent_name: string;
  shift: string | null;
  gender: string;
}
interface Teacher {
  id: number;
  name: string;
}

// --- Add Student Modal ---
function AddStudentModal({
  isOpen,
  onClose,
  onSave,
  courses,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  courses: string[];
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    age: "",
    parentName: "",
    relationship_with_student: "",
    email: "",
    phone: "",
    whatsapp: "",
    country: "",
    state: "",
    course: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const finalData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone_number: formData.phone,
      country: formData.country,
      state: formData.state,
      preferred_course: formData.course,
      age: parseInt(formData.age),
      parent_name: formData.parentName,
      relationship_with_student: formData.relationship_with_student,
      gender: formData.gender,
      whatsapp_number: formData.whatsapp || formData.phone,
      previous_experience: "Admitted by admin",
      learning_goals: "Admitted by admin",
    };
    try {
      await onSave(finalData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold">Add New Student</h3>
            <button type="button" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium">
                Gender *
              </label>
              <select
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium">
                Age *
              </label>
              <input
                type="number"
                name="age"
                id="age"
                placeholder="Enter your age"
                min={1}
                value={formData.age}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="parentName" className="block text-sm font-medium">
                Parent's Name
              </label>
              <input
                type="text"
                name="parentName"
                id="parentName"
                placeholder="Mandatory if under 18"
                value={formData.parentName}
                onChange={handleChange}
                // required
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="relationship_with_student"
                className="block text-sm font-medium"
              >
                Relationship with Student
              </label>
              <input
                type="text"
                name="relationship_with_student"
                id="relationship_with_student"
                placeholder="Mandatory if under 18"
                value={formData.relationship_with_student}
                onChange={handleChange}
                // required
                className="mt-1 w-full p-2 border rounded-md"
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
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium">
                WhatsApp Number
              </label>
              <input
                type="tel"
                name="whatsapp"
                id="whatsapp"
                placeholder="Optional, if different"
                value={formData.whatsapp}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium">
                Country *
              </label>
              <input
                type="text"
                name="country"
                id="country"
                placeholder="Enter your country"
                value={formData.country}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium">
                State *
              </label>
              <input
                type="text"
                name="state"
                id="state"
                placeholder="Enter your state"
                value={formData.state}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="course" className="block text-sm font-medium">
                Preferred Course *
              </label>
              <select
                name="course"
                id="course"
                value={formData.course}
                onChange={handleChange}
                required
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end p-4 bg-gray-50 border-t sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 text-sm border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm text-white bg-primary rounded-md disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Manage Student Modal ---
function ManageStudentModal({
  student,
  teachers,
  isOpen,
  onClose,
  onSave,
}: {
  student: Student;
  teachers: Teacher[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [teacherId, setTeacherId] = useState<string>(
    student.teacher_id?.toString() || ""
  );
  const [shift, setShift] = useState<string>(student.shift || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!teacherId || !shift) {
      setError("Please select both a teacher and a shift.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onSave({ teacher_id: parseInt(teacherId), shift });
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
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">
              Manage Student: {`${student.first_name} ${student.last_name}`}
            </h3>
            <button type="button" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-red-700 bg-red-100 rounded">{error}</div>
            )}
            <p>
              <strong>Status:</strong> {student.status}
            </p>
            <p>
              <strong>Course:</strong> {student.preferred_course}
            </p>
            <div>
              <label htmlFor="teacher" className="block text-sm font-medium">
                Assign Teacher *
              </label>
              <select
                id="teacher"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="">Select a teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="shift" className="block text-sm font-medium">
                Assign Shift *
              </label>
              <select
                id="shift"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="">Select a shift</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end p-4 bg-gray-50 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 text-sm bg-white border rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Approve & Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MAIN STUDENTS PAGE COMPONENT WRAPPER ---
export default function StudentsPageWrapper() {
  return (
      <StudentsPage />
  );
}

// --- MAIN STUDENTS PAGE COMPONENT ---
function StudentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get("view") || "all";

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        fetch("/api/admin/students/", {
          credentials: "include",
        }),
        fetch("/api/admin/teachers/", {
          credentials: "include",
        }),
      ]);
      if (!studentsRes.ok) throw new Error("Failed to fetch students.");
      if (!teachersRes.ok) throw new Error("Failed to fetch teachers.");
      const studentsData = await studentsRes.json();
      const teachersData = await teachersRes.json();
      setStudents(studentsData);
      setTeachers(teachersData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveNewStudent = async (studentData: any) => {
    const response = await fetch("/api/admin/add-student/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(studentData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to add student.");
    }
    setIsAddModalOpen(false);
    await fetchData();
  };

  const handleUpdateStudent = async (assignmentData: {
    teacher_id: number;
    shift: string;
  }) => {
    if (!selectedStudent) return;
    const response = await fetch(
      `/api/admin/students/${selectedStudent.id}/assign`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(assignmentData),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to assign student.");
    }
    setSelectedStudent(null);
    await fetchData();
  };

  const filteredStudents = useMemo(() => {
    let currentStudents = students;

    if (view === "unassigned") {
      currentStudents = currentStudents.filter((s) => s.status === "Pending");
    } else {
      currentStudents = currentStudents.filter(
        (s) => s.status === "Approved" || s.status === "Finished"
      );
      currentStudents.sort((a, b) => {
        if (a.status === "Approved" && b.status !== "Approved") return -1;
        if (a.status !== "Approved" && b.status === "Approved") return 1;
        return 0;
      });
    }
    if (view === "unassigned" && countryFilter !== "all") {
      currentStudents = currentStudents.filter(
        (s) => s.country === countryFilter
      );
    }
    if (view === "all" && statusFilter !== "all") {
      currentStudents = currentStudents.filter(
        (s) => s.status === statusFilter
      );
    }
    if (courseFilter !== "all") {
      currentStudents = currentStudents.filter(
        (s) => s.preferred_course === courseFilter
      );
    }
    if (genderFilter !== "all") {
      currentStudents = currentStudents.filter(
        (s) => s.gender === genderFilter
      );
    }

    return currentStudents;
  }, [view, statusFilter, countryFilter, courseFilter, genderFilter, students]);

  const viewTitles: { [key: string]: string } = {
    all: "All Students",
    unassigned: "Unassigned Students",
  };
  const countries = [
    ...new Set(students.map((s) => s.country).filter(Boolean)),
  ];
  const courses = [
    "Quran Reading (Nazra)",
    "Quran Memorization",
    "Quran Learning (Kayda)",
    "Advanced Tajweed",
  ];

  if (isLoading) return <div className="p-10">Loading students...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

  return (
    <Suspense>
    <div className="p-6 sm:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{viewTitles[view]}</h1>
          <p className="text-gray-500">
            Manage students based on their status.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm text-white bg-primary rounded-lg shadow-sm hover:bg-primary/90"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div>
          <label htmlFor="courseFilter" className="block text-sm font-medium">
            Filter by Course
          </label>
          <select
            id="courseFilter"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 border rounded-md"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="genderFilter" className="block text-sm font-medium">
            Filter by Gender
          </label>
          <select
            id="genderFilter"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 border rounded-md"
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        {view === "all" && (
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium">
              Filter by Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 border rounded-md"
            >
              <option value="all">All</option>
              <option value="Approved">Approved</option>
              <option value="Finished">Finished</option>
            </select>
          </div>
        )}
        {view === "unassigned" && (
          <div>
            <label
              htmlFor="countryFilter"
              className="block text-sm font-medium"
            >
              Filter by Country
            </label>
            <select
              id="countryFilter"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 border rounded-md"
            >
              <option value="all">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Student Name</th>
              <th className="px-6 py-3">Age</th>
              <th className="px-6 py-3">Gender</th>
              <th className="px-6 py-3">Parent Name</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Country</th>
              <th className="px-6 py-3">State</th>
              <th className="px-6 py-3">Course</th>
              <th className="px-6 py-3">Shift</th>
              <th className="px-6 py-3">Assigned Teacher</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium whitespace-nowrap">
                  {`${student.first_name} ${student.last_name}`}
                  <p className="text-xs text-gray-500">{student.email}</p>
                </td>
                <td className="px-6 py-4">{student.age}</td>
                <td className="px-6 py-4">{student.gender}</td>
                <td className="px-6 py-4">{student.parent_name}</td>
                <td className="px-6 py-4">{student.phone_number}</td>
                <td className="px-6 py-4">{student.country}</td>
                <td className="px-6 py-4">{student.state || "N/A"}</td>
                <td className="px-6 py-4">{student.preferred_course}</td>
                <td className="px-6 py-4">{student.shift || "N/A"}</td>
                <td className="px-6 py-4">{student.teacher?.name || "N/A"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      student.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : student.status === "Finished"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="font-medium text-primary hover:underline"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="text-center p-8">
            No students match the current filters.
          </div>
        )}
      </div>

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewStudent}
        courses={courses}
      />
      {selectedStudent && (
        <ManageStudentModal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
          teachers={teachers}
          onSave={handleUpdateStudent}
        />
      )}
    </div>
    </Suspense>
  );
}
