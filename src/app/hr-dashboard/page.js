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
    { title: "Employees", value: "120 Active Employees", color: "bg-blue-400", button: "View Employees", link: "/employees" },
    { title: "Leave Requests", value: `${pendingCount} Pending Approvals`, color: "bg-purple-400", button: "Manage Leaves", link: "/pending" },
    { title: "Payroll", value: "Next cycle: 30 Apr", color: "bg-pink-400", button: "View Payroll", link: "/payroll" },
    { title: "Attendance", value: "Today: 115 Present, 5 Absent", color: "bg-green-400", button: "View Attendance", link: "/attendance" },
    { title: "Documents", value: "3 Pending Requests", color: "bg-yellow-400", button: "Manage Documents", link: "/documents" },
    { title: "Performance", value: "Attrition Rate: 5%", color: "bg-indigo-400", button: "View Reports", link: "/performance" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">

      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-6">HR Dashboard</h1>

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

      </div>

    </div>
  );
}