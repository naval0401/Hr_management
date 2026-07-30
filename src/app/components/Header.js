"use client";

import { useState, useRef, useEffect } from "react";
import { PanelLeftCloseIcon, Menu, Moon, Sun, Bell } from "lucide-react";
import keycloak from "@/lib/keycloak";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header({ collapsed, setCollapsed, mobileOpen,
  setMobileOpen,}) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState({
    name: "",
    role: "",
    initials: "",
  });
  const [notifCount, setNotifCount] = useState(0); // NEW

  const dropdownRef = useRef(null);
  const router = useRouter();

  // click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!keycloak?.authenticated) return;

    const token = keycloak.tokenParsed;

    const fullName =
      token.name || token.preferred_username || "User";

    const roles = token.realm_access?.roles || [];
    const role = roles[0] || "User";

    const nameParts = fullName.split(" ");
    const first = nameParts[0]?.charAt(0) || "";
    const last =
      nameParts.length > 1
        ? nameParts[nameParts.length - 1]?.charAt(0)
        : nameParts[0]?.charAt(1) || "";

    const initials = (first + last).toUpperCase();

    setUser({
      name: fullName,
      role: role,
      initials: initials,
    });
  }, [keycloak?.authenticated]);

  // NEW: fetch unread notification count for the badge
  useEffect(() => {
    if (!keycloak?.authenticated) return;

    fetch("/api/notifications", {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const unread = data.filter((n) => !n.is_read).length;
          setNotifCount(unread);
        }
      })
      .catch((err) => console.error("Failed to fetch notif count:", err));
  }, [keycloak?.authenticated]);

  // INIT THEME
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";

    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // TOGGLE THEME
  const toggleDarkMode = () => {
    const newDark = !dark;

    setDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  return (
    <div className="flex justify-between bg-[var(--shell)] text-[var(--shell-text)] border-b border-[var(--shell-border)] px-5 h-16 items-center transition-all duration-300">

      {/* LEFT */}
      <div className="flex items-center gap-3">

        <>
  {/* Mobile Menu */}
  <div className="max-[620px]:flex hidden w-8 h-8 items-center justify-center rounded-md bg-[var(--shell-icon-bg)]">
    <Menu
      size={18}
      className="cursor-pointer"
      onClick={() => setMobileOpen(true)}
    />
  </div>

  {/* Desktop Collapse */}
  <div className="max-[620px]:hidden w-7 h-7 bg-[var(--shell-icon-bg)] rounded-full flex items-center justify-center text-[var(--shell-text)] hover:bg-[var(--shell-hover)] transition">
    <PanelLeftCloseIcon
      size={16}
      onClick={() => setCollapsed(!collapsed)}
      className="cursor-pointer"
    />
  </div>
</>

        <div className="hidden min-[621px]:block">
  <h2 className="text-lg font-semibold text-[var(--shell-text)]">
    VHC (HR)
  </h2>

  <p className="text-xs text-[var(--shell-text-muted)]">
    Dashboard
  </p>
</div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 min-[621px]:gap-6">

        {/* DARK MODE */}
        <div className="w-7 h-7 bg-[var(--shell-icon-bg)] rounded-full flex items-center justify-center hover:bg-[var(--shell-hover)] transition">
          {dark ? (
            <Sun
              size={16}
              onClick={toggleDarkMode}
              className="cursor-pointer text-[var(--shell-text)]"
            />
          ) : (
            <Moon
              size={16}
              onClick={toggleDarkMode}
              className="cursor-pointer text-[var(--shell-text)]"
            />
          )}
        </div>

        {/* NOTIFICATION */}
        <Link href="/notifications">
          <div className="relative w-7 h-7 bg-[var(--shell-icon-bg)] rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--shell-hover)] transition">
            <Bell size={16} className="text-[var(--shell-text)]" />
            {notifCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1 rounded-full min-w-[16px] text-center">
                {notifCount > 99 ? "99+" : notifCount}
              </span>
            )}
          </div>
        </Link>

        {/* USER */}
        <div className="relative" ref={dropdownRef}>

          <div
            onClick={() => setOpen(!open)}
            className="flex items-center cursor-pointer"
          >
            <div className="w-7 h-7 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {user.initials}
            </div>

            <div className="pl-2 hidden sm:block">
              <h3 className="text-sm font-medium text-[var(--shell-text)]">
                {user.name}
              </h3>

              <p className="text-xs text-[var(--shell-text-muted)]">
                {user.role}
              </p>
            </div>
          </div>

          {/* DROPDOWN */}
          {open && (
            <div className="absolute right-0 mt-2 w-36 bg-[var(--card)] border border-[var(--border)] shadow-lg rounded-lg z-50 text-[var(--text)]">

              <button
                onClick={() => router.push("/profile")}
                className="w-full text-left px-3 py-2 text-sm text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5"
              >
                Profile
              </button>

              {/* SETTINGS*/}
              {keycloak?.tokenParsed?.preferred_username === "dinesh" && (
                <button
                  onClick={() => router.push("/settings")}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Settings
                </button>
              )}

              <button
                onClick={() => {
                  keycloak.logout({
                    redirectUri: `${window.location.origin}/login`,
                  });
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-black/5 dark:hover:bg-white/5"
              >
                Sign out
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}