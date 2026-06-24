'use client';

import { LayoutDashboard, Calendar, UsersIcon, LucideSettings, ClipboardCheck, CalendarDays, Clock3, Megaphone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import EmployeesPage from "../employees/page";
import keycloak from "@/lib/keycloak";
import LeaveForm from "../leave/page";
export default function Sidebar({ collapsed }) {
  const pathname = usePathname();

  return (
    <div
      className={`bg-[var(--background)] text-[var(--text)] border border-[var(--border)] fixed top-0 h-full p-3 hidden md:block transition-all duration-300 
      ${collapsed ? "w-[80px]" : "w-[250px]"}`}
    >

      {/* LOGO */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] h-13 px-3">
        <Image src="/logo.png" alt="logo" width={40} height={40} />

        {!collapsed && (
          <h2 className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
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
        
{/* Employees PAGE visible only for HR */}
{keycloak?.tokenParsed?.preferred_username === "dinesh"  && (
  <SidebarItem
    icon={<UsersIcon size={18} />}
    text="Employees"
    href="/employees"
    active={pathname === "/employees"}
    collapsed={collapsed}
  />
)}


{/* Employees PAGE visible only for HR */}
{keycloak?.tokenParsed?.preferred_username === "vrish"  && (
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
          icon={< Clock3 size={18} />}
          text="Attendance"
          href="/attendance"
          active={pathname === "/attendance"}
          collapsed={collapsed}
        />

        <SidebarItem
          icon={< Calendar size={18} />}
          text="Calendar"
          href="/calendar"
          active={pathname === "/calendar"}
          collapsed={collapsed}
        />

        <SidebarItem
          icon={<Megaphone size={18} />}
          text="Announcements"
          href="/announcements"
          active={pathname === "/announcements"}
          collapsed={collapsed}
        />

{/* SETTING PAGE visible only for HR */}
{keycloak?.tokenParsed?.preferred_username === "dinesh"  && (
 <SidebarItem
          icon={< LucideSettings size={18} />}
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
    className={`flex items-center gap-2 h-9 px-3 rounded cursor-pointer mb-1 transition-all
      ${
        active
          ? "bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-600 text-blue-600 "
          : "text-[var(--text)] hover:bg-white/5"
      }`}
  >
    {icon}
    {!collapsed && <span className="text-sm">{text}</span>}
  </Link>
);