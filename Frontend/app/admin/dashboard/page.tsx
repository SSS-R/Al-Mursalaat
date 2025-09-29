"use client";

import { useState } from 'react';
import {
  Users, Home, BookOpen, UserPlus, LogOut, ChevronDown,
  X, Shield, PlusCircle // Added Shield for the 'Admins' icon
} from 'lucide-react';
import Link from 'next/link';

// --- MOCK DATA (Placeholders until backend is ready) ---
const mockStudents = [
  { id: 1, name: 'Sultan Rafi', email: 'sultan.official@example.com', course: 'Quran Reading (Nazra)', status: 'Pending', assignedTeacher: null, classTime: null },
  { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com', course: 'Quran Memorization', status: 'Approved', assignedTeacher: 'Fatima Al-Zahra', classTime: 'Mon 5:00 PM' },
  { id: 3, name: 'John Smith', email: 'john.smith@example.com', course: 'Quran Learning (Kayda)', status: 'Pending', assignedTeacher: null, classTime: null },
  { id: 4, name: 'Aisha Ahmed', email: 'aisha.ahmed@example.com', course: 'Quran Reading (Nazra)', status: 'Approved', assignedTeacher: 'Abdullah Rahman', classTime: 'Wed 7:30 PM' },
];

const mockTeachers = [
  { id: 1, name: 'Abdullah Rahman' },
  { id: 2, name: 'Fatima Al-Zahra' },
  { id: 3, name: 'Muhammad Hassan' },
];
// --- END MOCK DATA ---


// --- MODAL COMPONENT (No changes here) ---
function ManageStudentModal({ student, onClose, onSave }: { student: any; onClose: () => void; onSave: (data: any) => void; }) {
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
  const [students, setStudents] = useState(mockStudents);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false); // State for the dropdown

  const handleManageClick = (student: any) => {
    setSelectedStudent(student);
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
  };
  
  const handleSaveChanges = (data: any) => {
    console.log("Data to save to backend:", data);
  };

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
          
          {/* --- Students Dropdown --- */}
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
                <a href="#" className="block px-4 py-2 text-sm text-gray-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white">
                  All Students
                </a>
                <a href="#" className="block px-4 py-2 mt-1 text-sm text-gray-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white">
                  Unassigned Students
                </a>
              </div>
            )}
          </div>

          <a href="#" className="mt-2 flex items-center px-4 py-3 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white rounded-lg">
            <BookOpen className="w-5 h-5" />
            <span className="mx-4 font-medium">Teachers</span>
          </a>

          {/* --- New Admins Link --- */}
          <a href="#" className="mt-2 flex items-center px-4 py-3 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white rounded-lg">
            <Shield className="w-5 h-5" />
            <span className="mx-4 font-medium">Admins</span>
          </a>

        </nav>
        <div className="absolute bottom-0 w-64 p-6 border-t dark:border-gray-700">
          <a href="#" className="flex items-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white -mx-2 px-2 py-2 rounded-lg">
            <LogOut className="w-5 h-5" />
            <span className="mx-4 font-medium">Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content (No changes here yet) */}
      <main className="flex-1 p-6 sm:p-10">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Student Applications</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage new and existing student applications.</p>
            </div>
            <div className="flex items-center space-x-4">
                <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary/90">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add Student
                </button>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg shadow-sm hover:bg-secondary/90">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add Teacher
                </button>
            </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Student Name</th>
                <th scope="col" className="px-6 py-3">Course</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Assigned Teacher</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
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
    </div>
  );
}