"use client";

import { useState, useRef, useEffect } from "react";
import { PanelLeftCloseIcon, Moon, Sun, Bell } from "lucide-react";
import keycloak from "@/lib/keycloak";
import { useRouter } from "next/navigation";

export default function Header({ collapsed, setCollapsed }) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState({
    name: "",
    role: "",
    initials: "",
  });

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
    <div className="flex justify-between bg-[var(--background)] text-[var(--text)] border border-[var(--border)] px-5 h-16 items-center transition-all duration-300">

      {/* LEFT */}
      <div className="flex items-center gap-3">

        <div className="w-7 h-7 bg-blue-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-blue-600 dark:text-gray-300">
          <PanelLeftCloseIcon
            size={16}
            onClick={() => setCollapsed(!collapsed)}
            className="cursor-pointer"
          />
        </div>

        <div>
          <h2 className="text-lg text-[var(--text)]">
            Leave Details
          </h2>

          <p className="text-xs text-[var(--text)]">
            Dashboard
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">

        {/* DARK MODE */}
        <div className="w-7 h-7 bg-blue-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          {dark ? (
            <Sun
              size={16}
              onClick={toggleDarkMode}
              className="cursor-pointer text-gray-700 dark:text-gray-300"
            />
          ) : (
            <Moon
              size={16}
              onClick={toggleDarkMode}
              className="cursor-pointer text-gray-700 dark:text-gray-300"
            />
          )}
        </div>

        {/* NOTIFICATION */}
        <div className="relative w-7 h-7 bg-blue-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Bell size={16} className="text-gray-700 dark:text-gray-300" />

          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1 rounded-full">
            43
          </span>
        </div>

        {/* USER */}
        <div className="relative" ref={dropdownRef}>

          <div
            onClick={() => setOpen(!open)}
            className="flex items-center cursor-pointer"
          >
            <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
              {user.initials}
            </div>

            <div className="pl-1 hidden sm:block">
              <h3 className="text-sm text-[var(--text)]">
                {user.name}
              </h3>

              <p className="text-xs text-[var(--text-muted)]">
                {user.role}
              </p>
            </div>
          </div>

          {/* DROPDOWN */}
          {open && (
            <div className="absolute right-0 mt-2 w-32 bg-[var(--background)] border border-[var(--border)] shadow-md rounded-md z-50">

              <button
                onClick={() => router.push("/profile")}
                className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
              >
                Profile
              </button>

              {/* SETTINGS*/}
{keycloak?.tokenParsed?.preferred_username === "dinesh" && (
  <button
    onClick={() => router.push("/settings")}
    className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
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