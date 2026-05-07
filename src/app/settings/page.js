"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [employees, setEmployees] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState("");

  // ================= FETCH =================
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase
        .from("employees")
        .select("*")
        .order("id", { ascending: false });

      setEmployees(data || []);
    };

    fetchEmployees();
  }, []);

  // ================= EDIT =================
  const handleEdit = (emp) => {
    setEditRow(emp.id);
    setFormData({
      employee_name: emp.employee_name || "",
      email: emp.email || "",
      phone: emp.phone || "",
      designation: emp.designation || "",
      department: emp.department || "",
      status: emp.status ?? true,
    });
  };

  // ================= SAVE =================
  const handleSave = async (id) => {
    const { error } = await supabase
      .from("employees")
      .update({
        employee_name: formData.employee_name,
        email: formData.email,
        phone: formData.phone,
        designation: formData.designation,
        department: formData.department,
        status: formData.status,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, ...formData } : emp
      )
    );

    setEditRow(null);

    setSuccess("Employee updated successfully 🎉");
    setTimeout(() => setSuccess(""), 2000);
  };

  return (
    <div className="pt-16 p-6 min-h-screen">

      {/* HEADER */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm ">
        <h1 className="text-xl font-bold">Employee Details</h1>
        <p className="text-sm text-gray-500">
          Manage employee information
        </p>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg shadow-sm">
          {success}
        </div>
      )}

      {/* HEADER ROW */}
      <div className="grid grid-cols-8 bg-blue-500 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow ">
        <div>ID</div>
        <div>Name</div>
        <div>Email</div>
        <div>Phone</div>
        <div>Designation</div>
        <div>Department</div>
        <div>Status</div>
        <div>Actions</div>
      </div>

      {/* EMPLOYEE CARDS */}
      <div className="space-y-4 mt-4">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white border border-gray-100 shadow-md rounded-xl p-4 grid grid-cols-8 items-center gap-4 hover:shadow-lg transition"
          >
            {/* ID */}
            <div className="text-xs break-all text-gray-500">
              {emp.id}
            </div>

            {/* NAME */}
            <div className="text-sm font-medium text-gray-800">
              {editRow === emp.id ? (
                <input
                  value={formData.employee_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employee_name: e.target.value,
                    })
                  }
                  className="border p-1 rounded w-full"
                />
              ) : (
                emp.employee_name
              )}
            </div>

            {/* EMAIL */}
            <div className="text-sm text-gray-600 truncate">
              {editRow === emp.id ? (
                <input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className="border p-1 rounded w-full"
                />
              ) : (
                emp.email
              )}
            </div>

            {/* PHONE */}
            <div className="text-sm text-gray-600">
              {editRow === emp.id ? (
                <input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  className="border p-1 rounded w-full"
                />
              ) : (
                emp.phone
              )}
            </div>

            {/* DESIGNATION */}
            <div className="text-sm text-gray-600">
              {editRow === emp.id ? (
                <input
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      designation: e.target.value,
                    })
                  }
                  className="border p-1 rounded w-full"
                />
              ) : (
                emp.designation
              )}
            </div>

            {/* DEPARTMENT */}
            <div className="text-sm text-gray-600">
              {editRow === emp.id ? (
                <input
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      department: e.target.value,
                    })
                  }
                  className="border p-1 rounded w-full"
                />
              ) : (
                emp.department
              )}
            </div>

            {/* STATUS */}
            <div>
              {editRow === emp.id ? (
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value === "true",
                    })
                  }
                  className="border p-1 rounded"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              ) : (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    emp.status
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {emp.status ? "Active" : "Inactive"}
                </span>
              )}
            </div>

            {/* ACTIONS */}
            <div>
              {editRow === emp.id ? (
                <button
                  onClick={() => handleSave(emp.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => handleEdit(emp)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}