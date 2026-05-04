"use client";

import { useEffect, useMemo, useState } from "react";
import keycloak from "@/lib/keycloak";

export default function AttendancePage() {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);

  const isHR = useMemo(() => {
    const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
    return roles.includes("hr");
  }, [keycloak?.tokenParsed]);

  useEffect(() => {
    if (keycloak?.authenticated) {
      fetchData();
    }
  }, [keycloak?.authenticated]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/attendance/all", {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      const result = await res.json();

      // ✅ FIX: ensure proper name mapping
      const cleaned = (result || []).map((item) => ({
        ...item,
        employee_name:
          item.employee_name ||
          "User",
      }));

      setData(cleaned);

      const today = new Date().toISOString().split("T")[0];
      const found = cleaned.find((item) => item.date === today);
      setTodayRecord(found || null);
    } catch (err) {
      console.log(err);
      setData([]);
    }
  };

  // FILTER (NO CHANGE)
  const filteredData = useMemo(() => {
    if (!data.length) return [];

    const today = new Date().toISOString().split("T")[0];
    const activeDate = selectedDate || today;

    return data.filter((item) => item.date === activeDate);
  }, [data, selectedDate]);

  // CHECK-IN
  const checkIn = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({ type: "checkin" }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result?.error || "Check-in failed");
        return;
      }

      await fetchData();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // CHECK-OUT
  const checkOut = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({ type: "checkout" }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result?.error || "Check-out failed");
        return;
      }

      await fetchData();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const checkInDisabled = !!todayRecord?.check_in;
  const checkOutDisabled =
    !todayRecord?.check_in || !!todayRecord?.check_out;

  const presentCount = filteredData.filter((i) => i.check_in).length;

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">HR Attendance Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">
          All users attendance tracking
        </p>
      </div>

      {/* MARK ATTENDANCE */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-xl shadow-sm mb-4 flex justify-between items-center">

        <div>
          <h2 className="text-lg font-semibold">Mark Attendance (HR)</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {todayRecord?.check_in
              ? "Checked In Today"
              : "Not Checked In"}
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={checkIn}
            disabled={checkInDisabled || loading}
            className={`px-5 py-2 rounded-lg text-white ${
              checkInDisabled || loading
                ? "bg-gray-400"
                : "bg-green-600"
            }`}
          >
            {loading ? "Loading..." : "Check In"}
          </button>

          <button
            onClick={checkOut}
            disabled={checkOutDisabled || loading}
            className={`px-5 py-2 rounded-lg text-white ${
              checkOutDisabled || loading
                ? "bg-gray-400"
                : "bg-red-600"
            }`}
          >
            {loading ? "Loading..." : "Check Out"}
          </button>

        </div>
      </div>

      {/* FILTER */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-xl shadow-sm mb-6 flex justify-between items-center">

        <div>
          <h2 className="text-lg font-semibold">Filter Attendance</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Present Users: {presentCount}
          </p>
        </div>

        <div className="flex gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />

          <button
            onClick={() => setSelectedDate("")}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg"
          >
            Today
          </button>
        </div>
      </div>

      {/* TABLE HEADER */}
      <div className="grid grid-cols-5 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold mb-3">
        <div>Name</div>
        <div>Date</div>
        <div>Check In</div>
        <div>Check Out</div>
        <div>Status</div>
      </div>

      {/* TABLE BODY */}
      <div className="space-y-3">
        {filteredData.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] py-10">
            No attendance found
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div
              key={item.id || index}
              className="grid grid-cols-5 bg-[var(--card)] border border-[var(--border)] px-6 py-4 rounded-xl"
            >
              {/* FIXED NAME DISPLAY */}
              <div>{item.employee_name}</div>

              <div>{formatDate(item.date)}</div>
              <div>{formatTime(item.check_in)}</div>
              <div>{formatTime(item.check_out)}</div>

              <div>
                {item.check_in && !item.check_out
                  ? "Working"
                  : item.check_out
                  ? "Completed"
                  : "Absent"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// helpers
function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "-";
  return new Date(time).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}