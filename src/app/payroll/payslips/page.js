"use client";

import { useEffect, useState } from "react";
import { FileText, Play } from "lucide-react";
import keycloak from "@/lib/keycloak";

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runMonth, setRunMonth] = useState("");
  const [running, setRunning] = useState(false);

  const fetchPayslips = async () => {
    try {
      const res = await fetch("/api/payslips", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      const data = await res.json();
      setPayslips(Array.isArray(data) ? data : []);
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
        fetchPayslips();
      } catch (err) {
        console.log("KEYCLOAK ERROR:", err);
      }
    };
    init();
  }, []);

  const handleRunPayroll = async () => {
    if (!runMonth) {
      alert("Please select a month first");
      return;
    }

    const confirmed = window.confirm(
      `Run payroll for ${runMonth}? This will generate payslips for all employees with a salary structure.`
    );
    if (!confirmed) return;

    setRunning(true);

    try {
      const res = await fetch("/api/payslips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({ month: runMonth }),
      });

      const data = await res.json();
      setRunning(false);

      if (!res.ok) {
        alert(data.error || "Error running payroll");
        return;
      }

      alert(`Payroll run complete! ${data.length} payslip(s) generated.`);
      fetchPayslips();
    } catch (err) {
      setRunning(false);
      alert("Server error");
    }
  };

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      {/* Page Header */}
      <div className="mb-8 bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm flex items-center gap-4">
        <div className="w-11 h-11 bg-indigo-900 rounded-xl flex items-center justify-center text-white shrink-0">
          <FileText size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Payslips</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Run payroll and view generated payslips
          </p>
        </div>
      </div>

      {/* RUN PAYROLL */}
      <div className="bg-[var(--card)] border border-[var(--border)] shadow-sm rounded-xl p-6 mb-8 flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs text-[var(--text-muted)]">Select Month</label>
          <input
            type="month"
            value={runMonth}
            onChange={(e) => setRunMonth(e.target.value)}
            className="block bg-[var(--background)] border border-[var(--border)] text-[var(--text)] rounded-lg px-4 py-3 outline-none"
          />
        </div>

        <button
          onClick={handleRunPayroll}
          disabled={running}
          className="flex items-center gap-2 bg-indigo-900 hover:bg-indigo-800 text-white px-5 py-3 rounded-lg text-sm font-medium transition"
        >
          <Play size={16} />
          {running ? "Running..." : "Run Payroll"}
        </button>
      </div>

      {/* PAYSLIPS LIST */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-[var(--text)]">Generated Payslips</h2>
        <p className="text-xs text-[var(--text-muted)]">History of all payroll runs</p>
      </div>

      <div className="grid grid-cols-6 bg-indigo-900 text-white px-6 py-3 rounded-xl text-sm font-semibold mb-3 shadow-sm">
        <div>Employee</div>
        <div>Month</div>
        <div>Gross</div>
        <div>PF</div>
        <div>Advance Deducted</div>
        <div>Net Pay</div>
      </div>

      {loading && <p className="text-sm text-[var(--text-muted)]">Loading...</p>}

      {!loading && payslips.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">No payslips generated yet.</p>
      )}

      <div className="space-y-3">
        {payslips.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-6 bg-[var(--card)] border border-[var(--border)] px-6 py-4 rounded-xl items-center gap-2 shadow-sm"
          >
            <div className="font-medium text-[var(--text)]">
              {p.employees?.employee_name || "Unknown"}
            </div>
            <div className="text-[var(--text-muted)]">
              {new Date(p.month).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </div>
            <div className="text-[var(--text-muted)]">₹{p.gross_salary}</div>
            <div className="text-[var(--text-muted)]">₹{p.pf_deduction}</div>
            <div className="text-yellow-700 dark:text-yellow-300">₹{p.advance_deducted || 0}</div>
            <div className="font-semibold text-green-700 dark:text-green-300">₹{p.net_pay}</div>
          </div>
        ))}
      </div>
    </div>
  );
}