"use client";
import { useEffect, useState } from "react";
import keycloak from "@/lib/keycloak";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications", {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data,"him");
        setNotifications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load notifications:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      )}

      {!loading && notifications.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No notifications yet.
        </p>
      )}

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded shadow ${
              n.type === "leave"
                ? "bg-yellow-100 dark:bg-yellow-900"
                : n.type === "attendance"
                ? "bg-blue-100 dark:bg-blue-900"
                : n.type === "document"
                ? "bg-green-100 dark:bg-green-900"
                : "bg-gray-100 dark:bg-slate-800"
            }`}
          >
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm">{n.message}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(n.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}