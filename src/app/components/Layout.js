'use client';

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {

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

      <Sidebar collapsed={collapsed} />

      <div
        className={`flex-1 transition-all duration-300
        ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}
      >

        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        {children}

      </div>
    </div>
  );
}