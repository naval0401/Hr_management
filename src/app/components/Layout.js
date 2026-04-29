'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {

  const pathname = usePathname();
  const isLoginPage = pathname === "/login"; 

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar", JSON.stringify(collapsed));
  }, [collapsed]);

  return (
    <div className="flex">

      {!isLoginPage && <Sidebar collapsed={collapsed} />}

      <div
        className={`flex-1 transition-all duration-300
        ${!isLoginPage && (collapsed ? "ml-[80px]" : "ml-[250px]")}`}
      >
        {!isLoginPage && (
          <Header
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        )}

        {children}

      </div>
    </div>
  );
}