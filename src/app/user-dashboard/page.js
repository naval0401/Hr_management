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
            <button className="mt-4 bg-slate-900 text-white px-4 py-2 rounded-lg, link/calendar">
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

          <div className="bg-cyan-700 border border[var(--card)] border border-[var(--border)] shadow-xl rounded-xl p-8 hover:scale-105 transition-transform">
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

<div className="col-span-full w-full bg-gradient-to-r from-indigo-900 via-sky-900 to-zinc-800 text-white py-14 px-10 mt-10">
  <h2 className="text-4xl font-extrabold tracking-wide mb-10 flex items-center gap-3 justify-center drop-shadow-lg">
    <span>📣</span> Announcements
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 text-lg font-medium">
    <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl text-center hover:bg-white/30 transition-all duration-300 shadow-lg">
      <h3 className="text-xl font-semibold mb-2">🎉 Holiday on 21 June</h3>
      <p className="text-sm opacity-90">Office closed for all departments. Enjoy your day off!</p>
    </div>

    <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl text-center hover:bg-white/30 transition-all duration-300 shadow-lg">
      <h3 className="text-xl font-semibold mb-2">📢 New HR Policy Updated</h3>
      <p className="text-sm opacity-90">Check your email for revised attendance and leave rules.</p>
    </div>

    <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl text-center hover:bg-white/30 transition-all duration-300 shadow-lg">
      <h3 className="text-xl font-semibold mb-2">📝 Training Session on 25 June</h3>
      <p className="text-sm opacity-90">Mandatory skill‑building workshop for all employees.</p>
    </div>

    <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl text-center hover:bg-white/30 transition-all duration-300 shadow-lg">
      <h3 className="text-xl font-semibold mb-2">🏥 Annual Medical Checkup</h3>
      <p className="text-sm opacity-90">Scheduled on 28 June. Bring your ID and health card.</p>
    </div>




  </div>
</div>

      </main>
    </div>
  );
}