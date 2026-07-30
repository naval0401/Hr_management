'use client';

import {
  LayoutDashboard,
  Calendar,
  UsersIcon,
  LucideSettings,
  ClipboardCheck,
  CalendarDays,
  Clock3,
  Megaphone,
  WalletCards,
  Files,
  FilesIcon,
  Building2,
  X,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import keycloak from "@/lib/keycloak";

export default function Sidebar({
  collapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const pathname = usePathname();

  const isHR =
    keycloak?.tokenParsed?.realm_access?.roles?.includes("hr");

  return (
    <>
      {/* ===================== DESKTOP SIDEBAR ===================== */}

      <div
        className={`bg-[var(--shell)] text-[var(--shell-text)]
        border-r border-[var(--shell-border)]
        shadow-[2px_0_16px_rgba(0,0,0,0.06)]
        fixed top-0 h-full p-3
        hidden min-[621px]:block
        transition-all duration-300
        ${collapsed ? "w-[80px]" : "w-[250px]"}`}
      >
        {/* LOGO */}

        <div className="flex items-center gap-2 border-b border-[var(--shell-border)] h-13 px-3 pb-3">
          <Image
            src="/logo.png"
            alt="logo"
            width={40}
            height={40}
          />

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
            active={
              pathname === "/" ||
              pathname.startsWith("/dashboard")
            }
            collapsed={collapsed}
          />

          {isHR && (
            <SidebarItem
              icon={<UsersIcon size={18} />}
              text="Employees"
              href="/employees"
              active={pathname === "/employees"}
              collapsed={collapsed}
            />
          )}

          {isHR && (
            <SidebarItem
              icon={<WalletCards size={18} />}
              text="Payroll"
              href="/payroll"
              active={pathname === "/payroll"}
              collapsed={collapsed}
            />
          )}

          {isHR && (
            <SidebarItem
              icon={<Files size={18} />}
              text="Documents"
              href="/documents"
              active={pathname === "/documents"}
              collapsed={collapsed}
            />
          )}

          {(keycloak?.tokenParsed?.realm_access?.roles?.includes("user") ||
            keycloak?.tokenParsed?.realm_access?.roles?.includes("manager") ||
            keycloak?.tokenParsed?.preferred_username === "vrish" ||
            keycloak?.tokenParsed?.preferred_username === "lalit-himanshu") && (
            <SidebarItem
              icon={<CalendarDays size={18} />}
              text="Leave"
              href="/leave"
              active={pathname === "/leave"}
              collapsed={collapsed}
            />
          )}

          {(keycloak?.tokenParsed?.realm_access?.roles?.includes("user") ||
            keycloak?.tokenParsed?.realm_access?.roles?.includes("manager") ||
            keycloak?.tokenParsed?.preferred_username === "vrish" ||
            keycloak?.tokenParsed?.preferred_username === "lalit-himanshu") && (
            <SidebarItem
              icon={<FilesIcon size={18} />}
              text="Document Request"
              href="/document-request"
              active={pathname === "/document-request"}
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

          <SidebarItem
            icon={<Building2 size={18} />}
            text="Organization"
            href="/organization"
            active={pathname === "/organization"}
            collapsed={collapsed}
          />

          {isHR && (
            <SidebarItem
              icon={<Megaphone size={18} />}
              text="Announcements"
              href="/announcements"
              active={pathname === "/announcements"}
              collapsed={collapsed}
            />
          )}

          {isHR && (
            <SidebarItem
              icon={<LucideSettings size={18} />}
              text="Settings"
              href="/settings"
              active={pathname === "/settings"}
              collapsed={collapsed}
            />
          )}

        </div>

      </div>

      {/* ================= MOBILE OVERLAY ================= */}

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 max-[620px]:block hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= MOBILE SIDEBAR ================= */}

      <div
        className={`
          fixed top-0 left-0
          z-50
          h-screen
          w-[270px]
          bg-[#23479b]
          text-white
          transform transition-transform duration-300
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
          max-[620px]:block hidden
        `}
      >

        {/* HEADER */}

        <div className="flex items-center justify-between px-4 py-5 border-b border-white/20">

          <Image
            src="/logo.png"
            alt="logo"
            width={38}
            height={38}
          />

          <button
            onClick={() => setMobileOpen(false)}
          >
            <X size={22} />
          </button>

        </div>

        {/* MOBILE MENU */}

        <div className="p-3 overflow-y-auto h-[calc(100vh-74px)]">
                    <MobileSidebarItem
            icon={<LayoutDashboard size={18} />}
            text="Dashboard"
            href="/"
            active={pathname === "/" || pathname.startsWith("/dashboard")}
            onClick={() => setMobileOpen(false)}
          />

          {isHR && (
            <MobileSidebarItem
              icon={<UsersIcon size={18} />}
              text="Employees"
              href="/employees"
              active={pathname === "/employees"}
              onClick={() => setMobileOpen(false)}
            />
          )}

          {isHR && (
            <MobileSidebarItem
              icon={<WalletCards size={18} />}
              text="Payroll"
              href="/payroll"
              active={pathname === "/payroll"}
              onClick={() => setMobileOpen(false)}
            />
          )}

          {isHR && (
            <MobileSidebarItem
              icon={<Files size={18} />}
              text="Documents"
              href="/documents"
              active={pathname === "/documents"}
              onClick={() => setMobileOpen(false)}
            />
          )}

          {(keycloak?.tokenParsed?.realm_access?.roles?.includes("user") ||
            keycloak?.tokenParsed?.realm_access?.roles?.includes("manager") ||
            keycloak?.tokenParsed?.preferred_username === "vrish" ||
            keycloak?.tokenParsed?.preferred_username === "lalit-himanshu") && (
            <MobileSidebarItem
              icon={<CalendarDays size={18} />}
              text="Leave"
              href="/leave"
              active={pathname === "/leave"}
              onClick={() => setMobileOpen(false)}
            />
          )}

          {(keycloak?.tokenParsed?.realm_access?.roles?.includes("user") ||
            keycloak?.tokenParsed?.realm_access?.roles?.includes("manager") ||
            keycloak?.tokenParsed?.preferred_username === "vrish" ||
            keycloak?.tokenParsed?.preferred_username === "lalit-himanshu") && (
            <MobileSidebarItem
              icon={<FilesIcon size={18} />}
              text="Document Request"
              href="/document-request"
              active={pathname === "/document-request"}
              onClick={() => setMobileOpen(false)}
            />
          )}

          <MobileSidebarItem
            icon={<ClipboardCheck size={18} />}
            text="Pending"
            href="/pending"
            active={pathname === "/pending"}
            onClick={() => setMobileOpen(false)}
          />

          <MobileSidebarItem
            icon={<Clock3 size={18} />}
            text="Attendance"
            href="/attendance"
            active={pathname === "/attendance"}
            onClick={() => setMobileOpen(false)}
          />

          <MobileSidebarItem
            icon={<Calendar size={18} />}
            text="Calendar"
            href="/calendar"
            active={pathname === "/calendar"}
            onClick={() => setMobileOpen(false)}
          />

          <MobileSidebarItem
            icon={<Building2 size={18} />}
            text="Organization"
            href="/organization"
            active={pathname === "/organization"}
            onClick={() => setMobileOpen(false)}
          />

          {isHR && (
            <MobileSidebarItem
              icon={<Megaphone size={18} />}
              text="Announcements"
              href="/announcements"
              active={pathname === "/announcements"}
              onClick={() => setMobileOpen(false)}
            />
          )}

          {isHR && (
            <MobileSidebarItem
              icon={<LucideSettings size={18} />}
              text="Settings"
              href="/settings"
              active={pathname === "/settings"}
              onClick={() => setMobileOpen(false)}
            />
          )}

        </div>

      </div>

    </>
  );
}

const SidebarItem = ({
  icon,
  text,
  href,
  active,
  collapsed,
}) => (
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
    {!collapsed && (
      <span className="text-sm">
        {text}
      </span>
    )}
  </Link>
);

const MobileSidebarItem = ({
  icon,
  text,
  href,
  active,
  onClick,
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1
      ${
        active
          ? "bg-white/20 text-white"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
  >
    <span>{icon}</span>

    <span className="text-[15px] font-medium">
      {text}
    </span>
  </Link>
);