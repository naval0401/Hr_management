'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle, FileText, Calendar } from 'lucide-react';
import keycloak from '@/lib/keycloak';

export default function PendingPage() {
  const [leaves, setLeaves] = useState([]);
  const [docRequests, setDocRequests] = useState([]);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (keycloak?.authenticated && keycloak?.token) {
      fetchRole();
      fetchLeaves();
      fetchDocRequests();
    }
  }, [keycloak?.authenticated, keycloak?.token]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (keycloak?.authenticated) {
        keycloak.updateToken(30).catch(() => {
          console.log("Token expired");
          keycloak.logout();
        });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRole = async () => {
    const res = await fetch("/api/me", {
      headers: { Authorization: `Bearer ${keycloak.token}` },
    });
    const data = await res.json();
    setUserRole(data?.role || "user");
  };

  const fetchLeaves = async () => {
    try {
      if (!keycloak?.token) return;
      const res = await fetch("/api/pending", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      const data = await res.json();
      if (!res.ok) { setLeaves([]); return; }
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLeaves([]);
    }
  };

  const fetchDocRequests = async () => {
    try {
      if (!keycloak?.token) return;
      const res = await fetch("/api/document-request", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      const data = await res.json();
      setDocRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setDocRequests([]);
    }
  };

  const handleLeaveStatus = async (id, newStatus) => {
    try {
      const res = await fetch("/api/pending", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) { console.error(data.error); return; }
      setLeaves((prev) =>
        prev.map((leave) =>
          leave.id === id ? { ...leave, hr_status: newStatus, status: newStatus } : leave
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocStatus = async (id, newStatus) => {
    try {
      const res = await fetch("/api/document-request", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setDocRequests((prev) =>
          prev.map((req) => req.id === id ? { ...req, status: newStatus } : req)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dono ko merge karo aur created_at se sort karo
  const allItems = [
    ...leaves.map((l) => ({ ...l, _type: "leave" })),
    ...docRequests.map((d) => ({ ...d, _type: "document" })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "approved") return "bg-green-500 text-white";
    if (s === "rejected") return "bg-red-500 text-white";
    return "bg-yellow-500 text-black";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} day ago`;
  };

  return (
    <div className="pt-16 p-6 bg-[var(--background)] text-[var(--text)] min-h-screen">

      {/* Page Header */}
      <div className="mb-8 bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm flex items-center gap-4">
        <div className="w-11 h-11 bg-indigo-900 rounded-xl flex items-center justify-center text-white shrink-0">
          <Clock size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Pending Requests</h1>
          <p className="text-xs text-[var(--text-muted)]">
            All pending approvals — {allItems.length} total
          </p>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
            <CheckCircle size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No pending requests!</p>
          </div>
        ) : (
          allItems.map((item) => (
            <div
              key={`${item._type}-${item.id}`}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition flex items-center justify-between gap-4"
            >
              {/* Left — Icon + Info */}
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item._type === "leave"
                  ? "bg-indigo-100 dark:bg-indigo-900/30"
                  : "bg-green-100 dark:bg-green-900/30"
                  }`}>
                  {item._type === "leave"
                    ? <Calendar size={18} className="text-indigo-700 dark:text-indigo-400" />
                    : <FileText size={18} className="text-green-700 dark:text-green-400" />
                  }
                </div>

                <div>
                  {item._type === "leave" ? (
                    <>
                      <p className="text-sm font-semibold text-[var(--text)]">
                        {item.name} applied for leave
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {item.reason} · {formatDate(item.from_date)} → {formatDate(item.to_date)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-[var(--text)]">
                        {item.employees?.employee_name || "Employee"} requested {item.document_type}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {item.reason}
                      </p>
                    </>
                  )}
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {timeAgo(item.created_at)}
                  </p>
                </div>
              </div>

              {/* Right — Status Select */}
              <div className="shrink-0">
  {item._type === "leave" ? (
    userRole === "manager" || userRole === "hr" || userRole === "admin" ? (
      item.status?.toLowerCase() === "pending" ? (
        <select
          value={item.status}
          onChange={(e) => handleLeaveStatus(item.id, e.target.value)}
          className={`px-3 py-1.5 text-sm rounded-full shadow-sm cursor-pointer border-none outline-none font-medium ${getStatusColor(item.status)}`}
        >
          <option value="pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      ) : (
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}
        >
          {item.status}
        </span>
      )
    ) : (
      <span
        className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}
      >
        {item.status}
      </span>
    )
  ) : (
    item.status?.toLowerCase() === "pending" ? (
      <select
        value={item.status}
        onChange={(e) => handleDocStatus(item.id, e.target.value)}
        className={`px-3 py-1.5 text-sm rounded-full shadow-sm cursor-pointer border-none outline-none font-medium ${getStatusColor(item.status)}`}
      >
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    ) : (
      <span
        className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}
      >
        {item.status}
      </span>
    )
  )}
</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}