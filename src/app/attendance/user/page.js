"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import keycloak from "@/lib/keycloak";

export default function UserAttendancePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);

  const today = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    if (keycloak?.authenticated) {
      fetchData();
    }
  }, [keycloak?.authenticated]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/attendance/all", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
      const todayRec = (result || []).find((item) => item.date === today);
      setTodayRecord(todayRec || null);
    } catch (err) {
      console.log(err);
      setData([]);
    }
  };

  const handleAction = async (type) => {
    try {
      setLoading(true);
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({ type }),
      });
      const result = await res.json();
      if (!res.ok) { alert(result.error); return; }
      await fetchData();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const checkInDisabled = !!todayRecord?.check_in;
  const checkOutDisabled = !todayRecord?.check_in || !!todayRecord?.check_out;

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      {/* Header */}
      <div className="mb-8 bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm flex items-center gap-4">
        <div className="w-11 h-11 bg-indigo-900 rounded-xl flex items-center justify-center text-white shrink-0">
          <Clock size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">My Attendance</h1>
          <p className="text-xs text-[var(--text-muted)]">Track your daily attendance</p>
        </div>
      </div>

      {/* Check-in/out Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-xl shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[var(--text)]">Mark Attendance</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {todayRecord?.check_in && !todayRecord?.check_out
              ? "You are checked in"
              : todayRecord?.check_out
              ? "Attendance completed for today"
              : "Please check in today"}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleAction("checkin")}
            disabled={checkInDisabled || loading}
            className={`px-5 py-2 rounded-lg text-white font-medium text-sm ${
              checkInDisabled || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Processing..." : checkInDisabled ? "Checked In" : "Check In"}
          </button>
          <button
            onClick={() => handleAction("checkout")}
            disabled={checkOutDisabled || loading}
            className={`px-5 py-2 rounded-lg text-white font-medium text-sm ${
              checkOutDisabled || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Processing..." : checkOutDisabled ? "Checked Out" : "Check Out"}
          </button>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-[var(--text)] mb-4">
          Attendance History
          <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">({data.length} records)</span>
        </h2>

        {/* Table Header */}
        <div className="grid grid-cols-4 bg-indigo-900 text-white px-6 py-3 rounded-xl text-sm font-semibold mb-3">
          <div>Date</div>
          <div>Check In</div>
          <div>Check Out</div>
          <div>Status</div>
        </div>

        {/* Table Body */}
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-muted)]">
              No attendance records found
            </div>
          ) : (
            data.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-4 bg-[var(--background)] border border-[var(--border)] px-6 py-4 rounded-xl hover:shadow-sm transition"
              >
                <div className="text-[var(--text)]">{formatDate(item.date)}</div>
                <div className="text-[var(--text-muted)]">{formatTime(item.check_in)}</div>
                <div className="text-[var(--text-muted)]">{formatTime(item.check_out)}</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === "Present" ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : item.status === "Late" ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                    : item.status === "Half Day" ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}>
                    {item.status || "-"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "-";
  return new Date(time).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });
}