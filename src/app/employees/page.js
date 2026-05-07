"use client";

import { useEffect, useState } from "react";
import keycloak from "@/lib/keycloak";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
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

      setEmployees(empData || []);

      //  STATS FROM EMPLOYEES TABLE ONLY
      const total = empData?.length || 0;
      const active = empData.filter(e => e.status === "active").length;
      const inactive = empData.filter(e => e.status === "inactive").length;

      setStats({ total, active, inactive });

    } catch (err) {
      console.log("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!keycloak?.authenticated) return;

      try {
        await keycloak.updateToken(30);
        fetchData();
      } catch (err) {
        console.log("KEYCLOAK ERROR:", err);
      }
    };

    init();
  }, []);

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      <h1 className="text-2xl font-bold mb-6">
        Employees Dashboard
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-6 mb-8">

        <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-xl">
          <p className="text-sm text-[var(--text-muted)]">Total Employees</p>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>

        <div className="bg-green-100 border border-green-300 p-6 rounded-xl">
          <p className="text-sm text-green-700">Active Employees</p>
          <p className="text-3xl font-bold mt-2 text-green-800">{stats.active}</p>
        </div>

        <div className="bg-red-100 border border-red-300 p-6 rounded-xl">
          <p className="text-sm text-red-700">Inactive Employees</p>
          <p className="text-3xl font-bold mt-2 text-red-800">{stats.inactive}</p>
        </div>

      </div>

      {/* LIST */}
      <h2 className="text-lg font-semibold mb-4">
        Employees List
      </h2>

      <div className="grid grid-cols-6 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold mb-3">
        <div>Name</div>
        <div>Email</div>
        <div>Status</div>
        <div>Phone</div>
        <div>Department</div>
        <div>Roles</div>
      </div>

      <div className="space-y-3">
        {employees.map((emp, index) => (
          <div
            key={emp.id || index}
            className="grid grid-cols-6 bg-[var(--card)] border border-[var(--border)] px-6 py-4 rounded-xl"
          >
            <div>{emp.employee_name || "User"}</div>
            <div>{emp.email || "-"}</div>

            {/* ✅ STATUS FROM EMPLOYEES TABLE */}
            <div
              className={`font-semibold ${
                emp.status === "active"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {emp.status === "active" ? "Active" : "Inactive"}
            </div>

            <div>{emp.phone || "n/a"}</div>
            <div>{emp.department || "n/a"}</div>
            <div>{emp.role || "n/a"}</div>
          </div>
        ))}
      </div>

    </div>
  );
}