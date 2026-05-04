"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import keycloak from "@/lib/keycloak";

export default function AttendanceRouter() {
  const router = useRouter();

  useEffect(() => {
    if (!keycloak?.authenticated) return;

    const roles =
      keycloak?.tokenParsed?.realm_access?.roles || [];

    if (roles.includes("hr")) {
      router.replace("/attendance/hr");   // HR page
    } else {
      router.replace("/attendance/user"); // User page
    }
  }, [keycloak?.authenticated]);

  return null;
}