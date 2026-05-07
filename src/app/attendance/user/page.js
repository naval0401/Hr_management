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

  //  DATE 
  const getToday = () => {
    return new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
  };

  const fetchData = async () => {
    try {
      const res = await fetch("/api/attendance", {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      const result = await res.json();
      setData(result || []);

      const today = getToday();

      //  SIMPLIFIED + SAFE
      const todayRec = (result || []).find(
        (item) => item.date?.split("T")[0] === today
      );

      setTodayRecord(todayRec || null);

    } catch (err) {
      console.log(err);
      setData([]);
    }
  };

  //  COMMON HANDLER 
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

      if (!res.ok) {
        alert(result.error);
        return;
      }

      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  //  BUTTON LOGIC
  const checkInDisabled = !!todayRecord?.check_in;
  const checkOutDisabled =
    !todayRecord?.check_in || !!todayRecord?.check_out;

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Attendance Dashboard
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Track your daily attendance
        </p>
      </div>

      {/* ACTION CARD */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-xl shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">

        <div>
          <h2 className="text-lg font-semibold">
            Mark Attendance
          </h2>

          <p className="text-sm text-[var(--text-muted)]">
            {todayRecord?.check_in && !todayRecord?.check_out
              ? "You are checked in"
              : todayRecord?.check_out
              ? "You completed attendance"
              : "Please check in today"}
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={() => handleAction("checkin")}
            disabled={checkInDisabled || loading}
            className={`px-5 py-2 rounded-lg text-white ${
              checkInDisabled || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600"
            }`}
          >
            {loading ? "Processing..." : checkInDisabled ? "Checked In" : "Check In"}
          </button>

          <button
            onClick={() => handleAction("checkout")}
            disabled={checkOutDisabled || loading}
            className={`px-5 py-2 rounded-lg text-white ${
              checkOutDisabled || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600"
            }`}
          >
            {loading ? "Processing..." : checkOutDisabled ? "Checked Out" : "Check Out"}
          </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="grid grid-cols-4 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold mb-3">
        <div>Date</div>
        <div>Check In</div>
        <div>Check Out</div>
        <div>Status</div>
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-muted)]">
            No attendance records found
          </div>
        ) : (
          data.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-4 bg-[var(--card)] border border-[var(--border)] px-6 py-4 rounded-xl"
            >
              <div>{item.date?.split("T")[0]}</div>
              <div>{formatTime(item.check_in)}</div>
              <div>{formatTime(item.check_out)}</div>

              {/* USE DB STATUS  */}
              <div>{item.status || "-"}</div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

// helper
function formatTime(time) {
  if (!time) return "-";
  return new Date(time).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}