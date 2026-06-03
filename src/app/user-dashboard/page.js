"use client";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-[var(--background)] text-[var(--text)]">

      {/* Main Dashboard Content */}
      <main className="flex-1 p-10">

        <h1 className="text-2xl font-bold text-[var(--text-muted)] text-left mb-12">
          User Dashboard
        </h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-8 mb-12">

          <div className="bg-slate-500 border border-[var(--card)] border border-[var(--border)] shadow-xl rounded-xl p-8 hover:scale-105 transition-transform">
            <h2 className="text-2xl font-bold text-black-500 mb-2">
              Calendar
            </h2>
            <p className="text[var(--text-muted)text-black]">
              View employee attendance calendar
            </p>
            <button className="mt-4 bg-slate-900 text-white px-4 py-2 rounded-lg">
              View Calendar
            </button>
          </div>

          <div className="bg-zinc-500 border border[var(--card)] border border-[var(--border)] shadow-xl rounded-xl p-8 hover:scale-105 transition-transform">
            <h2 className="text-2xl font-bold text-black-500 mb-2">
              Leave Requests
            </h2>
            <p className="text-[var(--text-muted)]text-black">
              5 Pending Approvals
            </p>
            <button className="mt-4 bg-zinc-800 text-white px-4 py-2 rounded-lg">
              Manage Leaves
            </button>
          </div>

          <div className="bg-cyan-500 border border[var(--card)] border border-[var(--border)] shadow-xl rounded-xl p-8 hover:scale-105 transition-transform">
            <h2 className="text-2xl font-bold text-black-500 mb-2">
              Payroll
            </h2>
            <p className="text-[var(--text-muted)]text-black">
              Next cycle: 30 Apr
            </p>
            <button className="mt-4 bg-cyan-900 text-white px-4 py-2 rounded-lg">
              View Payroll
            </button>
          </div>

        </div>

       {/* Attendance Summary Table */}
<div className="bg-[var(--card)] border border-[var(--border)] shadow-2xl rounded-xl p-8">

  <h2 className="text-3xl font-bold text-[var(--text)] mb-6">
    View Attendance Summary
  </h2>

  <table className="w-full border-collapse">
    <thead>
      <tr className="text-left border-b border-[var(--border)]">
        <th className="p-4">Month</th>
        <th className="p-4">Total Days</th>
        <th className="p-4">Present</th>
        <th className="p-4">Absent</th>
        <th className="p-4">Leaves</th>
        <th className="p-4">Late</th>
        <th className="p-4">Attendance %</th>
      </tr>
    </thead>

    <tbody>
      <tr className="border-b border-[var(--border)] hover:bg-white/5">
        <td className="p-4">May 2026</td>
        <td className="p-4">31</td>
        <td className="p-4">25</td>
        <td className="p-4">3</td>
        <td className="p-4">2</td>
        <td className="p-4">1</td>
        <td className="p-4">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full">
            87%
          </span>
        </td>
      </tr>
      <tr className="border-b border-[var(--border)] hover:bg-white/5">
        <td className="p-4">April 2026</td>
        <td className="p-4">30</td>
        <td className="p-4">27</td>
        <td className="p-4">2</td>
        <td className="p-4">1</td>
        <td className="p-4">0</td>
        <td className="p-4">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full">
            92%
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