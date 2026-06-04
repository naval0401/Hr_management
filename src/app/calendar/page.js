"use client";
import { useEffect, useState } from "react";
import keycloak from "@/lib/keycloak";

export default function CalendarPage() {
  const [attendance, setAttendance] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1); // default current month
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (keycloak?.authenticated) {
      fetchAttendance();
    }
  }, [keycloak?.authenticated]);

  const fetchAttendance = async () => {
    const res = await fetch(`/api/attendance?month=${month}&year=${year}`, {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    });
    const data = await res.json();
    setAttendance(Array.isArray(data) ? data : []);
  };

  const getStatus = (date) => {
    if (!Array.isArray(attendance)) return "nodata";
    const record = attendance.find(
      (a) => new Date(a.date).toISOString().split("T")[0] === date
    );

    if (!record) return "nodata"; // 👈 default grey
    if (record.status === "absent") return "absent";
    if (record.check_in && !record.check_out) return "working";
    if (record.check_out) return "completed";
    return record.status || "nodata";
  };

  const daysInMonth = new Date(year, month, 0).getDate();

  // Month names for dropdown
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  return (
    <div className="p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">
      <h2 className="text-xl font-bold mb-4">
        Calendar – {monthNames[month - 1]} {year}
      </h2>

      {/* Month Selector */}
      <div className="flex gap-4 mb-6">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border px-3 py-2 rounded bg-zinc-600 text-white"
        >
          {monthNames.map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-3 py-2 rounded bg-zinc-600 text-white"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2 font-semibold text-center">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {(() => {
          const firstDay = new Date(year, month - 1, 1).getDay(); 
          // Sunday=0, Monday=1 ... Saturday=6
          const offset = (firstDay === 0 ? 6 : firstDay - 1);

          const days = [];

          // Empty cells for offset
          for (let i = 0; i < offset; i++) {
            days.push(
              <div key={`empty-${i}`} className="p-4 text-center rounded bg-transparent"></div>
            );
          }

          // Actual days
          for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const status = getStatus(dateStr);

            days.push(
              <div
                key={day}
                className={`p-4 text-center rounded shadow ${
                  status === "completed"
                    ? "bg-green-600 text-white"
                    : status === "working"
                    ? "bg-yellow-500 text-white"
                    : status === "absent"
                    ? "bg-red-500 text-white"
                    : "bg-gray-300 text-black dark:bg-zinc-500 dark:text-white"
                }`}
              >
                {day}
                <div className="text-sm mt-1">
                  {status === "completed"
                    ? "✅"
                    : status === "working"
                    ? "⏳"
                    : status === "absent"
                    ? "❌"
                    : ""}
                </div>
              </div>
            );
          }

          return days;
        })()}
      </div>
    </div>
  );
}
