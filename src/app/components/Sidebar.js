'use client';

import { LayoutDashboard, CalendarCheck, Clock  } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname(); // current path

  return (
    <div className="w-[250px] bg-white border border-gray-200 fixed top-0 h-full p-3 hidden md:block">

      <div className="flex items-center gap-2 border-b border-gray-200 h-13 px-3">
        <h2 className="text-blue-600 font-semibold text-lg">VHC</h2>
      </div>

      <div className="mt-4 mb-6">
        <SidebarItem
          icon={<LayoutDashboard size={18} />}
          text="Dashboard"
          href="/"
          active={pathname === "/" || pathname.startsWith("/dashboard")}
        />

        <SidebarItem
          icon={<CalendarCheck size={18} />}
          text="Leave"
          href="/leave"
          active={pathname === "/leave"}
        />
        <SidebarItem
          icon={<Clock size={18} />}
          text="Pending"
          href="/pending"
          active={pathname === "/pending"}
        />
      </div>

    </div>
  );
}

const SidebarItem = ({ icon, text, href, active }) => (
  <Link
    href={href}
    className={`flex items-center gap-2 h-9 px-3 rounded cursor-pointer mb-1
      ${active ? "bg-blue-50 border-l-4 border-blue-600 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
  >
    {icon}
    <span className="text-sm">{text}</span>
  </Link>
);