'use client';

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import keycloak from "@/lib/keycloak";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  IndianRupee,
  Clock3,
  FileText,
  BarChart3,
  ArrowRight,
  Megaphone,
} from "lucide-react";

export default function HRDashboard() {

  const [pendingCount, setPendingCount] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [employeeStats, setEmployeeStats] = useState({
  total: 0,
  active: 0,
  inactive: 0,
});

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const { count, error } = await supabase
          .from("leaves")
          .select("*", { count: "exact", head: true })
          .ilike("status", "pending");

        if (!error) {
          setPendingCount(count);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchPendingCount();
  }, []);

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

  useEffect(() => {
  const fetchEmployeeStats = async () => {
    try {
      if (!keycloak?.authenticated) return;

      const res = await fetch("/api/employees", {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      const data = await res.json();

      if (!Array.isArray(data)) return;

      setEmployeeStats({
        total: data.length,
        active: data.filter(emp => emp.status === true).length,
        inactive: data.filter(emp => emp.status === false).length,
      });

    } catch (err) {
      console.error(err);
    }
  };

  fetchEmployeeStats();
}, []);

  const cards = [
    {
      title: "Employees",
      value: `${employeeStats.active} Active / ${employeeStats.total} Total`,
      button: "View Employees",
      link: "/employees",
      icon: Users,
      iconBg: "bg-slate-100 dark:bg-slate-800",
      iconColor: "text-slate-700 dark:text-slate-300",
      accent: "border-l-slate-600",
    },
    {
      title: "Leave Requests",
      value: `${pendingCount} Pending Approvals`,
      button: "Manage Leaves",
      link: "/pending",
      icon: CalendarCheck,
      iconBg: "bg-indigo-100 dark:bg-indigo-950",
      iconColor: "text-indigo-700 dark:text-indigo-300",
      accent: "border-l-indigo-600",
    },
    {
      title: "Payroll",
      value: "Next cycle: 30 Apr",
      button: "View Payroll",
      link: "/payroll",
      icon: IndianRupee,
      iconBg: "bg-cyan-100 dark:bg-cyan-950",
      iconColor: "text-cyan-700 dark:text-cyan-300",
      accent: "border-l-cyan-600",
    },
    {
      title: "Attendance",
      value: "Today: 115 Present, 5 Absent",
      button: "View Attendance",
      link: "/attendance",
      icon: Clock3,
      iconBg: "bg-emerald-100 dark:bg-emerald-950",
      iconColor: "text-emerald-700 dark:text-emerald-300",
      accent: "border-l-emerald-600",
    },
    {
      title: "Documents",
      value: "3 Pending Requests",
      button: "Manage Documents",
      link: "/documents",
      icon: FileText,
      iconBg: "bg-stone-100 dark:bg-stone-800",
      iconColor: "text-stone-700 dark:text-stone-300",
      accent: "border-l-stone-600",
    },
    {
      title: "Performance",
      value: "Attrition Rate: 5%",
      button: "View Reports",
      link: "/performance",
      icon: BarChart3,
      iconBg: "bg-zinc-100 dark:bg-zinc-800",
      iconColor: "text-zinc-700 dark:text-zinc-300",
      accent: "border-l-zinc-600",
    },
  ];

  const categoryStyle = {
    holiday: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    policy: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    training: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    health: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    general: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      {/* Page Header — same style as Pending / Announcements */}
      <div className="mb-8 bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm flex items-center gap-4">
        <div className="w-11 h-11 bg-indigo-900 rounded-xl flex items-center justify-center text-white shrink-0">
          <LayoutDashboard size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">HR Dashboard</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Overview of employees, leaves, attendance and more
          </p>
        </div>
      </div>

      {/* Module Cards — clean card style like Employees page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <h2 className="text-base font-semibold text-[var(--text)]">{card.title}</h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{card.value}</p>
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
      <div className="mt-10">
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
            <Link href="/announcements">
              <button className="flex items-center gap-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:underline">
                View all
                <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {/* Announcement list */}
          <div className="p-5">
            {announcements.length === 0 ? (
              <div className="text-center py-10 text-sm text-[var(--text-muted)]">
                <Megaphone size={32} className="mx-auto mb-3 opacity-40" />
                <p>No announcements yet.</p>
                <Link href="/announcements" className="text-indigo-700 dark:text-indigo-400 font-medium hover:underline mt-1 inline-block">
                  Create one
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {announcements.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 flex flex-col"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-2xl leading-none">{item.emoji || "📣"}</span>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                          categoryStyle[item.category] || categoryStyle.general
                        }`}
                      >
                        {item.category || "general"}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-[var(--text)] leading-snug mb-1.5 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 flex-1">
                      {item.message}
                    </p>

                    {(item.event_date || item.created_at) && (
                      <p className="text-[11px] text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border)]">
                        {item.event_date
                          ? `📅 ${formatDate(item.event_date)}`
                          : formatDate(item.created_at)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
