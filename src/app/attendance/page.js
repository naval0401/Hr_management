"use client";

import { useEffect, useState } from "react";
import keycloak from "@/lib/keycloak";

export default function AttendancePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);

  useEffect(() => {
    if (keycloak?.authenticated) {
      fetchData();
    }
  }, [keycloak?.authenticated]);

  const fetchData = async () => {
    const res = await fetch("/api/attendance", {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    });

    const result = await res.json();
    setData(result);

    // 🔥 TODAY RECORD FIND
    const today = new Date().toISOString().split("T")[0];
    const found = result.find((item) => item.date === today);
    setTodayRecord(found || null);
  };

  const checkIn = async () => {
    setLoading(true);
    await fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${keycloak.token}`,
      },
      body: JSON.stringify({ type: "checkin" }),
    });
    setLoading(false);
    fetchData();
  };

  const checkOut = async () => {
    setLoading(true);
    await fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${keycloak.token}`,
      },
      body: JSON.stringify({ type: "checkout" }),
    });
    setLoading(false);
    fetchData();
  };

  // 🔥 BUTTON LOGIC
  const checkInDisabled = !!todayRecord?.check_in;
  const checkOutDisabled =
    !todayRecord?.check_in || !!todayRecord?.check_out;

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Attendance Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Track your daily attendance
        </p>
      </div>

      {/* ACTION CARD */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-xl shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">

        <div>
          <h2 className="text-lg font-semibold">Mark Attendance</h2>

          {/* 🔥 TODAY STATUS */}
          <p className="text-sm text-[var(--text-muted)]">
            {todayRecord?.check_in && !todayRecord?.check_out
              ? "You are checked in"
              : todayRecord?.check_out
              ? "You completed attendance"
              : "Please check in today"}
          </p>
        </div>

        <div className="flex gap-3">

          {/* CHECK IN */}
          <button
            onClick={checkIn}
            disabled={checkInDisabled || loading}
            className={`px-5 py-2 rounded-lg text-white transition ${
              checkInDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {checkInDisabled ? "Checked In" : "Check In"}
          </button>

          {/* CHECK OUT */}
          <button
            onClick={checkOut}
            disabled={checkOutDisabled || loading}
            className={`px-5 py-2 rounded-lg text-white transition ${
              checkOutDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {checkOutDisabled ? "Checked Out" : "Check Out"}
          </button>

        </div>

      </div>

      {/* TABLE HEADER */}
      <div className="grid grid-cols-4 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold mb-3">
        <div>Date</div>
        <div>Check In</div>
        <div>Check Out</div>
        <div>Status</div>
      </div>

      {/* DATA ROWS */}
      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] py-10">
            No attendance records found
          </div>
        ) : (
          data.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-4 bg-[var(--card)] border border-[var(--border)] px-6 py-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div>{formatDate(item.date)}</div>
              <div>{formatTime(item.check_in)}</div>
              <div>{formatTime(item.check_out)}</div>

              {/* 🔥 SMART STATUS */}
              <div>
                {item.check_in && !item.check_out && (
                  <span className="px-3 py-1 text-xs rounded-full bg-yellow-500 text-white">
                    Working
                  </span>
                )}

                {item.check_out && (
                  <span className="px-3 py-1 text-xs rounded-full bg-green-600 text-white">
                    Completed
                  </span>
                )}

                {!item.check_in && (
                  <span className="px-3 py-1 text-xs rounded-full bg-gray-400 text-white">
                    Absent
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

// helpers same
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "-";
  const d = new Date(time);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}