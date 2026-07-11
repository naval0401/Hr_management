"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Users, Search } from "lucide-react";
import keycloak from "@/lib/keycloak";

export default function HRAttendancePage() {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [myTodayRecord, setMyTodayRecord] = useState(null);

  const today = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    if (keycloak?.authenticated) {
      fetchAllAttendance();
      fetchMyAttendance();
    }
  }, [keycloak?.authenticated]);

  // Sab employees ki attendance — HR ke liye
  const fetchAllAttendance = async () => {
    try {
      const res = await fetch("/api/attendance", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.log(err);
      setData([]);
    }
  };

  // HR ka apna aaj ka record — check-in/out ke liye
  const fetchMyAttendance = async () => {
    try {
      const res = await fetch("/api/attendance/all", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      const result = await res.json();
      const todayRec = (result || []).find((item) => item.date === today);
      setMyTodayRecord(todayRec || null);
    } catch (err) {
      console.log(err);
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
      await fetchAllAttendance();
      await fetchMyAttendance();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let filtered = data;
    const activeDate = selectedDate || today;
    filtered = filtered.filter((item) => item.date === activeDate);
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.employee_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [data, selectedDate, searchQuery, today]);

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      {/* Header */}
      <div className="mb-8 bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm flex items-center gap-4">
        <div className="w-11 h-11 bg-indigo-900 rounded-xl flex items-center justify-center text-white shrink-0">
          <Users size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">HR Attendance Dashboard</h1>
          <p className="text-xs text-[var(--text-muted)]">View and manage all employees attendance</p>
        </div>
      </div>

      {/* HR Check-in/out */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)]">Mark Your Attendance</h2>
          <p className="text-xs text-[var(--text-muted)]">
            {myTodayRecord?.check_in && !myTodayRecord?.check_out
              ? "You are checked in"
              : myTodayRecord?.check_out
              ? "Attendance completed"
              : "Please check in today"}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleAction("checkin")}
            disabled={loading || !!myTodayRecord?.check_in}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
              loading || myTodayRecord?.check_in
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Processing..." : myTodayRecord?.check_in ? "Checked In" : "Check In"}
          </button>
          <button
            onClick={() => handleAction("checkout")}
            disabled={loading || !myTodayRecord?.check_in || !!myTodayRecord?.check_out}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
              loading || !myTodayRecord?.check_in || myTodayRecord?.check_out
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Processing..." : myTodayRecord?.check_out ? "Checked Out" : "Check Out"}
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm mb-6 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--background)] w-64">
          <Search size={14} className="text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-[var(--text)] focus:outline-none w-full"
          />
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-[var(--border)] bg-[var(--background)] text-[var(--text)] px-3 py-2 rounded-lg text-sm"
          />
          <button
            onClick={() => setSelectedDate("")}
            className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg text-sm"
          >
            Today
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 bg-indigo-900 text-white px-6 py-3 rounded-xl text-sm font-semibold mb-3 shadow-sm">
        <div>Employee</div>
        <div>Date</div>
        <div>Check In</div>
        <div>Check Out</div>
        <div>Status</div>
      </div>

      {/* Table Body */}
      <div className="space-y-3">
        {filteredData.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-muted)]">
            No attendance records found
          </div>
        ) : (
          filteredData.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-5 bg-[var(--card)] border border-[var(--border)] px-6 py-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="font-medium text-[var(--text)]">{item.employee_name || "-"}</div>
              <div className="text-[var(--text-muted)]">{formatDate(item.date)}</div>
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