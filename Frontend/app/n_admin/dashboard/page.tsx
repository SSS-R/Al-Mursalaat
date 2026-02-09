"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import {
  ChevronDown,
  PlusCircle,
  X,
  Video,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

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
interface SessionAttendance {
  id: number;
  schedule_id: number;
  class_date: string;
  teacher_status: string;
  status: string; // student status
}
interface AttendanceCount {
  teacher_by_course: {
    [course: string]: {
      Present?: number;
      Absent?: number;
      Late?: number;
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

  // Allow adding multiple schedules for the same student (Flexible Scheduling)
  const availableStudents = useMemo(() => {
    return teacher.students;
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

    try {
      // Create a SEPARATE schedule record for EACH day
      // This allows individual day editing/deletion
      for (const day of selectedDays) {
        const scheduleData = {
          student_id: parseInt(studentId),
          teacher_id: teacher.id,
          day_of_week: day, // Single day, not comma-separated
          start_time: startTime,
          end_time: endTime,
          zoom_link: zoomLink || null,
        };
        await onSave(scheduleData);
      }
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
                <option value="">Select a student</option>
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} ({s.preferred_course})
                  </option>
                ))}
              </select>
              {availableStudents.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No students assigned to this teacher yet.
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
                    className={`px-3 py-2 border rounded-md text-sm transition-colors ${selectedDays.includes(day)
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

// --- Time Edit Modal Component (for quick time adjustments on individual days) ---
function TimeEditModal({
  isOpen,
  onClose,
  onSave,
  schedule,
  studentName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheduleId: number, startTime: string, endTime: string) => Promise<void>;
  schedule: Schedule | null;
  studentName: string;
}) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (schedule) {
      // Extract time from the schedule (format: "HH:MM:SS" -> "HH:MM")
      setStartTime(schedule.start_time.substring(0, 5));
      setEndTime(schedule.end_time.substring(0, 5));
      setError(null);
    }
  }, [schedule, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!schedule) return;

    if (!startTime || !endTime) {
      setError("Please enter both start and end times.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(schedule.id, startTime, endTime);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update time.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !schedule) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-sm w-full">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Edit Time
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {studentName} - {schedule.day_of_week}
              </p>
            </div>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {error && (
              <div className="p-3 text-red-700 bg-red-100 rounded dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="editStartTime" className="block text-sm font-medium">
                Start Time *
              </label>
              <input
                type="time"
                id="editStartTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label htmlFor="editEndTime" className="block text-sm font-medium">
                End Time *
              </label>
              <input
                type="time"
                id="editEndTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-white dark:bg-gray-700 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Update Time"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Session Attendance Modal Component ---
function SessionAttendanceModal({
  isOpen,
  onClose,
  onSave,
  onUpdateSchedule,
  schedule,
  classDate,
  student,
  teacher_id,
  teacher,
  existingAttendance,
  selectedMonth,
  onAttendanceUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  onUpdateSchedule: (scheduleId: number, data: any) => Promise<void>;
  schedule: Schedule | null;
  classDate: string;
  student: Student | null;
  teacher_id: number | null;
  teacher: Teacher | null;
  existingAttendance?: SessionAttendance | null;
  selectedMonth?: string;
  onAttendanceUpdated?: (classDate: string) => Promise<void>;
}) {
  const [teacherStatus, setTeacherStatus] = useState("Present");
  const [studentStatus, setStudentStatus] = useState("Present");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditAttendanceMode, setIsEditAttendanceMode] = useState(false);

  // Schedule edit fields
  const [editSelectedDays, setEditSelectedDays] = useState<string[]>([]);
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editZoomLink, setEditZoomLink] = useState("");
  const [editStudentId, setEditStudentId] = useState<number | null>(null);

  // Check if attendance already exists
  const hasExistingAttendance = !!existingAttendance;
  const isReadOnly = hasExistingAttendance && !isEditAttendanceMode;

  // Update states when existingAttendance or schedule changes
  useEffect(() => {
    if (existingAttendance) {
      setTeacherStatus(existingAttendance.teacher_status || "Present");
      setStudentStatus(existingAttendance.status);
    } else {
      setTeacherStatus("Present");
      setStudentStatus("Present");
    }
    setIsEditMode(false);
  }, [existingAttendance]);

  // Initialize schedule edit fields when entering edit mode
  useEffect(() => {
    if (isEditMode && schedule) {
      const days = schedule.day_of_week.split(",").map((d) => d.trim());
      setEditSelectedDays(days);
      setEditStartTime(schedule.start_time.substring(0, 5));
      setEditEndTime(schedule.end_time.substring(0, 5));
      setEditZoomLink(schedule.zoom_link || "");
      setEditStudentId(schedule.student_id);
    }
  }, [isEditMode, schedule]);

  const toggleEditDay = (day: string) => {
    setEditSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!schedule || !student || !teacher_id) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        // Update schedule
        if (editSelectedDays.length === 0) {
          setError("Please select at least one day.");
          setIsLoading(false);
          return;
        }
        await onUpdateSchedule(schedule.id, {
          day_of_week: editSelectedDays.join(","),
          start_time: editStartTime,
          end_time: editEndTime,
          zoom_link: editZoomLink || null,
          student_id: editStudentId,
          teacher_id: teacher_id,
        });
        setIsEditMode(false);
      } else if (isEditAttendanceMode && existingAttendance) {
        // Update existing attendance
        await apiFetch(`/api/admin/session-attendance/${existingAttendance.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            teacher_status: teacherStatus,
            status: studentStatus,
          }),
        });

        alert("Attendance updated successfully!");
        setIsEditAttendanceMode(false);

        // Refresh attendance count if callback is provided
        if (onAttendanceUpdated && selectedMonth) {
          const attendanceMonth = classDate.slice(0, 7); // Extract YYYY-MM
          if (attendanceMonth === selectedMonth) {
            await onAttendanceUpdated(classDate);
          }
        }

        onClose();
      } else if (!hasExistingAttendance) {
        // Create new attendance
        const attendanceData = {
          schedule_id: schedule.id,
          class_date: classDate,
          teacher_status: teacherStatus,
          status: studentStatus,
          student_id: student.id,
          teacher_id: teacher_id,
        };
        await onSave(attendanceData);
        setTeacherStatus("Present");
        setStudentStatus("Present");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsEditMode(false);
    setIsEditAttendanceMode(false);
    onClose();
  };

  if (!isOpen || !schedule || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold">
              {isEditMode
                ? "Edit Schedule"
                : isEditAttendanceMode
                  ? "Edit Attendance"
                  : isReadOnly
                    ? "View Session"
                    : "Mark Session Attendance"}
            </h3>
            <button type="button" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-red-700 bg-red-100 rounded">{error}</div>
            )}

            {isEditMode ? (
              // Schedule Edit Form
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Student
                  </label>
                  <select
                    value={editStudentId || ""}
                    onChange={(e) => setEditStudentId(parseInt(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  >
                    {teacher?.students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} ({s.preferred_course})
                      </option>
                    ))}
                  </select>
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
                        onClick={() => toggleEditDay(day)}
                        className={`px-3 py-2 border rounded-md text-sm transition-colors ${editSelectedDays.includes(day)
                          ? "bg-primary text-white border-primary"
                          : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      required
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      required
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Zoom Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={editZoomLink}
                    onChange={(e) => setEditZoomLink(e.target.value)}
                    placeholder="https://zoom.us/j/..."
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </>
            ) : (
              // Attendance View/Mark Form
              <>
                {isReadOnly && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-700 dark:text-blue-300">
                    ⚠️ This attendance has already been recorded. You can edit it below or modify the schedule.
                  </div>
                )}
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="text-sm font-semibold">
                    {student.first_name} {student.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {schedule.start_time} - {schedule.end_time}
                  </p>
                  <p className="text-xs text-gray-500">Date: {classDate}</p>
                  {schedule.zoom_link && (
                    <a
                      href={schedule.zoom_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Zoom Link
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Teacher Attendance *
                  </label>
                  <div className="flex gap-2">
                    {["Present", "Absent", "Late"].map((status) => (
                      <label
                        key={`teacher-${status}`}
                        className="flex items-center space-x-1"
                      >
                        <input
                          type="radio"
                          name="teacher-status"
                          value={status}
                          checked={teacherStatus === status}
                          onChange={() => setTeacherStatus(status)}
                          disabled={isReadOnly && !isEditAttendanceMode}
                          className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Student Attendance *
                  </label>
                  <div className="flex gap-2">
                    {["Present", "Absent", "Late"].map((status) => (
                      <label
                        key={`student-${status}`}
                        className="flex items-center space-x-1"
                      >
                        <input
                          type="radio"
                          name="student-status"
                          value={status}
                          checked={studentStatus === status}
                          onChange={() => setStudentStatus(status)}
                          disabled={isReadOnly && !isEditAttendanceMode}
                          className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 gap-2 flex-wrap">
            {(isEditMode || isEditAttendanceMode) && (
              <button
                type="button"
                onClick={() => {
                  setIsEditMode(false);
                  setIsEditAttendanceMode(false);
                }}
                className="px-4 py-2 text-sm bg-white border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
            )}
            {!isEditMode && !isEditAttendanceMode && (
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm bg-white border rounded-md hover:bg-gray-100"
              >
                Close
              </button>
            )}
            {isReadOnly && !isEditAttendanceMode && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditAttendanceMode(true)}
                  className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Edit Attendance
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Edit Schedule
                </button>
              </>
            )}
            {!hasExistingAttendance && !isEditMode && !isEditAttendanceMode && (
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Edit Schedule
              </button>
            )}
            {!isReadOnly && !isEditMode && !isEditAttendanceMode && (
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Attendance"}
              </button>
            )}
            {isEditMode && (
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? "Updating..." : "Update Schedule"}
              </button>
            )}
            {isEditAttendanceMode && (
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Attendance"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Weekly Calendar Component ---
function WeeklyCalendar({
  teacher,
  onAddSchedule,
  onSessionClick,
  onEditTime,
  onDeleteSchedule,
}: {
  teacher: Teacher;
  onAddSchedule: () => void;
  onSessionClick: (schedule: Schedule, date: string, student: Student) => void;
  onEditTime: (schedule: Schedule, student: Student) => void;
  onDeleteSchedule: (scheduleId: number, studentName: string, dayOfWeek: string, time: string) => void;
}) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Get the start of the week (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentDate);
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Generate dates for the week
  const weekDates = daysOfWeek.map((_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });

  // Get schedules for each day
  const schedulesByDate = useMemo(() => {
    const group: {
      [key: string]: Array<{
        schedule: Schedule;
        date: string;
        student: Student;
      }>;
    } = {};

    weekDates.forEach((date) => {
      const dateStr = date.toISOString().split("T")[0];
      const dayName = daysOfWeek[date.getDay()];
      group[dateStr] = [];

      teacher.schedules.forEach((schedule) => {
        const days = schedule.day_of_week.split(",").map((d) => d.trim());
        if (days.includes(dayName)) {
          const student = teacher.students.find(
            (s) => s.id === schedule.student_id
          );
          if (student) {
            group[dateStr].push({ schedule, date: dateStr, student });
          }
        }
      });

      if (group[dateStr].length > 0) {
        group[dateStr].sort((a, b) =>
          a.schedule.start_time.localeCompare(b.schedule.start_time)
        );
      }
    });

    return group;
  }, [teacher.schedules, teacher.students, weekDates]);

  const goToPreviousWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    setCurrentDate(selectedDate);
  };

  return (
    <div className="border-t dark:border-gray-700 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-sm sm:text-base whitespace-nowrap">
              {weekStart.toLocaleDateString()} -{" "}
              {new Date(
                weekStart.getTime() + 6 * 24 * 60 * 60 * 1000
              ).toLocaleDateString()}
            </span>
            <button
              onClick={goToNextWeek}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <input
            type="date"
            value={currentDate.toISOString().split("T")[0]}
            onChange={handleDatePickerChange}
            className="p-1 border rounded-md text-sm ml-auto sm:ml-0"
            title="Jump to week"
          />
        </div>
        <button
          onClick={onAddSchedule}
          className="flex items-center text-sm text-primary hover:underline self-end sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 mr-1" />
          Add Schedule
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              {weekDates.map((date, index) => (
                <th key={index} className="px-4 py-2 border-r text-center min-w-[100px]">
                  <div>{daysOfWeek[date.getDay()]}</div>
                  <div className="text-xs font-normal text-gray-500">
                    {date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="align-top">
            <tr>
              {weekDates.map((date, index) => {
                const dateStr = date.toISOString().split("T")[0];
                const daySchedules = schedulesByDate[dateStr] || [];
                return (
                  <td key={index} className="border-r p-2 space-y-2 min-w-[100px]">
                    {daySchedules.map(({ schedule, student }) => (
                      <div
                        key={schedule.id}
                        className="group relative flex items-start gap-1"
                      >
                        {/* Hover action buttons - appear on left side */}
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTime(schedule, student);
                            }}
                            className="p-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 rounded text-blue-600 dark:text-blue-400"
                            title="Edit Time"
                          >
                            <Clock className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSchedule(
                                schedule.id,
                                `${student.first_name} ${student.last_name}`,
                                schedule.day_of_week,
                                schedule.start_time.substring(0, 5)
                              );
                            }}
                            className="p-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 rounded text-red-600 dark:text-red-400"
                            title="Delete Schedule"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {/* Schedule card */}
                        <button
                          onClick={() =>
                            onSessionClick(schedule, dateStr, student)
                          }
                          className="flex-1 text-left bg-primary/10 hover:bg-primary/20 p-2 rounded-md text-xs transition-colors"
                        >
                          <p className="font-bold">{`${schedule.start_time.substring(
                            0,
                            5
                          )} - ${schedule.end_time.substring(0, 5)}`}</p>
                          <p className="truncate">
                            {student.first_name} {student.last_name}
                          </p>
                          {schedule.zoom_link && (
                            <a
                              href={schedule.zoom_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:underline flex items-center mt-1"
                            >
                              <Video className="w-3 h-3 mr-1" />
                              Zoom
                            </a>
                          )}
                        </button>
                      </div>
                    ))}
                    {daySchedules.length === 0 && (
                      <p className="text-xs text-gray-400 italic p-1">
                        No classes
                      </p>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Schedule Table Component (kept for compatibility, but using WeeklyCalendar instead) ---
function ScheduleTable({
  teacher,
  onAddSchedule,
}: {
  teacher: Teacher;
  onAddSchedule: () => void;
}) {
  // This component is replaced by WeeklyCalendar, but we keep it for backwards compatibility
  return null;
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

  // State for Session Attendance Modal
  const [isSessionAttendanceModalOpen, setIsSessionAttendanceModalOpen] =
    useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [selectedSessionDate, setSelectedSessionDate] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // State for Attendance Count
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().split("T")[0].slice(0, 7)
  );
  const [attendanceCount, setAttendanceCount] =
    useState<AttendanceCount | null>(null);
  const [loadingAttendanceCount, setLoadingAttendanceCount] = useState(false);

  // State to track existing session attendance
  const [existingSessionAttendance, setExistingSessionAttendance] =
    useState<SessionAttendance | null>(null);

  // State for Time Edit Modal
  const [isTimeEditModalOpen, setIsTimeEditModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<Schedule | null>(null);
  const [studentNameToEdit, setStudentNameToEdit] = useState<string>("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<Teacher[]>("/api/admin/teachers/");
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

  // useEffect(() => {
  //   if (!openTeacherId || !selectedDate) return;

  //   const fetchAttendance = async () => {
  //     const response = await fetch(
  //       `/api/admin/attendance/?teacher_id=${openTeacherId}&class_date=${selectedDate}`,
  //       { credentials: "include" }
  //     );
  //     if (response.ok) {
  //       const data: AttendanceRecord[] = await response.json();
  //       setExistingAttendance(data);
  //       const initialAttendance = data.reduce((acc, record) => {
  //         acc[record.student_id] = record.status;
  //         return acc;
  //       }, {} as Record<number, string>);
  //       setAttendance(initialAttendance);
  //     }
  //   };
  //   fetchAttendance();
  // }, [openTeacherId, selectedDate]);

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
    setOpenTeacherId((currentId) => {
      const newId = currentId === teacherId ? null : teacherId;
      // If opening a teacher, reload the attendance count
      if (newId === teacherId) {
        fetchAttendanceCount(teacherId, selectedMonth);
      }
      return newId;
    });
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
          apiFetch("/admin/attendance/", {
            method: "POST",
            body: JSON.stringify(record),
          })
        )
      );
      alert("Attendance saved successfully!");
      const data = await apiFetch<AttendanceRecord[]>(`/api/admin/attendance/?teacher_id=${teacherId}&class_date=${selectedDate}`);
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
    await apiFetch("/api/admin/schedules/", {
      method: "POST",
      body: JSON.stringify(scheduleData),
    });
    setIsScheduleModalOpen(false);
    await fetchData(); // Re-fetch all data to show the new schedule
  };

  const handleSessionClick = (
    schedule: Schedule,
    date: string,
    student: Student
  ) => {
    setSelectedSchedule(schedule);
    setSelectedSessionDate(date);
    setSelectedStudent(student);
    setIsSessionAttendanceModalOpen(true);

    // Check if attendance already exists for this session
    fetchSessionAttendance(schedule.id, date);
  };

  const fetchSessionAttendance = async (scheduleId: number, date: string) => {
    try {
      const data = await apiFetch<SessionAttendance[]>(`/api/admin/session-attendance/?teacher_id=${openTeacherId}&start_date=${date}&end_date=${date}`);
      const existing = data.find(
        (a) => a.schedule_id === scheduleId && a.class_date === date
      );
      setExistingSessionAttendance(existing || null);
    } catch (e) {
      console.warn("Failed to fetch session attendance", e);
    }
  };

  const fetchAttendanceCount = async (teacherId: number, monthStr: string) => {
    setLoadingAttendanceCount(true);
    const [year, month] = monthStr.split("-");
    try {
      const data = await apiFetch<AttendanceCount>(`/api/admin/attendance-count/?teacher_id=${teacherId}&year=${year}&month=${month}`);
      setAttendanceCount(data);
    } catch (err) {
      console.error("Error fetching attendance count:", err);
    } finally {
      setLoadingAttendanceCount(false);
    }
  };

  const handleSaveSessionAttendance = async (attendanceData: any) => {
    await apiFetch("/api/admin/session-attendance/", {
      method: "POST",
      body: JSON.stringify(attendanceData),
    });
    alert("Session attendance saved successfully!");
    setIsSessionAttendanceModalOpen(false);

    // Reload attendance count if the saved attendance is in the currently selected month
    if (openTeacherId) {
      const attendanceMonth = attendanceData.class_date.slice(0, 7); // Extract YYYY-MM
      if (attendanceMonth === selectedMonth) {
        fetchAttendanceCount(openTeacherId, selectedMonth);
      }
    }
  };

  const handleUpdateSchedule = async (scheduleId: number, updateData: any) => {
    await apiFetch(`/api/admin/schedules/${scheduleId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
    alert("Schedule updated successfully!");
    setIsSessionAttendanceModalOpen(false);

    // Re-fetch all data to show the updated schedule
    await fetchData();
  };

  const handleDeleteSchedule = async (scheduleId: number, studentName: string, dayOfWeek: string, time: string) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName}'s ${dayOfWeek} class at ${time}? This action cannot be undone.`)) {
      return;
    }
    try {
      await apiFetch(`/api/admin/schedules/${scheduleId}`, {
        method: "DELETE",
      });
      alert("Schedule deleted successfully!");
      // Re-fetch all data to show the updated list
      await fetchData();
    } catch (err: any) {
      alert(`Error deleting schedule: ${err.message}`);
    }
  };

  const handleEditTime = (schedule: Schedule, student: Student) => {
    setScheduleToEdit(schedule);
    setStudentNameToEdit(`${student.first_name} ${student.last_name}`);
    setIsTimeEditModalOpen(true);
  };

  const handleUpdateScheduleTime = async (scheduleId: number, startTime: string, endTime: string) => {
    await apiFetch(`/api/admin/schedules/${scheduleId}`, {
      method: "PATCH",
      body: JSON.stringify({ start_time: startTime, end_time: endTime }),
    });
    alert("Time updated successfully!");
    setIsTimeEditModalOpen(false);
    await fetchData();
  };

  if (isLoading) return <div className="p-10">Loading teacher data...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="p-6 sm:p-10">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Teacher & Student Management</h1>
          <p className="mt-2 text-gray-500">
            View and manage assigned teachers and their students.
          </p>
        </div>
        <button
          onClick={async () => {
            if (!window.confirm("This will split schedules with multiple days into separate per-day records. Run migration?")) return;
            try {
              const result = await apiFetch<{ message: string }>("/api/admin/migrate-schedules", { method: "POST" });
              alert(result.message);
              await fetchData(); // Refresh data after migration
            } catch (err: any) {
              alert(`Migration failed: ${err.message}`);
            }
          }}
          className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md flex items-center gap-2"
          title="Fix existing schedules to allow individual day editing/deletion"
        >
          🔧 Fix Schedules
        </button>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="w-full sm:w-auto">
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
        <div className="w-full sm:w-auto">
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
                    className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""
                      }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <>
                  <WeeklyCalendar
                    teacher={teacher}
                    onAddSchedule={() => handleAddScheduleClick(teacher)}
                    onSessionClick={handleSessionClick}
                    onEditTime={handleEditTime}
                    onDeleteSchedule={handleDeleteSchedule}
                  />
                  {/* <div className="border-t dark:border-gray-700 p-4">
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
                  </div> */}

                  {/* Attendance Count Section */}
                  <div className="border-t dark:border-gray-700 p-4">
                    <h4 className="font-semibold mb-4">Attendance Count</h4>
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
                          fetchAttendanceCount(teacher.id, e.target.value);
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
                            <h5 className="font-semibold text-sm mb-2">Teacher Attendance</h5>
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
                            <h5 className="font-semibold text-sm mb-2">Students Attendance</h5>
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

      {/* Render Session Attendance Modal */}
      <SessionAttendanceModal
        isOpen={isSessionAttendanceModalOpen}
        onClose={() => setIsSessionAttendanceModalOpen(false)}
        onSave={handleSaveSessionAttendance}
        onUpdateSchedule={handleUpdateSchedule}
        schedule={selectedSchedule}
        classDate={selectedSessionDate}
        student={selectedStudent}
        teacher_id={openTeacherId}
        teacher={selectedTeacher || teachers.find(t => t.id === openTeacherId) || null}
        existingAttendance={existingSessionAttendance}
        selectedMonth={selectedMonth}
        onAttendanceUpdated={async () => {
          if (openTeacherId) {
            await fetchAttendanceCount(openTeacherId, selectedMonth);
          }
        }}
      />

      {/* Render Time Edit Modal */}
      <TimeEditModal
        isOpen={isTimeEditModalOpen}
        onClose={() => setIsTimeEditModalOpen(false)}
        onSave={handleUpdateScheduleTime}
        schedule={scheduleToEdit}
        studentName={studentNameToEdit}
      />
    </div>
  );
}
