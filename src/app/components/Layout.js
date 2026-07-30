'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {

  const pathname = usePathname();
  const isLoginPage = pathname === "/login"; 

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

useEffect(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("sidebar");
    if (saved) setCollapsed(JSON.parse(saved));
  }
}, []);

useEffect(() => {
  if (typeof window !== "undefined") {
    localStorage.setItem("sidebar", JSON.stringify(collapsed));
  }
}, [collapsed]);

useEffect(() => {
  setMobileOpen(false);
}, [pathname]);

  return (
    <div className="flex">

      {!isLoginPage && <Sidebar collapsed={collapsed} mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen} />}

      <div
  className={`flex-1 transition-all duration-300
  ${
    !isLoginPage
      ? collapsed
        ? "ml-0 min-[621px]:ml-[80px]"
        : "ml-0 min-[621px]:ml-[250px]"
      : ""
  }`}
>
        {!isLoginPage && (
          <Header
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}
          />
        )}

        {children}

      </div>
    </div>
  );
}