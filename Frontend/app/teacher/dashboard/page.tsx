"use client";

import { useState, useEffect, useMemo } from "react";
import { CalendarDays, Clock, Video } from "lucide-react";

// --- Types ---
interface Student {
  id: number;
  first_name: string;
  last_name: string;
}
interface Schedule {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  student: Student;
  zoom_link: string | null;
}
interface Teacher {
  id: number;
  name: string;
  schedules: Schedule[];
}

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await fetch("http://localhost:8000/teacher/me", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Could not fetch teacher data. Please re-login.");
        }
        const data: Teacher = await response.json();
        setTeacher(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeacherData();
  }, []);

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
    if (!teacher) return group;
    teacher.schedules.forEach((schedule) => {
      // Handle comma-separated days
      const days = schedule.day_of_week.split(",").map((d) => d.trim());
      days.forEach((day) => {
        if (!group[day]) group[day] = [];
        group[day].push(schedule);
        group[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
      });
    });
    return group;
  }, [teacher]);

  if (isLoading) return <div className="p-10">Loading your schedule...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        My Weekly Schedule
      </h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Here are your assigned classes for the week.
      </p>

      <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              {daysOfWeek.map((day) => (
                <th key={day} className="px-4 py-3 border-r">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="align-top">
            <tr>
              {daysOfWeek.map((day) => (
                <td key={day} className="border-r p-2 space-y-2">
                  {(schedulesByDay[day] || []).map((schedule) => (
                    <div
                      key={schedule.id}
                      className="bg-primary/10 p-3 rounded-md"
                    >
                      <p className="font-semibold text-sm">{`${schedule.student.first_name} ${schedule.student.last_name}`}</p>
                      <p className="text-xs text-gray-600 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1.5" />
                        {`${schedule.start_time.substring(
                          0,
                          5
                        )} - ${schedule.end_time.substring(0, 5)}`}
                      </p>
                      {schedule.zoom_link && (
                        <a
                          href={schedule.zoom_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center mt-1"
                        >
                          <Video className="w-3 h-3 mr-1.5" />
                          Join Class
                        </a>
                      )}
                    </div>
                  ))}
                  {(!schedulesByDay[day] ||
                    schedulesByDay[day].length === 0) && (
                    <p className="text-xs text-gray-400 italic p-3">
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
