'use client';

import { LayoutDashboard, Calendar, UsersIcon, LucideSettings, ClipboardCheck, CalendarDays, Clock3, Megaphone, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import keycloak from "@/lib/keycloak";

export default function Sidebar({ collapsed }) {
  const pathname = usePathname();

  const isHR = keycloak?.tokenParsed?.realm_access?.roles?.includes("hr");

  return (
    <div
      className={`bg-[var(--shell)] text-[var(--shell-text)] border-r border-[var(--shell-border)] shadow-[2px_0_16px_rgba(0,0,0,0.06)] fixed top-0 h-full p-3 hidden md:block transition-all duration-300 
      ${collapsed ? "w-[80px]" : "w-[250px]"}`}
    >

      {/* LOGO */}
      <div className="flex items-center gap-2 border-b border-[var(--shell-border)] h-13 px-3 pb-3">
        <Image src="/logo.png" alt="logo" width={40} height={40} />

        {!collapsed && (
          <h2 className="text-[var(--shell-text)] font-semibold text-lg tracking-wide">
            VHC
          </h2>
        )}
      </div>

      {/* MENU */}
      <div className="mt-4 mb-6">

        <SidebarItem
          icon={<LayoutDashboard size={18} />}
          text="Dashboard"
          href="/"
          active={pathname === "/" || pathname.startsWith("/dashboard")}
          collapsed={collapsed}
        />

        {/* Employees page visible only for HR */}
        {isHR && (
          <SidebarItem
            icon={<UsersIcon size={18} />}
            text="Employees"
            href="/employees"
            active={pathname === "/employees"}
            collapsed={collapsed}
          />
        )}


        {/* Payroll page visible only for HR */}
        {isHR && (
          <SidebarItem
            icon={<WalletCards size={18} />}
            text="Payroll"
            href="/payroll"
            active={pathname === "/payroll"}
            collapsed={collapsed}
          />
        )}

{(keycloak?.tokenParsed?.realm_access?.roles?.includes("user") ||
  keycloak?.tokenParsed?.realm_access?.roles?.includes("manager") ||
  keycloak?.tokenParsed?.preferred_username === "vrish" ||
  keycloak?.tokenParsed?.preferred_username === "lalit-himanshu") && (
  <SidebarItem
    icon={<CalendarDays size={18} />}
    text="leave"
    href="/leave"
    active={pathname === "/leave"}
    collapsed={collapsed}
  />
)}

        <SidebarItem
          icon={<ClipboardCheck size={18} />}
          text="Pending"
          href="/pending"
          active={pathname === "/pending"}
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<Clock3 size={18} />}
          text="Attendance"
          href="/attendance"
          active={pathname === "/attendance"}
          collapsed={collapsed}
        />

        <SidebarItem
          icon={<Calendar size={18} />}
          text="Calendar"
          href="/calendar"
          active={pathname === "/calendar"}
          collapsed={collapsed}
        />

        {/* Announcements page visible only for HR */}
        {isHR && (
          <SidebarItem
            icon={<Megaphone size={18} />}
            text="Announcements"
            href="/announcements"
            active={pathname === "/announcements"}
            collapsed={collapsed}
          />
        )}

        {/* Settings page visible only for HR */}
        {isHR && (
          <SidebarItem
            icon={<LucideSettings size={18} />}
            text="settings"
            href="/settings"
            active={pathname === "/settings"}
            collapsed={collapsed}
          />
        )}
      </div>

    </div>
  );
}

const SidebarItem = ({ icon, text, href, active, collapsed }) => (
  <Link
    href={href}
    className={`flex items-center gap-2 h-10 px-3 rounded-lg cursor-pointer mb-1 transition-all duration-200
      ${
        active
          ? "bg-[var(--shell-active)] border-l-[3px] border-[var(--shell-accent)] text-[var(--shell-text)] font-medium shadow-sm"
          : "text-[var(--shell-text-muted)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text)]"
      }`}
  >
    {icon}
    {!collapsed && <span className="text-sm">{text}</span>}
  </Link>
);