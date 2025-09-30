"use client";

import { useState, useMemo, FormEvent, useEffect } from 'react'; // Added FormEvent
import {
  Users, Home, BookOpen, UserPlus, LogOut, ChevronDown,
  X, Shield, PlusCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define a type for our user data for better TypeScript support
type User = {
  email: string;
  role: 'supreme-admin' | 'admin';
};

// --- MOCK DATA ---
const mockStudents = [
  { id: 1, name: 'Sultan Rafi', email: 'sultan.official@example.com', course: 'Quran Reading (Nazra)', status: 'Pending', assignedTeacher: null, classTime: null, country: 'Bangladesh' },
  { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com', course: 'Quran Memorization', status: 'Approved', assignedTeacher: 'Fatima Al-Zahra', classTime: 'Mon 5:00 PM', country: 'USA' },
  { id: 3, name: 'John Smith', email: 'john.smith@example.com', course: 'Quran Learning (Kayda)', status: 'Pending', assignedTeacher: null, classTime: null, country: 'UK' },
  { id: 4, name: 'Aisha Ahmed', email: 'aisha.ahmed@example.com', course: 'Quran Reading (Nazra)', status: 'Approved', assignedTeacher: 'Abdullah Rahman', classTime: 'Wed 7:30 PM', country: 'Canada' },
];

const mockTeachers = [
  { id: 1, name: 'Abdullah Rahman' },
  { id: 2, name: 'Fatima Al-Zahra' },
  { id: 3, name: 'Muhammad Hassan' },
];

const availableCourses = [...new Set(mockStudents.map(s => s.course))];
// --- END MOCK DATA ---


// --- NEW ADD STUDENT MODAL COMPONENT ---
function AddStudentModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void; }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    age: '',
    parentName: '',
    relationship: '',
    email: '',
    phone: '',
    whatsapp: '',
    country: '',
    course: '',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Here we'll add the auto-filled fields
    const finalData = {
      ...formData,
      previousExperience: "Admitted by admin",
      learningGoals: "Admitted by admin",
    };
    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Student</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Form Fields */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name *</label>
              <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name *</label>
              <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender *</label>
              <select name="gender" id="gender" value={formData.gender} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age *</label>
              <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div>
              <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parent's Name *</label>
              <input type="text" name="parentName" id="parentName" placeholder="If self, type 'self'" value={formData.parentName} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Relationship with Student *</label>
              <input type="text" name="relationship" id="relationship" placeholder="If self, type 'self'" value={formData.relationship} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address *</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number *</label>
              <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp Number</label>
              <input type="tel" name="whatsapp" id="whatsapp" placeholder="Optional, if different" value={formData.whatsapp} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country *</label>
              <input type="text" name="country" id="country" value={formData.country} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Course *</label>
              <select name="course" id="course" value={formData.course} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                <option value="">Select a course</option>
                {availableCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 sticky bottom-0">
            <button type="button" onClick={onClose} className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90">
              Save Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// --- MANAGE STUDENT MODAL COMPONENT (Unchanged) ---
function ManageStudentModal({ student, onClose, onSave }: { student: any; onClose: () => void; onSave: (data: any) => void; }) {
  // ... (This component remains the same)
  const [assignedTeacherId, setAssignedTeacherId] = useState(student.assignedTeacher || '');
  const [classTime, setClassTime] = useState(student.classTime || '');

  const handleSave = () => {
    console.log('Saving:', { studentId: student.id, teacherId: assignedTeacherId, time: classTime });
    onSave({ studentId: student.id, teacherId: assignedTeacherId, time: classTime });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Student: {student.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p><strong className="dark:text-gray-300">Email:</strong> {student.email}</p>
            <p><strong className="dark:text-gray-300">Course:</strong> {student.course}</p>
          </div>
          <hr className="dark:border-gray-700"/>
          <div>
            <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign Teacher</label>
            <select
              id="teacher"
              value={assignedTeacherId}
              onChange={(e) => setAssignedTeacherId(e.target.value)}
              className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select a teacher</option>
              {mockTeachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="classTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Set Class Time</label>
            <input
              type="text"
              id="classTime"
              value={classTime}
              onChange={(e) => setClassTime(e.target.value)}
              placeholder="e.g., Mon 5:00 PM"
              className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}


// --- MAIN DASHBOARD COMPONENT ---
export default function AdminDashboardPage() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null); // State to hold user data
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const router = useRouter();

// --- NEW: Fetch user data on page load ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          // If not authenticated, redirect to login
          router.push('/admin/login');
          return;
        }
        const userData: User = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State for the new modal
  const [isStudentsOpen, setIsStudentsOpen] = useState(true);
  const [studentView, setStudentView] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');

  const handleManageClick = (student: any) => setSelectedStudent(student);
  const handleCloseModal = () => setSelectedStudent(null);
  const handleSaveChanges = (data: any) => console.log("Data to save to backend:", data);

const handleSaveNewStudent = async (newStudentData: any) => {
    try {
      // Send the data to your FastAPI backend
      const response = await fetch('http://localhost:8000/admin/add-student/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // This is required to send the session cookie for authentication
        credentials: 'include',
        body: JSON.stringify(newStudentData),
      });

      if (response.ok) {
        alert('Student added successfully!');
        setIsAddModalOpen(false); // Close the modal
        router.refresh(); // Refresh the data on the page
      } else {
        // Handle errors from the backend
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || 'Failed to add student.'}`);
      }
    } catch (error) {
      console.error('Network or fetch error:', error);
      alert('A network error occurred. Please check your connection and try again.');
    }
};
  
  // ... (filteredStudents useMemo and viewTitles remain the same)
  const filteredStudents = useMemo(() => {
    return mockStudents
      .filter(student => {
        if (studentView === 'unassigned') return !student.assignedTeacher;
        return student.status === 'Approved';
      })
      .filter(student => {
        if (countryFilter === 'all') return true;
        return student.country === countryFilter;
      })
      .filter(student => {
        if (courseFilter === 'all') return true;
        return student.course === courseFilter;
      });
  }, [studentView, countryFilter, courseFilter]);

  const viewTitles: { [key: string]: string } = {
    all: 'All Students',
    unassigned: 'Unassigned Students',
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
        </div>
        <nav className="mt-6 px-4">
          <a href="#" className="flex items-center px-4 py-3 text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg">
            <Home className="w-5 h-5" />
            <span className="mx-4 font-medium">Dashboard</span>
          </a>
          
          <div className="mt-2">
            <button 
              onClick={() => setIsStudentsOpen(!isStudentsOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white rounded-lg"
            >
              <div className="flex items-center">
                <Users className="w-5 h-5" />
                <span className="mx-4 font-medium">Students</span>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${isStudentsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isStudentsOpen && (
              <div className="py-2 pl-8 pr-4">
                <button 
                  onClick={() => setStudentView('all')} 
                  className={`w-full text-left block px-4 py-2 mt-1 text-sm rounded-lg ${studentView === 'all' ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white'}`}
                >
                  All Students
                </button>
                <button 
                  onClick={() => setStudentView('unassigned')}
                  className={`w-full text-left block px-4 py-2 mt-1 text-sm rounded-lg ${studentView === 'unassigned' ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white'}`}
                >
                  Unassigned Students
                </button>
              </div>
            )}
          </div>

          <a href="#" className="mt-2 flex items-center px-4 py-3 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white rounded-lg">
            <BookOpen className="w-5 h-5" />
            <span className="mx-4 font-medium">Teachers</span>
          </a>

          {/* --- CONDITIONALLY RENDERED ADMINS LINK --- */}
          {user?.role === 'supreme-admin' && (
            <a href="#" className="mt-2 flex items-center px-4 py-3 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white rounded-lg">
              <Shield className="w-5 h-5" />
              <span className="mx-4 font-medium">Admins</span>
            </a>
          )}

        </nav>
        <div className="absolute bottom-0 w-64 p-6 border-t dark:border-gray-700">
          <a href="#" className="flex items-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white -mx-2 px-2 py-2 rounded-lg">
            <LogOut className="w-5 h-5" />
            <span className="mx-4 font-medium">Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{viewTitles[studentView]}</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage new and existing student applications.</p>
            </div>
            <div className="flex items-center space-x-4">
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary/90">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add Student
                </button>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg shadow-sm hover:bg-secondary/90">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add Teacher
                </button>
            </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 flex items-center space-x-4">
            <div>
                <label htmlFor="countryFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Country</label>
                <select
                    id="countryFilter"
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="all">All Countries</option>
                    {[...new Set(mockStudents.map(s => s.country))].map(country => (
                        <option key={country} value={country}>{country}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="courseFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Course</label>
                <select
                    id="courseFilter"
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="all">All Courses</option>
                    {[...new Set(mockStudents.map(s => s.course))].map(course => (
                        <option key={course} value={course}>{course}</option>
                    ))}
                </select>
            </div>
        </div>


        <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Student Name</th>
                <th scope="col" className="px-6 py-3">Course</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Country</th>
                <th scope="col" className="px-6 py-3">Assigned Teacher</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {student.name}
                    <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                  </td>
                  <td className="px-6 py-4">{student.course}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      student.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{student.country}</td>
                  <td className="px-6 py-4">{student.assignedTeacher || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleManageClick(student)} className="font-medium text-primary hover:underline">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Render */}
      {selectedStudent && (
        <ManageStudentModal
          student={selectedStudent}
          onClose={handleCloseModal}
          onSave={handleSaveChanges}
        />
      )}
      
      {/* New Modal Render */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewStudent}
      />
    </div>
  );
}