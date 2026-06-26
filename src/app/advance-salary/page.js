"use client";

import { useEffect, useState } from "react";
import { IndianRupee } from "lucide-react";
import keycloak from "@/lib/keycloak";

export default function AdvanceSalaryPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    month: "",
    total_salary: "",
    advance_amount: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.month || !formData.advance_amount) {
      alert("Please fill month and advance amount");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/advance-salary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({
  month: formData.month ? `${formData.month}-01` : null,
  total_salary: formData.total_salary ? Number(formData.total_salary) : null,
  advance_amount: Number(formData.advance_amount),
  reason: formData.reason,
}),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        alert(data.error || "Error submitting request");
        return;
      }

      setFormData({ month: "", total_salary: "", advance_amount: "", reason: "" });
      fetchRequests();
    } catch (err) {
      setSubmitting(false);
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
          <h1 className="text-xl font-semibold text-[var(--text)]">Advance Salary Request</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Request an advance against your upcoming salary
          </p>
        </div>
      </div>

      {/* REQUEST FORM */}
      <div className="bg-[var(--card)] border border-[var(--border)] shadow-sm rounded-xl p-6 mb-8 max-w-xl">
        <h2 className="text-base font-semibold text-[var(--text)] mb-4">New Request</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-[var(--text-muted)]">Month</label>
            <input
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--text)] rounded-lg px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--text-muted)]">Your Total Salary (optional)</label>
            <input
              type="number"
              placeholder="e.g. 17800"
              value={formData.total_salary}
              onChange={(e) => setFormData({ ...formData, total_salary: e.target.value })}
              className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--text)] rounded-lg px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--text-muted)]">Advance Amount Needed</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={formData.advance_amount}
              onChange={(e) => setFormData({ ...formData, advance_amount: e.target.value })}
              className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--text)] rounded-lg px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--text-muted)]">Reason</label>
            <textarea
              placeholder="Why do you need this advance?"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--text)] rounded-lg px-4 py-3 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg font-semibold text-white bg-indigo-900 hover:bg-indigo-800 transition"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>

      {/* MY REQUESTS LIST */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-[var(--text)]">My Requests</h2>
        <p className="text-xs text-[var(--text-muted)]">History of your advance salary requests</p>
      </div>

      {loading && <p className="text-sm text-[var(--text-muted)]">Loading...</p>}

      {!loading && requests.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">No requests yet.</p>
      )}

      <div className="space-y-3">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-4 flex justify-between items-center"
          >
            <div>
  <p className="font-semibold text-[var(--text)]">
    {req.employee_name} <span className="text-xs text-[var(--text-muted)]">({req.department})</span>
  </p>
  <p className="font-medium text-[var(--text)] mt-1">
    ₹{req.advance_amount} for {req.month}
  </p>
  <p className="text-sm text-[var(--text-muted)]">{req.reason}</p>
              {req.remaining_salary != null && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Remaining salary after advance: ₹{req.remaining_salary}
                </p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(req.status)}`}>
              {req.status || "pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}