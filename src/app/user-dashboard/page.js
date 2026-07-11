"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import keycloak from "@/lib/keycloak";
import { Calendar, CalendarCheck, Clock3, Megaphone, ArrowRight, UserCircle, FileText, Wallet } from "lucide-react";

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

  const cards = [
    {
      title: "Calendar",
      desc: "View employee attendance calendar",
      button: "View Calendar",
      link: "/calendar",
      icon: Calendar,
      iconBg: "bg-slate-100 dark:bg-slate-800",
      iconColor: "text-slate-700 dark:text-slate-300",
      accent: "border-l-slate-600",
    },
    {
      title: "Leave Requests",
      desc: "Submit and track your leaves",
      button: "Apply Leave",
      link: "/leave",
      icon: CalendarCheck,
      iconBg: "bg-indigo-100 dark:bg-indigo-950",
      iconColor: "text-indigo-700 dark:text-indigo-300",
      accent: "border-l-indigo-600",
    },
    {
      title: "Attendance",
      desc: "Check in and view your records",
      button: "View Attendance",
      link: "/attendance",
      icon: Clock3,
      iconBg: "bg-cyan-100 dark:bg-cyan-950",
      iconColor: "text-cyan-700 dark:text-cyan-300",
      accent: "border-l-cyan-600",
    },
     {
      title: "My Profile",
      desc: "View and update your personal info",
      button: "View Profile",
      link: "/profile",
      icon: UserCircle,
      iconBg: "bg-violet-100 dark:bg-violet-950",
      iconColor: "text-violet-700 dark:text-violet-300",
      accent: "border-l-violet-600",
    },
    {
      title: "My Documents",
      desc: "View and request your documents",
      button: "View Documents",
      link: "/document-request",
      icon: FileText,
      iconBg: "bg-green-100 dark:bg-green-950",
      iconColor: "text-green-700 dark:text-green-300",
      accent: "border-l-green-600",
    },
    {
      title: "My Payslips",
      desc: "View your salary slips",
      button: "View Payslips",
      link: "/my-payslips",
      icon: Wallet,
      iconBg: "bg-amber-100 dark:bg-amber-950",
      iconColor: "text-amber-700 dark:text-amber-300",
      accent: "border-l-amber-600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-[var(--background)] text-[var(--text)]">

      {/* Main Dashboard Content */}
      <main className="flex-1 p-6 pt-10">

        <h1 className="text-xl font-semibold text-[var(--text)] mb-8">
          User Dashboard
        </h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`bg-[var(--card)] border border-[var(--border)] border-l-4 ${card.accent} rounded-xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={card.iconColor} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[var(--text)]">
                      {card.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <Link href={card.link} className="mt-5">
                  <button className="flex items-center gap-2 bg-indigo-900 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-indigo-800 transition">
                    {card.button}
                    <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            );
          })}

        </div>

        {/* Announcements */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-white shrink-0">
                <Megaphone size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[var(--text)]">Announcements</h2>
                <p className="text-xs text-[var(--text-muted)]">Latest company updates and notices</p>
              </div>
            </div>
          </div>

          {/* Announcement list */}
          <div className="p-5">
            {announcements.length === 0 ? (
              <div className="text-center py-10 text-sm text-[var(--text-muted)]">
                <Megaphone size={32} className="mx-auto mb-3 opacity-40" />
                <p>No announcements at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {announcements.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 flex flex-col"
                  >
                    <h3 className="text-sm font-semibold text-[var(--text)] leading-snug mb-1.5 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                      {item.emoji || "📣"} {item.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 flex-1">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}