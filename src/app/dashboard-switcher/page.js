"use client";

import { useEffect, useState } from "react";
import keycloak from "@/lib/keycloak";
import HRDashboard from "../hr-dashboard/page";
import UserDashboard from "../user-dashboard/page";

export default function Dashboard() {
  const [role, setRole] = useState(null);

  useEffect(() => {

    if (keycloak.authenticated === undefined) return;

    if (keycloak.authenticated === false) {
      window.location.href = "/login";
      return;
    }

    const roles = keycloak.tokenParsed?.realm_access?.roles || [];
    console.log("Roles:", roles); // yeh add karo
    console.log("Authenticated:", keycloak.authenticated); // yeh bhi

    if (roles.includes("hr") || roles.includes("admin")) {
  setRole("hr");
} else {
  setRole("user"); // manager + regular user dono yahan — correct
}

  }, []);

  if (role === null) {
    return <div className="p-6">Loading...</div>;
  }

  return role === "hr" ? <HRDashboard /> : <UserDashboard />;
}