"use client";

import Link from "next/link";
import { Wallet, IndianRupee, FileText } from "lucide-react";

export default function PayrollPage() {
  const sections = [
    {
      title: "Salary Structure",
      description: "Set and manage employee salary details (Gross, PF, Net)",
      href: "/payroll/salary-structure",
      icon: Wallet,
    },
    {
      title: "Advance Salary Requests",
      description: "Review and approve/reject employee advance requests",
      href: "/payroll/advance-requests",
      icon: IndianRupee,
    },
    {
      title: "Payslips",
      description: "Run payroll and generate payslips for employees",
      href: "/payroll/payslips",
      icon: FileText,
    },
  ];

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      {/* Page Header */}
      <div className="mb-8 bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm flex items-center gap-4">
        <div className="w-11 h-11 bg-indigo-900 rounded-xl flex items-center justify-center text-white shrink-0">
          <Wallet size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Payroll Management</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Manage salary structures, advances, and payslips
          </p>
        </div>
      </div>

      {/* NAVIGATION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6 hover:shadow-md hover:border-indigo-400 transition-all duration-200 cursor-pointer h-full">
                <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-indigo-700 dark:text-indigo-300" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text)] mb-1">
                  {section.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {section.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}