"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import keycloak from "@/lib/keycloak";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!keycloak?.authenticated) {
      router.push("/login");
      return;
    }

    const roles =
      keycloak.tokenParsed?.realm_access?.roles || [];

    if (roles.includes("hr")) {
      router.push("/hr-dashboard");
    } else {
      router.push("/user-dashboard");
    }
  }, [router]);

  return (
    <div className="p-6">
      Loading...
    </div>
  );
}