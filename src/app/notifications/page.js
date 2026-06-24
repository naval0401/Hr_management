"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import keycloak from "@/lib/keycloak";

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/notifications", {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load notifications:", err);
        setLoading(false);
      });
  }, []);

  // Click handler: leave-type notifications go to /pending,
  // others can be extended later (attendance, document, etc.)
const handleClick = async (notification) => {
  // Mark as read in the database
  try {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${keycloak.token}`,
      },
      body: JSON.stringify({ id: notification.id }),
    });

    // Update local state so the UI reflects it immediately
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, is_read: true } : n
      )
    );
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
  }

  if (notification.type === "leave") {
    router.push("/pending");
  }
};

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
            onClick={() => handleClick(n)}
            className={`p-4 rounded shadow cursor-pointer hover:opacity-80 transition ${
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
  {timeAgo(n.created_at)}
</p>
          </div>
        ))}
      </div>
    </div>
  );
}