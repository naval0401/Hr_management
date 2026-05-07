"use client";

import { useEffect, useMemo, useState } from "react";
import keycloak from "@/lib/keycloak";

export default function AttendancePage() {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);

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
      setData(result || []);
    } catch (err) {
      console.log(err);
      setData([]);
    }
  };

  //  SIMPLE & SAFE TODAY
  const today = new Date().toLocaleDateString("en-CA");

  //  CURRENT USER RECORD 
  const myTodayRecord = (data || []).find(
    (item) =>
      item.employee_id === keycloak?.tokenParsed?.sub &&
      item.date === today
  );

  //  FILTER
  const filteredData = useMemo(() => {
    if (!data.length) return [];

    const activeDate = selectedDate || today;
    return data.filter((item) => item.date === activeDate);
  }, [data, selectedDate, today]);

  //  ACTION HANDLER
  const handleAction = async (type) => {
    try {
      setLoading(true);

      const res = await fetch("/api/attendance/all", {
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

      // 🔥 IMPORTANT: reload data
      await fetchData();

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          HR Attendance Dashboard
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          All users attendance tracking
        </p>
      </div>

      {/* MARK ATTENDANCE */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-xl shadow-sm mb-4 flex justify-between items-center">

        <div>
          <h2 className="text-lg font-semibold">
            Mark Attendance (HR)
          </h2>
        </div>

        <div className="flex gap-3">

          {/* CHECK IN */}
          <button
            onClick={() => handleAction("checkin")}
            disabled={loading || !!myTodayRecord?.check_in}
            className={`px-5 py-2 rounded-lg text-white ${
              loading || myTodayRecord?.check_in
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600"
            }`}
          >
            {loading
              ? "Processing..."
              : myTodayRecord?.check_in
              ? "Checked In"
              : "Check In"}
          </button>

          {/* CHECK OUT */}
          <button
            onClick={() => handleAction("checkout")}
            disabled={
              loading ||
              !myTodayRecord?.check_in ||
              !!myTodayRecord?.check_out
            }
            className={`px-5 py-2 rounded-lg text-white ${
              loading ||
              !myTodayRecord?.check_in ||
              myTodayRecord?.check_out
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600"
            }`}
          >
            {loading
              ? "Processing..."
              : myTodayRecord?.check_out
              ? "Checked Out"
              : "Check Out"}
          </button>

        </div>
      </div>

      {/* FILTER */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-xl shadow-sm mb-6 flex justify-between items-center">

        <div>
          <h2 className="text-lg font-semibold">
            Filter Attendance
          </h2>
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
          <div className="text-center py-10 text-[var(--text-muted)]">
            No attendance found
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div
              key={item.id || index}
              className="grid grid-cols-5 bg-[var(--card)] border border-[var(--border)] px-6 py-4 rounded-xl"
            >
              <div>{item.employee_name}</div>
              <div>{formatDate(item.date)}</div>
              <div>{formatTime(item.check_in)}</div>
              <div>{formatTime(item.check_out)}</div>

              <div>
                {item.status || "-"}
                <span className="ml-2 text-xs text-gray-500">
                  ({item.check_out
                    ? "inactive"
                    : item.check_in
                    ? "active"
                    : "inactive"})
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