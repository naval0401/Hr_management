"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2, X, Users, UserCheck, UserX } from "lucide-react";
import keycloak from "@/lib/keycloak";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_name: "",
    email: "",
    phone: "",
    employee_id: "",
    department: "",
    designation: "",
    date_of_joining: "",
    status: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // view/edit modal
  const [viewEmployee, setViewEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === true).length,
    inactive: employees.filter((e) => e.status === false).length,
  };

  // ---------- FETCH ----------
  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams();
      if (departmentFilter !== "all") params.set("department", departmentFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/employees?${params.toString()}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.log("FETCH ERROR:", err);
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("DEPARTMENTS FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!keycloak?.authenticated) return;
      try {
        await keycloak.updateToken(30);
        fetchDepartments();
      } catch (err) {
        console.log("KEYCLOAK ERROR:", err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (keycloak?.authenticated) {
      fetchEmployees();
    }
  }, [departmentFilter, statusFilter]);

  // ---------- ADD ----------
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee_name || !formData.email) {
      alert("Name and email are required");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        alert(data.error || "Error adding employee");
        return;
      }

      setFormData({
        employee_name: "",
        email: "",
        phone: "",
        employee_id: "",
        department: "",
        designation: "",
        date_of_joining: "",
        status: true,
      });
      setShowAddForm(false);
      fetchEmployees();
    } catch (err) {
      setSubmitting(false);
      alert("Server error");
    }
  };

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this employee?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/employees", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error deleting employee");
        return;
      }

      fetchEmployees();
    } catch (err) {
      alert("Server error");
    }
  };

  // ---------- VIEW / EDIT MODAL ----------
  const openView = (emp) => {
    setViewEmployee(emp);
    setActiveTab("personal");
    setIsEditing(false);
  };

  const closeView = () => {
    setViewEmployee(null);
    setIsEditing(false);
    setEditData({});
  };

  const startEditInModal = (emp) => {
  const source = emp || viewEmployee; // modal ke andar se bhi kaam kare
  setEditData({
    employee_name: source.employee_name || "",
    email: source.email || "",
    phone: source.phone || "",
    employee_id: source.employee_id || "",
    department: source.department || "",
    designation: source.designation || "",
    date_of_joining: source.date_of_joining || "",
    status: source.status,
    date_of_birth: source.date_of_birth || "",
    address: source.address || "",
    emergency_contact_name: source.emergency_contact_name || "",
    emergency_contact_phone: source.emergency_contact_phone || "",
    blood_group: source.blood_group || "",
    employment_type: source.employment_type || "",
    skills: source.skills || "",
    documents_notes: source.documents_notes || "",
  });
  setIsEditing(true);
};

  const cancelEditInModal = () => {
    setIsEditing(false);
    setEditData({});
  };

  const saveEditInModal = async () => {
    try {
      // Postgres date columns reject empty string, convert to null
      const cleanedData = {
        ...editData,
        date_of_birth: editData.date_of_birth === "" ? null : editData.date_of_birth,
        date_of_joining: editData.date_of_joining === "" ? null : editData.date_of_joining,
      };

      const res = await fetch("/api/employees", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({ id: viewEmployee.id, ...cleanedData }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error updating employee");
        return;
      }

      // Update the modal's displayed data and the main list
      const updated = { ...viewEmployee, ...cleanedData };
      setViewEmployee(updated);
      setIsEditing(false);
      fetchEmployees();
    } catch (err) {
      alert("Server error");
    }
  };

  const visibleEmployees = employees.filter((emp) =>
    emp.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      {/* Page Header */}
      <div className="mb-8 bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm flex items-center gap-4">
        <div className="w-11 h-11 bg-indigo-900 rounded-xl flex items-center justify-center text-white shrink-0">
          <Users size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Employees Dashboard</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Manage and view all employees
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-[var(--card)] border border-[var(--border)] border-l-4 border-l-slate-600 rounded-xl shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <Users size={20} className="text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Total Employees</p>
            <p className="text-3xl font-bold mt-1 text-[var(--text)]">{stats.total}</p>
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] border-l-4 border-l-emerald-600 rounded-xl shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
            <UserCheck size={20} className="text-emerald-700 dark:text-emerald-300" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Active Employees</p>
            <p className="text-3xl font-bold mt-1 text-[var(--text)]">{stats.active}</p>
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] border-l-4 border-l-red-600 rounded-xl shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center shrink-0">
            <UserX size={20} className="text-red-700 dark:text-red-300" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Inactive Employees</p>
            <p className="text-3xl font-bold mt-1 text-[var(--text)]">{stats.inactive}</p>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-3 items-center mb-4 bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 outline-none text-sm text-[var(--text)]"
        />

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 outline-none text-sm text-[var(--text)]"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 outline-none text-sm text-[var(--text)]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-900 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Add Employee
        </button>
      </div>

      {/* ADD EMPLOYEE FORM */}
      {showAddForm && (
        <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-xl shadow-sm mb-6">
          <h2 className="text-base font-semibold text-[var(--text)] mb-4">Add Employee</h2>

          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Employee Name"
              value={formData.employee_name}
              onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
              className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 outline-none text-[var(--text)]"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 outline-none text-[var(--text)]"
            />
            <input
              type="text"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 outline-none text-[var(--text)]"
            />
            <input
              type="text"
              placeholder="Employee ID"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 outline-none text-[var(--text)]"
            />

            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 outline-none text-[var(--text)]"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Designation"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 outline-none text-[var(--text)]"
            />

            <input
              type="date"
              value={formData.date_of_joining}
              onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
              className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 outline-none text-[var(--text)]"
            />

            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value === "true" })}
              className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 outline-none text-[var(--text)]"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <div className="flex gap-3 md:col-span-2">
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

      {/* EMPLOYEE TABLE */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-[var(--text)]">Employees Directory</h2>
        <p className="text-xs text-[var(--text-muted)]">Search, filter and manage employee records</p>
      </div>

      <div className="grid grid-cols-7 bg-indigo-900 text-white px-6 py-3 rounded-xl text-sm font-semibold mb-3 shadow-sm">
        <div>Name</div>
        <div>Email</div>
        <div>Phone</div>
        <div>Department</div>
        <div>Designation</div>
        <div>Status</div>
        <div>Actions</div>
      </div>

      {loading && <p className="text-sm text-[var(--text-muted)]">Loading...</p>}

      <div className="space-y-3">
        {visibleEmployees.map((emp) => (
          <div
            key={emp.id}
            className="grid grid-cols-7 bg-[var(--card)] border border-[var(--border)] px-6 py-4 rounded-xl items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="font-medium text-[var(--text)]">{emp.employee_name || "-"}</div>
            <div className="truncate text-[var(--text-muted)]">{emp.email || "-"}</div>
            <div className="text-[var(--text-muted)]">{emp.phone || "-"}</div>
            <div>
              {emp.department && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {emp.department}
                </span>
              )}
            </div>
            <div className="text-[var(--text-muted)]">{emp.designation || "-"}</div>
            <div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  emp.status
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300"
                }`}
              >
                {emp.status ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openView(emp)}
                className="bg-[var(--background)] border border-[var(--border)] hover:border-indigo-400 text-[var(--text-muted)] hover:text-[var(--text)] p-1.5 rounded-lg transition"
                title="View"
              >
                <Eye size={16} />
              </button>
              <button
  onClick={() => {
    openView(emp);
    startEditInModal(emp); // ✅ direct emp pass karo, setTimeout hatao
  }}
  className="bg-indigo-900 hover:bg-indigo-800 text-white p-1.5 rounded-lg transition"
  title="Edit"
>
  <Pencil size={16} />
</button>
              <button
                onClick={() => handleDelete(emp.id)}
                className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW / EDIT MODAL */}
      {viewEmployee && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] text-[var(--text)] border border-[var(--border)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl [&_input]:text-[var(--text)] [&_input]:bg-[var(--background)] [&_input]:border-[var(--border)] [&_textarea]:text-[var(--text)] [&_textarea]:bg-[var(--background)] [&_select]:text-[var(--text)] [&_select]:bg-[var(--background)]">

            <button
              onClick={closeView}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <X size={20} />
            </button>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[var(--text)]">
                {isEditing ? "Edit Employee" : "Employee Details"}
              </h2>
              {!isEditing && (
                <button
                  onClick={startEditInModal}
                  className="flex items-center gap-1 bg-indigo-900 hover:bg-indigo-800 text-white px-3 py-1.5 rounded-lg text-sm transition"
                >
                  <Pencil size={14} /> Edit
                </button>
              )}
            </div>

            {!isEditing ? (
              <>
                {/* VIEW MODE HEADER */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-900 text-white flex items-center justify-center text-xl font-bold">
                    {viewEmployee.employee_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text)]">{viewEmployee.employee_name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{viewEmployee.designation}</p>
                    <div className="flex gap-2 mt-1">
                      {viewEmployee.department && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {viewEmployee.department}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          viewEmployee.status
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                            : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300"
                        }`}
                      >
                        {viewEmployee.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4 text-[var(--text)]">
                  <p>📧 {viewEmployee.email || "-"}</p>
                  <p>📞 {viewEmployee.phone || "-"}</p>
                  <p>📅 Joined: {viewEmployee.date_of_joining || "-"}</p>
                  <p>🆔 ID: {viewEmployee.employee_id || "-"}</p>
                </div>

                {/* TABS */}
                <div className="flex border-b border-[var(--border)] mb-4">
                  {["personal", "employment", "documents"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium capitalize ${
                        activeTab === tab
                          ? "border-b-2 border-indigo-600 text-indigo-600"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {tab === "personal" ? "Personal Info" : tab === "employment" ? "Employment" : "Documents & Skills"}
                    </button>
                  ))}
                </div>

                {activeTab === "personal" && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--text-muted)]">Date of Birth</p>
                      <p className="font-medium text-[var(--text)]">{viewEmployee.date_of_birth || "Not added"}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)]">Address</p>
                      <p className="font-medium text-[var(--text)]">{viewEmployee.address || "Not added"}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)]">Emergency Contact</p>
                      <p className="font-medium text-[var(--text)]">
                        {viewEmployee.emergency_contact_name
                          ? `${viewEmployee.emergency_contact_name}, ${viewEmployee.emergency_contact_phone || ""}`
                          : "Not added"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)]">Blood Group</p>
                      <p className="font-medium text-[var(--text)]">{viewEmployee.blood_group || "Not added"}</p>
                    </div>
                  </div>
                )}

                {activeTab === "employment" && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--text-muted)]">Department</p>
                      <p className="font-medium text-[var(--text)]">{viewEmployee.department || "Not added"}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)]">Designation</p>
                      <p className="font-medium text-[var(--text)]">{viewEmployee.designation || "Not added"}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)]">Date of Joining</p>
                      <p className="font-medium text-[var(--text)]">{viewEmployee.date_of_joining || "Not added"}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)]">Employment Type</p>
                      <p className="font-medium text-[var(--text)]">{viewEmployee.employment_type || "Not added"}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)]">Status</p>
                      <p className="font-medium text-[var(--text)]">{viewEmployee.status ? "Active" : "Inactive"}</p>
                    </div>
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="text-sm">
                    <p className="text-[var(--text-muted)] mb-1">Skills</p>
                    <p className="font-medium text-[var(--text)] mb-4">{viewEmployee.skills || "Not added"}</p>

                    <p className="text-[var(--text-muted)] mb-1">Documents Notes</p>
                    <p className="font-medium text-[var(--text)]">{viewEmployee.documents_notes || "Not added"}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* EDIT MODE — TABS STILL WORK, BUT INPUTS INSTEAD OF TEXT */}
                <div className="flex border-b border-[var(--border)] mb-4">
                  {["personal", "employment", "documents"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium capitalize ${
                        activeTab === tab
                          ? "border-b-2 border-indigo-600 text-indigo-600"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {tab === "personal" ? "Personal Info" : tab === "employment" ? "Employment" : "Documents & Skills"}
                    </button>
                  ))}
                </div>

                {/* BASIC FIELDS — always visible while editing, regardless of tab */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <input
                    placeholder="Employee Name"
                    value={editData.employee_name}
                    onChange={(e) => setEditData({ ...editData, employee_name: e.target.value })}
                    className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                  />
                  <input
                    placeholder="Email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                  />
                  <input
                    placeholder="Phone"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                  />
                  <input
                    placeholder="Employee ID"
                    value={editData.employee_id}
                    onChange={(e) => setEditData({ ...editData, employee_id: e.target.value })}
                    className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                  />
                </div>

                {activeTab === "personal" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[var(--text-muted)]">Date of Birth</label>
                      <input
                        type="date"
                        value={editData.date_of_birth}
                        onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)]">Blood Group</label>
                      <input
                        placeholder="e.g. O+"
                        value={editData.blood_group}
                        onChange={(e) => setEditData({ ...editData, blood_group: e.target.value })}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-[var(--text-muted)]">Address</label>
                      <input
                        placeholder="Full address"
                        value={editData.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)]">Emergency Contact Name</label>
                      <input
                        placeholder="Contact person name"
                        value={editData.emergency_contact_name}
                        onChange={(e) => setEditData({ ...editData, emergency_contact_name: e.target.value })}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)]">Emergency Contact Phone</label>
                      <input
                        placeholder="Contact phone"
                        value={editData.emergency_contact_phone}
                        onChange={(e) => setEditData({ ...editData, emergency_contact_phone: e.target.value })}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "employment" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[var(--text-muted)]">Department</label>
                      <select
                        value={editData.department}
                        onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                      >
                        <option value="">Select</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)]">Designation</label>
                      <input
                        value={editData.designation}
                        onChange={(e) => setEditData({ ...editData, designation: e.target.value })}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)]">Date of Joining</label>
                      <input
                        type="date"
                        value={editData.date_of_joining}
                        onChange={(e) => setEditData({ ...editData, date_of_joining: e.target.value })}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)]">Employment Type</label>
                      <input
                        placeholder="Full-time / Contract / Intern"
                        value={editData.employment_type}
                        onChange={(e) => setEditData({ ...editData, employment_type: e.target.value })}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)]">Status</label>
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value === "true" })}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[var(--text-muted)]">Skills</label>
                      <input
                        placeholder="e.g. React, Node.js, Figma"
                        value={editData.skills}
                        onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)]">Documents Notes</label>
                      <textarea
                        rows={3}
                        placeholder="Notes about submitted documents"
                        value={editData.documents_notes}
                        onChange={(e) => setEditData({ ...editData, documents_notes: e.target.value })}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--text)]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={saveEditInModal}
                    className="bg-indigo-900 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={cancelEditInModal}
                    className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}