"use client";

import { useState, useRef, useEffect } from "react";
import { PanelLeftCloseIcon, Moon, Bell } from "lucide-react";
import keycloak from "@/lib/keycloak";
import { useRouter } from "next/navigation";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({
    name: "",
    role: "",
    initials: "",
  });

  const dropdownRef = useRef(null);
  const router = useRouter();

  // Click outside dropdown close
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

  // Keycloak auth and user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!keycloak?.authenticated) {
          await keycloak.init({ onLoad: "check-sso" });
        }

        if (!keycloak.authenticated) {
          window.location.href = "/login";
          return;
        }

        const token = keycloak.tokenParsed;

        const fullName =
          token.name || token.preferred_username || "User";

        // roles
        const roles = token.realm_access?.roles || [];
        const role = roles[0] || "User";

        // initials (first + last letter)
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
      } catch (err) {
        console.error("Keycloak error:", err);
        window.location.href = "/login";
      }
    };

    loadUser();
  }, []);

  return (
    <div className="flex justify-between bg-gray-50 border border-gray-200 px-5 h-16 items-center">

      {/* LEFT */}
      <div>
        <h2 className="text-lg text-gray-900">Leave Details</h2>
        <p className="text-xs text-gray-400 hidden sm:block">
          Dashboard
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">

        {/* ICONS */}
        <div className="flex items-center gap-3">

          <Icon>
            <PanelLeftCloseIcon size={16} />
          </Icon>

          <Icon>
            <Moon size={16} />
          </Icon>

          <div className="relative">
            <Icon>
              <Bell size={16} />
            </Icon>

            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1 rounded-full">
              43
            </span>
          </div>

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
              <h3 className="text-sm">{user.name}</h3>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          </div>

          {/* DROPDOWN */}
          {open && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 shadow-md rounded-md z-50">
              <button
                onClick={() => router.push("/profile")}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              >
                Profile
              </button>

              <button
                onClick={() => {
                  keycloak.logout({
                    redirectUri: `${window.location.origin}/login`,
                  });
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-500"
              >
                Logout
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

const Icon = ({ children }) => (
  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
    {children}
  </div>
);