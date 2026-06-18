'use client';

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function HRDashboard() {

  const [pendingCount, setPendingCount] = useState(0);

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

const cards = [
  { title: "Employees", value: "120 Active Employees", color: "bg-slate-700", button: "View Employees", link: "/employees" },
  { title: "Leave Requests", value: `${pendingCount} Pending Approvals`, color: "bg-indigo-900", button: "Manage Leaves", link: "/pending" },
  { title: "Payroll", value: "Next cycle: 30 Apr", color: "bg-cyan-700", button: "View Payroll", link: "/payroll" },
  { title: "Attendance", value: "Today: 115 Present, 5 Absent", color: "bg-emerald-700", button: "View Attendance", link: "/attendance" },
  { title: "Documents", value: "3 Pending Requests", color: "bg-stone-700", button: "Manage Documents", link: "/documents" },
  { title: "Performance", value: "Attrition Rate: 5%", color: "bg-zinc-700", button: "View Reports", link: "/performance" },
];



  return (
    <div className="min-h-screen p-4 md:p-8">

      {/* TITLE */}
      <h1 className="text-2xl  font-bold mb-6 text-[var(--text)]">HR Dashboard</h1>

      {/* CARDS (SAME DESIGN AS BEFORE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 border-[var(--border)] lg:grid-cols-3 gap-6">

        {cards.map((card) => (
          <div
            key={card.title}
            className={`${card.color} text-white rounded-lg shadow-md p-6 flex flex-col justify-between`}
          >
            <div>
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm">{card.value}</p>
            </div>

            <Link href={card.link}>
              <button className="mt-4 bg-white text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-200 transition">
                {card.button}
              </button>
            </Link>

          </div>
          
        ))}
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




      </div>

    </div>
    
  );
  
}