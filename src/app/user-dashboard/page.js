"use client";

import { useEffect } from "react";
import keycloak from "@/lib/keycloak";

export default function DashboardPage() {

  // 🔥 AUTO SYNC EMPLOYEE ON LOGIN
  useEffect(() => {
    if (keycloak?.authenticated) {
      syncEmployee();
    }
  }, [keycloak?.authenticated]);

  const syncEmployee = async () => {
    try {
      await fetch("/api/sync-employees", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
    } catch (err) {
      console.log("SYNC ERROR:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-[var(--background)] text-[var(--text)]">

      {/* Main Dashboard Content */}
      <main className="flex-1 p-10">

        <h1 className="text-2xl font-bold text-[var(--text-muted)] text-left mb-12">
          User Dashboard
        </h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-8 mb-12">

          <div className="bg-[var(--card)] border border-[var(--border)] shadow-xl rounded-xl p-8 hover:scale-105 transition-transform">
            <h2 className="text-2xl font-bold text-purple-500 mb-2">
              Leave Requests
            </h2>
            <p className="text-[var(--text-muted)]">
              5 Pending Approvals
            </p>
            <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-lg">
              Manage Leaves
            </button>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] shadow-xl rounded-xl p-8 hover:scale-105 transition-transform">
            <h2 className="text-2xl font-bold text-pink-500 mb-2">
              Payroll
            </h2>
            <p className="text-[var(--text-muted)]">
              Next cycle: 30 Apr
            </p>
            <button className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg">
              View Payroll
            </button>
          </div>

        </div>

        {/* Leave Requests Table */}
        <div className="bg-[var(--card)] border border-[var(--border)] shadow-2xl rounded-xl p-8">

          <h2 className="text-3xl font-bold text-[var(--text)] mb-6">
            Recent Leave Requests
          </h2>

          <table className="w-full border-collapse">

            <thead>
              <tr className="text-left border-b border-[var(--border)]">
                <th className="p-4">Employee</th>
                <th className="p-4">Reason</th>
                <th className="p-4">From</th>
                <th className="p-4">To</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>

              <tr className="border-b border-[var(--border)] hover:bg-white/5">
                <td className="p-4">Rahul Sharma</td>
                <td className="p-4">Medical</td>
                <td className="p-4">20 Apr</td>
                <td className="p-4">25 Apr</td>
                <td className="p-4">
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full">
                    Pending
                  </span>
                </td>
              </tr>

              <tr className="border-b border-[var(--border)] hover:bg-white/5">
                <td className="p-4">Priya Singh</td>
                <td className="p-4">Vacation</td>
                <td className="p-4">10 May</td>
                <td className="p-4">15 May</td>
                <td className="p-4">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full">
                    Approved
                  </span>
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </main>
    </div>
  );
}