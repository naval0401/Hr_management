"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import keycloak from "@/lib/keycloak";

export default function DashboardPage() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        if (!keycloak?.token) return;

        const res = await fetch("/api/announcements", {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setAnnouncements(data.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (keycloak?.authenticated) {
      fetchAnnouncements();
    }
  }, []);

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
            <Link href="/calendar">
              <button className="mt-4 bg-slate-900 text-white px-4 py-2 rounded-lg">
                View Calendar
              </button>
            </Link>
          </div>

          <div className="bg-zinc-500 border border[var(--card)] border border-[var(--border)] shadow-xl rounded-xl p-8 hover:scale-105 transition-transform">
            <h2 className="text-2xl font-bold text-black-500 mb-2">
              Leave Requests
            </h2>
            <p className="text-[var(--text-muted)]text-black">
              Submit and track your leaves
            </p>
            <Link href="/leave">
              <button className="mt-4 bg-zinc-800 text-white px-4 py-2 rounded-lg">
                Apply Leave
              </button>
            </Link>
          </div>

          <div className="bg-cyan-700 border border[var(--card)] border border-[var(--border)] shadow-xl rounded-xl p-8 hover:scale-105 transition-transform">
            <h2 className="text-2xl font-bold text-black-500 mb-2">
              Attendance
            </h2>
            <p className="text-[var(--text-muted)]text-black">
              Check in and view your records
            </p>
            <Link href="/attendance">
              <button className="mt-4 bg-cyan-900 text-white px-4 py-2 rounded-lg">
                View Attendance
              </button>
            </Link>
          </div>

        </div>

        <div className="col-span-full w-full bg-gradient-to-r from-indigo-900 via-sky-900 to-zinc-800 text-white py-14 px-10 mt-10 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <h2 className="text-4xl font-extrabold tracking-wide flex items-center gap-3 drop-shadow-lg">
              <span>📣</span> Announcements
            </h2>
            <Link href="/announcements">
              <button className="bg-white text-indigo-900 font-semibold py-2 px-5 rounded-lg hover:bg-gray-100 transition text-sm">
                View all
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 text-lg font-medium">
            {announcements.length === 0 ? (
              <div className="col-span-full text-center opacity-80 text-sm">
                No announcements at the moment.
              </div>
            ) : (
              announcements.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/20 backdrop-blur-md p-6 rounded-xl text-center hover:bg-white/30 transition-all duration-300 shadow-lg"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {item.emoji || "📣"} {item.title}
                  </h3>
                  <p className="text-sm opacity-90">{item.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
