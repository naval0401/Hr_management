"use client";
import { useEffect, useState } from "react";
import keycloak from "@/lib/keycloak";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // editingId tracks which department (if any) is currently being edited
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments", {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load departments:", err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      alert("Please enter a department name");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        alert(data.error || "Error adding department");
        return;
      }

      setName("");
      setDescription("");
      fetchDepartments();
    } catch (err) {
      setSubmitting(false);
      alert("Server error");
    }
  };

  // Starts edit mode for a specific department
  const startEdit = (dept) => {
    setEditingId(dept.id);
    setEditName(dept.name);
    setEditDescription(dept.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const saveEdit = async (id) => {
    if (!editName) {
      alert("Department name cannot be empty");
      return;
    }

    try {
      const res = await fetch("/api/departments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({ id, name: editName, description: editDescription }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error updating department");
        return;
      }

      cancelEdit();
      fetchDepartments();
    } catch (err) {
      alert("Server error");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this department? Employees assigned to it will be unassigned."
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/departments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error deleting department");
        return;
      }

      fetchDepartments();
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">
      <h2 className="text-2xl font-bold mb-4">Departments</h2>

      {/* ADD DEPARTMENT FORM */}
      <div className="bg-[var(--card)] border border-[var(--border)] shadow-xl rounded-2xl p-6 mb-6 max-w-xl">
        <h3 className="text-lg font-semibold mb-3">Add New Department</h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Department name (e.g. Sales)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-lg px-4 py-3 outline-none"
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-transparent border border-[var(--border)] text-[var(--text)] rounded-lg px-4 py-3 outline-none"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            {submitting ? "Adding..." : "Add Department"}
          </button>
        </form>
      </div>

      {/* DEPARTMENTS LIST */}
      <div className="bg-[var(--card)] border border-[var(--border)] shadow-sm rounded-2xl p-4">
        <h3 className="text-lg font-semibold mb-3">All Departments</h3>

        {loading && (
          <p className="text-sm text-[var(--text-muted)]">Loading...</p>
        )}

        {!loading && departments.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">
            No departments added yet.
          </p>
        )}

        <div className="space-y-2">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="p-3 rounded-lg border border-[var(--border)]"
            >
              {editingId === dept.id ? (
                // EDIT MODE
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2 outline-none"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-transparent border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2 outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(dept.id)}
                      className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-1.5 rounded-lg bg-gray-500 text-white text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{dept.name}</p>
                    {dept.description && (
                      <p className="text-sm text-[var(--text-muted)]">
                        {dept.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(dept)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}