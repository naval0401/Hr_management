"use client";

import { useEffect, useState } from "react";
import { Wallet, Pencil } from "lucide-react";
import keycloak from "@/lib/keycloak";

export default function SalaryStructurePage() {
  const [structures, setStructures] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    gross_salary: "",
    pf_deduction: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const fetchStructures = async () => {
    try {
      const res = await fetch("/api/salary-structure", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      const data = await res.json();
      setStructures(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.log("FETCH ERROR:", err);
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("EMPLOYEES FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!keycloak?.authenticated) return;
      try {
        await keycloak.updateToken(30);
        fetchStructures();
        fetchEmployees();
      } catch (err) {
        console.log("KEYCLOAK ERROR:", err);
      }
    };
    init();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee_id || !formData.gross_salary) {
      alert("Please select an employee and enter gross salary");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/salary-structure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({
          employee_id: formData.employee_id,
          gross_salary: Number(formData.gross_salary),
          pf_deduction: formData.pf_deduction ? Number(formData.pf_deduction) : 0,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        alert(data.error || "Error saving salary structure");
        return;
      }

      setFormData({ employee_id: "", gross_salary: "", pf_deduction: "" });
      setShowAddForm(false);
      fetchStructures();
    } catch (err) {
      setSubmitting(false);
      alert("Server error");
    }
  };

  const startEdit = (s) => {
    setEditId(s.id);
    setEditData({
      gross_salary: s.gross_salary,
      pf_deduction: s.pf_deduction,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch("/api/salary-structure", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({
          id,
          gross_salary: Number(editData.gross_salary),
          pf_deduction: Number(editData.pf_deduction) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error updating");
        return;
      }

      cancelEdit();
      fetchStructures();
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      {/* Page Header */}
      <div className="mb-8 bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-indigo-900 rounded-xl flex items-center justify-center text-white shrink-0">
            <Wallet size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--text)]">Salary Structure</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Set Gross, PF deduction and Net salary for employees
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-900 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Set Salary
        </button>
      </div>

      {/* ADD FORM */}
      {showAddForm && (
        <div className="bg-[var(--card)] border border-[var(--border)] shadow-sm rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-[var(--text)] mb-4">Set Salary Structure</h2>

          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="bg-[var(--background)] border border-[var(--border)] text-[var(--text)] rounded-lg p-2 outline-none"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.employee_name}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Gross Salary (e.g. 17800)"
              value={formData.gross_salary}
              onChange={(e) => setFormData({ ...formData, gross_salary: e.target.value })}
              className="bg-[var(--background)] border border-[var(--border)] text-[var(--text)] rounded-lg p-2 outline-none"
            />

            <input
              type="number"
              placeholder="PF Deduction (e.g. 2800)"
              value={formData.pf_deduction}
              onChange={(e) => setFormData({ ...formData, pf_deduction: e.target.value })}
              className="bg-[var(--background)] border border-[var(--border)] text-[var(--text)] rounded-lg p-2 outline-none"
            />

            <div className="flex gap-3 md:col-span-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-900 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LIST */}
      <div className="grid grid-cols-5 bg-indigo-900 text-white px-6 py-3 rounded-xl text-sm font-semibold mb-3 shadow-sm">
        <div>Employee</div>
        <div>Gross Salary</div>
        <div>PF Deduction</div>
        <div>Net Salary</div>
        <div>Actions</div>
      </div>

      {loading && <p className="text-sm text-[var(--text-muted)]">Loading...</p>}

      <div className="space-y-3">
        {structures.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-5 bg-[var(--card)] border border-[var(--border)] px-6 py-4 rounded-xl items-center gap-2 shadow-sm"
          >
            <div className="font-medium text-[var(--text)]">
              {s.employees?.employee_name || "Unknown"}
            </div>

            {editId === s.id ? (
              <>
                <input
                  type="number"
                  value={editData.gross_salary}
                  onChange={(e) => setEditData({ ...editData, gross_salary: e.target.value })}
                  className="bg-[var(--background)] border border-[var(--border)] text-[var(--text)] rounded p-1 text-sm"
                />
                <input
                  type="number"
                  value={editData.pf_deduction}
                  onChange={(e) => setEditData({ ...editData, pf_deduction: e.target.value })}
                  className="bg-[var(--background)] border border-[var(--border)] text-[var(--text)] rounded p-1 text-sm"
                />
                <div className="text-[var(--text-muted)] text-sm">
                  ₹{(Number(editData.gross_salary || 0) - Number(editData.pf_deduction || 0)).toFixed(0)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(s.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-[var(--text-muted)]">₹{s.gross_salary}</div>
                <div className="text-[var(--text-muted)]">₹{s.pf_deduction}</div>
                <div className="font-semibold text-green-700 dark:text-green-300">₹{s.net_salary}</div>
                <div>
                  <button
                    onClick={() => startEdit(s)}
                    className="bg-indigo-900 hover:bg-indigo-800 text-white p-1.5 rounded-lg transition"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}