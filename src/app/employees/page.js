"use client";

import { useEffect, useState } from "react";
import keycloak from "@/lib/keycloak";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const fetchData = async () => {
    try {
      const empRes = await fetch("/api/employees", {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      const empData = await empRes.json();

      const attRes = await fetch("/api/attendance", {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      const attData = await attRes.json();

      setEmployees(empData || []);
      setAttendance(attData || []);

      const today = new Date().toISOString().split("T")[0];

      let active = 0;

      (empData || []).forEach((emp) => {
        const isActive = (attData || []).some(
          (a) =>
            a.employee_id === emp.id &&
            a.date === today &&
            a.check_in
        );

        if (isActive) active++;
      });

      const total = empData?.length || 0;
      const inactive = total - active;

      setStats({ total, active, inactive });

    } catch (err) {
      console.log("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!keycloak?.authenticated) return;

      try {
        await keycloak.updateToken(30); // 🔥 ensure fresh token
        fetchData(); // 🔥 AUTO API CALL ON PAGE OPEN
      } catch (err) {
        console.log("KEYCLOAK ERROR:", err);
      }
    };

    init();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      <h1 className="text-2xl font-bold mb-6">
        Employees Dashboard
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-6 mb-8">

        <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-xl">
          <p className="text-sm text-[var(--text-muted)]">
            Total Employees
          </p>
          <p className="text-3xl font-bold mt-2">
            {stats.total}
          </p>
        </div>

        <div className="bg-green-100 border border-green-300 p-6 rounded-xl">
          <p className="text-sm text-green-700">
            Active Employees
          </p>
          <p className="text-3xl font-bold mt-2 text-green-800">
            {stats.active}
          </p>
        </div>

        <div className="bg-red-100 border border-red-300 p-6 rounded-xl">
          <p className="text-sm text-red-700">
            Inactive Employees
          </p>
          <p className="text-3xl font-bold mt-2 text-red-800">
            {stats.inactive}
          </p>
        </div>

      </div>

      {/* LIST */}
      <h2 className="text-lg font-semibold mb-4">
        Employees List
      </h2>

      <div className="grid grid-cols-3 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold mb-3">
        <div>Name</div>
        <div>Email</div>
        <div>Status</div>
      </div>

      <div className="space-y-3">
        {employees.map((emp, index) => {
          const isActive = attendance.some(
            (a) =>
              a.employee_id === emp.id &&
              a.date === today &&
              a.check_in
          );

          return (
            <div
              key={emp.id || index}
              className="grid grid-cols-3 bg-[var(--card)] border border-[var(--border)] px-6 py-4 rounded-xl"
            >
              <div>{emp.employee_name || "User"}</div>
              <div>{emp.email || "-"}</div>

              <div
                className={`font-semibold ${
                  isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}