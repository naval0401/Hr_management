"use client";

import { useEffect, useState } from "react";
import { IndianRupee } from "lucide-react";
import keycloak from "@/lib/keycloak";

export default function AdvanceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/advance-salary", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.log("FETCH ERROR:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!keycloak?.authenticated) return;
      try {
        await keycloak.updateToken(30);
        fetchRequests();
      } catch (err) {
        console.log("KEYCLOAK ERROR:", err);
      }
    };
    init();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch("/api/advance-salary", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error updating request");
        return;
      }

      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert("Server error");
    }
  };

  const statusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "approved") {
      return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
    }
    if (s === "rejected") {
      return "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300";
    }
    return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
  };

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      {/* Page Header */}
      <div className="mb-8 bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm flex items-center gap-4">
        <div className="w-11 h-11 bg-indigo-900 rounded-xl flex items-center justify-center text-white shrink-0">
          <IndianRupee size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Advance Salary Requests</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Review and approve employee advance salary requests
          </p>
        </div>
      </div>

      {loading && <p className="text-sm text-[var(--text-muted)]">Loading...</p>}

      {!loading && requests.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">No requests yet.</p>
      )}

      <div className="space-y-3">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-4 flex justify-between items-center gap-4"
          >
            <div>
              <p className="font-semibold text-[var(--text)]">
                {req.employee_name || "Unknown"}{" "}
                <span className="text-xs font-normal text-[var(--text-muted)]">
                  ({req.department || "-"})
                </span>
              </p>
              <p className="font-medium text-[var(--text)] mt-1">
                ₹{req.advance_amount} for {req.month}
              </p>
              <p className="text-sm text-[var(--text-muted)]">{req.reason}</p>
              {req.total_salary != null && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Total Salary: ₹{req.total_salary} | Remaining: ₹{req.remaining_salary}
                </p>
              )}
            </div>

            <select
              value={req.status || "pending"}
              onChange={(e) => handleStatusChange(req.id, e.target.value)}
              className={`px-3 py-1.5 text-sm rounded-full shadow-sm cursor-pointer border-none outline-none font-medium ${statusBadge(req.status)}`}
            >
              <option value="pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}