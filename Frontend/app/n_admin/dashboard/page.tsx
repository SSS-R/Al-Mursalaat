// File: Frontend/app/n_admin/dashboard/page.tsx
"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import { ChevronDown, PlusCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Types (Corrected to match backend schemas) ---
interface Student {
  id: number;
  first_name: string;
  last_name: string;
  preferred_course: string; // This matches your 'Application' schema
}
interface Schedule {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  student_id: number;
  zoom_link: string | null;
}
interface Teacher {
  id: number;
  name: string;
  email: string;
  shift: string;
  gender: string;
  students: Student[];
  schedules: Schedule[];
}
interface AttendanceRecord {
  student_id: number;
  status: string;
}

// --- Add Schedule Modal Component ---
function AddScheduleModal({
  isOpen,
  onClose,
  onSave,
  teacher,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  teacher: Teacher;
}) {
  const [studentId, setStudentId] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
  ]);
  const [startTime, setStartTime] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out students who are already scheduled
  const unscheduledStudents = useMemo(() => {
    const scheduledStudentIds = new Set(
      teacher.schedules.map((s) => s.student_id)
    );
    return teacher.students.filter((s) => !scheduledStudentIds.has(s.id));
  }, [teacher]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!studentId || !startTime) {
      setError("Please select a student and a start time.");
      return;
    }
    if (selectedDays.length === 0) {
      setError("Please select at least one day.");
      return;
    }
    setIsLoading(true);
    setError(null);

    // Automatically set end time to be 1 hour after start time
    const [hours, minutes] = startTime.split(":").map(Number);
    const endDate = new Date();
    endDate.setHours(hours + 1, minutes, 0);
    const endTime = endDate.toTimeString().substring(0, 5);

    // Create a schedule with comma-separated days
    const scheduleData = {
      student_id: parseInt(studentId),
      teacher_id: teacher.id,
      day_of_week: selectedDays.join(","),
      start_time: startTime,
      end_time: endTime,
      zoom_link: zoomLink || null,
    };
    try {
      await onSave(scheduleData);
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
            <h3 className="text-lg font-semibold">
              Add Schedule for {teacher.name}
            </h3>
            <button type="button" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-red-700 bg-red-100 rounded">{error}</div>
            )}
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium">
                Student *
              </label>
              <select
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="">Select an unscheduled student</option>
                {unscheduledStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} ({s.preferred_course})
                  </option>
                ))}
              </select>
              {unscheduledStudents.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  All of this teacher's students are scheduled.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Days of the Week *
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-2 border rounded-md text-sm transition-colors ${
                      selectedDays.includes(day)
                        ? "bg-primary text-white border-primary"
                        : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
              {selectedDays.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Please select at least one day.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium">
                Class Start Time *
              </label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="zoomLink" className="block text-sm font-medium">
                Zoom Link (Optional)
              </label>
              <input
                type="url"
                id="zoomLink"
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
          </div>
          <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
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
              {isLoading ? "Saving..." : "Save Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Schedule Table Component ---
function ScheduleTable({
  teacher,
  onAddSchedule,
}: {
  teacher: Teacher;
  onAddSchedule: () => void;
}) {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const schedulesByDay = useMemo(() => {
    const group: { [key: string]: Schedule[] } = {};
    teacher.schedules.forEach((schedule) => {
      // Handle comma-separated days
      const days = schedule.day_of_week.split(",").map((d) => d.trim());
      days.forEach((day) => {
        if (!group[day]) {
          group[day] = [];
        }
        group[day].push(schedule);
      });
    });
    for (const day in group) {
      group[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return group;
  }, [teacher.schedules]);

  const findStudentName = (studentId: number) => {
    const student = teacher.students.find((s) => s.id === studentId);
    return student
      ? `${student.first_name} ${student.last_name}`
      : "Unknown Student";
  };

  return (
    <div className="border-t dark:border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">Weekly Class Schedule</h4>
        <button
          onClick={onAddSchedule}
          className="flex items-center text-sm text-primary hover:underline"
        >
          <PlusCircle className="w-4 h-4 mr-1" />
          Add Schedule
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              {daysOfWeek.map((day) => (
                <th key={day} className="px-4 py-2 border-r">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="align-top">
            <tr>
              {daysOfWeek.map((day) => (
                <td key={day} className="border-r p-2 space-y-1">
                  {(schedulesByDay[day] || []).map((schedule) => (
                    <div
                      key={schedule.id}
                      className="bg-primary/10 p-2 rounded-md text-xs"
                    >
                      <p className="font-bold">{`${schedule.start_time.substring(
                        0,
                        5
                      )} - ${schedule.end_time.substring(0, 5)}`}</p>
                      <p>{findStudentName(schedule.student_id)}</p>
                    </div>
                  ))}
                  {(!schedulesByDay[day] ||
                    schedulesByDay[day].length === 0) && (
                    <p className="text-xs text-gray-400 italic p-1">
                      No classes
                    </p>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Main Dashboard Component ---
export default function NormalAdminDashboard() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openTeacherId, setOpenTeacherId] = useState<number | null>(null);
  const [shiftFilter, setShiftFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Default");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [existingAttendance, setExistingAttendance] = useState<
    AttendanceRecord[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for the new Add Schedule Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/admin/teachers/", {
        credentials: "include",
      });
      if (!response.ok)
        throw new Error("Failed to fetch teachers. Please log in again.");
      const data: Teacher[] = await response.json();
      setTeachers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!openTeacherId || !selectedDate) return;

    const fetchAttendance = async () => {
      const response = await fetch(
        `http://localhost:8000/admin/attendance/?teacher_id=${openTeacherId}&class_date=${selectedDate}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data: AttendanceRecord[] = await response.json();
        setExistingAttendance(data);
        const initialAttendance = data.reduce((acc, record) => {
          acc[record.student_id] = record.status;
          return acc;
        }, {} as Record<number, string>);
        setAttendance(initialAttendance);
      }
    };
    fetchAttendance();
  }, [openTeacherId, selectedDate]);

  const sortedAndFilteredTeachers = useMemo(() => {
    let processedTeachers = [...teachers];
    if (shiftFilter !== "All") {
      processedTeachers = processedTeachers.filter(
        (t) => t.shift === shiftFilter
      );
    }
    if (sortBy === "Most Students") {
      processedTeachers = processedTeachers.sort(
        (a, b) => (b.students?.length || 0) - (a.students?.length || 0)
      );
    } else if (sortBy === "Name") {
      processedTeachers.sort((a, b) => a.name.localeCompare(b.name));
    }
    return processedTeachers;
  }, [teachers, shiftFilter, sortBy]);

  const handleToggle = (teacherId: number) => {
    setOpenTeacherId((currentId) =>
      currentId === teacherId ? null : teacherId
    );
  };

  const handleStatusChange = (studentId: number, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async (
    teacherId: number,
    students: Student[]
  ) => {
    setIsSubmitting(true);
    const recordsToSave = students
      .filter(
        (student) =>
          attendance[student.id] &&
          !existingAttendance.find((rec) => rec.student_id === student.id)
      )
      .map((student) => ({
        class_date: selectedDate,
        status: attendance[student.id],
        student_id: student.id,
        teacher_id: teacherId,
      }));

    if (recordsToSave.length === 0) {
      alert("No new attendance to save.");
      setIsSubmitting(false);
      return;
    }

    try {
      await Promise.all(
        recordsToSave.map((record) =>
          fetch("http://localhost:8000/admin/attendance/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(record),
          }).then((res) => {
            if (!res.ok)
              throw new Error(
                `Failed to save attendance for student ID ${record.student_id}`
              );
          })
        )
      );
      alert("Attendance saved successfully!");
      const response = await fetch(
        `http://localhost:8000/admin/attendance/?teacher_id=${teacherId}&class_date=${selectedDate}`,
        { credentials: "include" }
      );
      const data = await response.json();
      setExistingAttendance(data);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddScheduleClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (scheduleData: any) => {
    const response = await fetch("http://localhost:8000/admin/schedules/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(scheduleData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to save schedule.");
    }
    setIsScheduleModalOpen(false);
    await fetchData(); // Re-fetch all data to show the new schedule
  };

  if (isLoading) return <div className="p-10">Loading teacher data...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="p-6 sm:p-10">
      <div>
        <h1 className="text-3xl font-bold">Teacher & Student Management</h1>
        <p className="mt-2 text-gray-500">
          View and manage assigned teachers and their students.
        </p>
      </div>

      <div className="mt-6 flex items-center space-x-4">
        <div>
          <label htmlFor="shiftFilter" className="block text-sm font-medium">
            Filter by Shift
          </label>
          <select
            id="shiftFilter"
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 border rounded-md"
          >
            <option value="All">All Shifts</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </div>
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium">
            Sort By
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 border rounded-md"
          >
            <option value="Default">Default</option>
            <option value="Name">Name</option>
            <option value="Most Students">Most Students</option>
          </select>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {(sortedAndFilteredTeachers || []).map((teacher) => {
          const isExpanded = openTeacherId === teacher.id;
          return (
            <div
              key={teacher.id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg"
            >
              <button
                onClick={() => handleToggle(teacher.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div>
                  <p className="font-semibold">
                    {teacher.name}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      ({teacher.gender})
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {teacher.email} - {teacher.shift} Shift
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Students: {teacher.students.length}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <>
                  <ScheduleTable
                    teacher={teacher}
                    onAddSchedule={() => handleAddScheduleClick(teacher)}
                  />
                  <div className="border-t dark:border-gray-700 p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <label htmlFor="class-date" className="font-semibold">
                        Mark Attendance for:
                      </label>
                      <input
                        type="date"
                        id="class-date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="p-2 border rounded-md"
                      />
                    </div>

                    {teacher.students.length > 0 ? (
                      <div className="space-y-2">
                        {teacher.students.map((student) => {
                          const isMarked = existingAttendance.some(
                            (rec) => rec.student_id === student.id
                          );
                          return (
                            <div
                              key={student.id}
                              className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700"
                            >
                              <span>
                                {student.first_name} {student.last_name}
                              </span>
                              <div className="flex items-center space-x-4 text-sm">
                                {["Present", "Absent", "Late"].map((status) => (
                                  <label
                                    key={status}
                                    className="flex items-center space-x-1"
                                  >
                                    <input
                                      type="radio"
                                      name={`attendance-${student.id}`}
                                      value={status}
                                      checked={
                                        attendance[student.id] === status
                                      }
                                      onChange={() =>
                                        handleStatusChange(student.id, status)
                                      }
                                      disabled={isMarked}
                                      className="disabled:opacity-50"
                                    />
                                    <span>{status}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                        <div className="flex justify-end pt-4">
                          <button
                            onClick={() =>
                              handleSaveAttendance(teacher.id, teacher.students)
                            }
                            disabled={
                              isSubmitting ||
                              existingAttendance.length ===
                                teacher.students.length
                            }
                            className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? "Saving..." : "Save Attendance"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No students are assigned to this teacher.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
        {(!sortedAndFilteredTeachers ||
          sortedAndFilteredTeachers.length === 0) && (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-500 dark:text-gray-400">
              No teachers match the current filters.
            </p>
          </div>
        )}
      </div>

      {/* Render the new modal */}
      {selectedTeacher && (
        <AddScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSave={handleSaveSchedule}
          teacher={selectedTeacher}
        />
      )}
    </div>
  );
}
