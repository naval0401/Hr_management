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

        // 🔥 GROUP SE LOCATION
        let groups = token.groups || [];

        // clean "/nainital" → "nainital"
        const locations = groups.map(g =>
          g.replace("/", "").replace("-", " ")
        );

        // final display string
        const locationText =
          locations.length > 0 ? locations.join(", ") : "N/A";

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
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="pt-16 p-6 bg-white min-h-screen">

      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">

        <h2 className="text-2xl font-bold mb-6">Profile Details</h2>

        <div className="space-y-3 text-sm text-gray-700">

          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Roles:</strong> {user.roles.join(", ")}</p>
          <p><strong>Location:</strong> {user.location}</p>

        </div>

      </div>
    </div>
  );
}