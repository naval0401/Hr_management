"use client";

import { useEffect, useState } from "react";
import keycloak from "@/lib/keycloak";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        if (!keycloak?.authenticated) {
          window.location.href = "/login";
          return;
        }

        const token = keycloak.tokenParsed;

        const name = token.name || token.preferred_username;
        const email = token.email || "N/A";
        const username = token.preferred_username || "N/A";

        const roles = token.realm_access?.roles || [];

        let groups = token.groups || [];

        const locations = groups.map(g =>
          g.replace(/\//g, ", ").replace(/-/g, " ")
        );

        const locationText =
          locations.length > 0
            ? locations.join(", ").replace(/^, /, "").trim()
            : "not available";

        setUser({
          name,
          email,
          username,
          roles,
          location: locationText,
        });

      } catch (err) {
        console.error(err);
      }
    };

    loadUser();
  }, []);

  if (!user) {
    return (
      <div className="p-6 bg-[var(--background)] text-[var(--text)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      <div className="max-w-xl mx-auto bg-[var(--card)] border border-[var(--border)] p-6 rounded-xl shadow-md">

        <h2 className="text-2xl font-bold mb-6 text-[var(--text)]">
          Profile Details
        </h2>

        <div className="space-y-3 text-sm text-[var(--text-muted)]">

          <p><span className=" font-semibold">Name:</span> {user.name}</p>
          <p><span className=" font-semibold">Username:</span> {user.username}</p>
          <p><span className=" font-semibold">Email:</span> {user.email}</p>
          <p><span className=" font-semibold">Roles:</span> {user.roles.join(", ")}</p>
          <p><span className=" font-semibold">Location:</span> {user.location}</p>

        </div>

      </div>

    </div>
  );
}