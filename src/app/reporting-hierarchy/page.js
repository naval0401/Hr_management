"use client";

import { useEffect, useMemo, useState } from "react";
import keycloak from "@/lib/keycloak";
import { Users, UserCheck } from "lucide-react";

export default function ReportingPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      await keycloak.updateToken(30);

      const res = await fetch("/api/employees", {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const managers = useMemo(() => {
    const map = {};

    employees.forEach((emp) => {
      if (emp.reporting_manager) {
        const manager = emp.reporting_manager;

        if (!map[manager.id]) {
          map[manager.id] = {
            ...manager,
            employees: [],
          };
        }

        map[manager.id].employees.push(emp);
      }
    });

    return Object.values(map);
  }, [employees]);

  const filteredManagers = managers.filter((manager) => {
    const q = search.toLowerCase();

    if (manager.employee_name.toLowerCase().includes(q)) return true;

    return manager.employees.some((e) =>
      e.employee_name?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="pt-20 p-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      <div className="mb-8 bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-indigo-900 flex items-center justify-center text-white">
            <Users size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold">
              Reporting Structure
            </h1>

            <p className="text-sm text-[var(--text-muted)]">
              Manager wise reporting employees
            </p>
          </div>

        </div>

      </div>

      <div className="mb-6">

        <input
          type="text"
          placeholder="Search manager or employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-3"
        />

      </div>

      {filteredManagers.length === 0 && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-8 text-center">
          No Reporting Structure Found
        </div>
      )}

      <div className="space-y-6">

        {filteredManagers.map((manager) => (

          <div
            key={manager.id}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden"
          >

            <div className="bg-indigo-900 text-white p-5 flex justify-between items-center">

              <div>

                <h2 className="text-lg font-semibold">
                  {manager.employee_name}
                </h2>

                <p className="text-sm opacity-90">
                  {manager.designation}
                </p>

              </div>

              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">

                <UserCheck size={16} />

                <span>
                  {manager.employees.length} Reportees
                </span>

              </div>

            </div>

            <div className="divide-y divide-[var(--border)]">

              {manager.employees.map((emp) => (

                <div
                  key={emp.id}
                  className="grid grid-cols-5 gap-4 px-5 py-4 items-center hover:bg-[var(--background)] transition"
                >

                  <div>
                    <p className="font-medium">
                      {emp.employee_name}
                    </p>
                  </div>

                  <div>
                    {emp.designation || "-"}
                  </div>

                  <div>
                    {emp.department || "-"}
                  </div>

                  <div>
                    {emp.email}
                  </div>

                  <div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        emp.status
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {emp.status ? "Active" : "Inactive"}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}