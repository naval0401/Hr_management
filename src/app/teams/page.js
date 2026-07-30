"use client"
import React, { useState, useEffect } from 'react'
import { Eye, Pencil, Trash2, X, Users, UserCheck, UserX, Building2 } from "lucide-react";
import keycloak from "@/lib/keycloak";
import { useRouter } from "next/navigation";


function page() {

    const [showAddTeam, setShowAddTeam] = useState(false);
    const [teams, setTeams] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const router = useRouter();
    const [formData, setFormData] = useState({
        id: null,
        team_name: "",
        team_lead: "",
        department: "",
        status: "Active",
        description: "",
        members: [],
    });

    const fetchTeams = async () => {
        const res = await fetch("/api/teams");
        const data = await res.json();

        if (Array.isArray(data)) {
            setTeams(data);
        }
    };

    const fetchEmployees = async () => {
        try {
            if (!keycloak?.authenticated) return;

            await keycloak.updateToken(30);

            const res = await fetch("/api/employees", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${keycloak.token}`,
                },
            });

            const data = await res.json();

            if (res.ok) {
                setEmployees(Array.isArray(data) ? data : []);
            } else {
                console.log("Employee API Error:", data);
            }
        } catch (err) {
            console.log("FETCH EMPLOYEES ERROR:", err);
        }
    };

    useEffect(() => {
        const init = async () => {
            if (!keycloak?.authenticated) return;

            try {
                await keycloak.updateToken(30);

                fetchTeams();
                fetchEmployees();
            } catch (err) {
                console.log("KEYCLOAK ERROR:", err);
            }
        };

        init();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const isEdit = formData.id !== null;

            const res = await fetch("/api/teams", {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.ok && result.success) {

                setFormData({
                    id: null,
                    team_name: "",
                    team_lead: "",
                    department: "",
                    status: "Active",
                    description: "",
                    members: [],
                });

                setShowAddTeam(false);

                fetchTeams();

            } else {
                alert(result.error || result.message || "Failed to save team");
            }

        } catch (error) {
            console.log("SAVE TEAM ERROR:", error);
        }
    };

    const handleEdit = (team) => {

        setFormData({
            id: team.id,
            team_name: team.team_name,
            team_lead: team.team_lead,
            department: team.department,
            status: team.status,
            description: team.description || "",
            members: team.members || [],
        });

        setShowAddTeam(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this team?")) return;

        try {
            const res = await fetch("/api/teams", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Team deleted successfully");
                fetchTeams();
            } else {
                alert(data.error || data.message);
            }
        } catch (err) {
            console.log(err);
        }
    };



    return (
        <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

            {/* Page Header */}
            <div className="mb-8 bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 bg-indigo-900 rounded-xl flex items-center justify-center text-white shrink-0">
                    <Users size={22} />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-[var(--text)]">Team Dashboard</h1>
                    <p className="text-xs text-[var(--text-muted)]">
                        Manage and view all employees
                    </p>
                </div>
                <div className=' absolute right-20'>
                    <button
                        onClick={() => setShowAddTeam(!showAddTeam)}
                        className="bg-indigo-900 hover:bg-indigo-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
                    >
                        + Create Team
                    </button>
                </div>

            </div>

            {/* stats */}

            {showAddTeam && (
                <div className="mb-6 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-semibold text-[var(--text)]">
                            Create Team
                        </h2>

                        <button
                            type="button"
                            onClick={() => setShowAddTeam(false)}
                            className="text-[var(--text-muted)] hover:text-red-500"
                        >
                            <X size={20} />
                        </button>
                    </div>


                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Team Name */}
                        <input
                            type="text"
                            placeholder="Team Name"
                            value={formData.team_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    team_name: e.target.value,
                                })
                            }
                            className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 outline-none"
                            required
                        />

                        {/* Team Lead */}
                        <input
                            type="text"
                            placeholder="Team Lead"
                            value={formData.team_lead}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    team_lead: e.target.value,
                                })
                            }
                            className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 outline-none"
                            required
                        />

                        {/* Department */}
                        <input
                            type="text"
                            placeholder="Department"
                            value={formData.department}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    department: e.target.value,
                                })
                            }
                            className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 outline-none"
                            required
                        />

                        {/* Status */}
                        <select
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    status: e.target.value,
                                })
                            }
                            className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 outline-none"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>

                        {/* Description */}
                        <textarea
                            rows={3}
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            className="md:col-span-2 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 outline-none"
                        />

                        {/* Select Team Members */}

                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-medium">
                                Select Members
                            </label>

                            <select
                                defaultValue=""
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                onChange={(e) => {
                                    const value = e.target.value;

                                    if (
                                        value &&
                                        !formData.members.includes(value)
                                    ) {
                                        setFormData({
                                            ...formData,
                                            members: [...formData.members, value],
                                        });
                                    }

                                    e.target.value = "";
                                }}
                            >
                                <option value="">Select Member</option>

                                {employees
                                    .filter(
                                        (emp) =>
                                            !formData.members.includes(
                                                String(emp.id)
                                            )
                                    )
                                    .map((emp) => (
                                        <option
                                            key={emp.id}
                                            value={String(emp.id)}
                                        >
                                            {emp.employee_name}
                                        </option>
                                    ))}
                            </select>

                            {/* Selected Members */}

                            <div className="flex flex-wrap gap-2 mt-3">
                                {formData.members.map((id) => {
                                    const emp = employees.find(
                                        (e) => String(e.id) === id
                                    );

                                    return (
                                        <div
                                            key={id}
                                            className="flex items-center gap-2 bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full"
                                        >
                                            <span>{emp?.employee_name}</span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setFormData({
                                                        ...formData,
                                                        members: formData.members.filter(
                                                            (m) => m !== id
                                                        ),
                                                    })
                                                }
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="md:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                className="bg-indigo-900 hover:bg-indigo-800 text-white px-5 py-2 rounded-lg"
                            >
                                Save Team
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowAddTeam(false)}
                                className="border border-[var(--border)] px-5 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}



            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {teams.map((team) => (
                    <div
                        key={team.id}
                        onClick={() => setSelectedTeam(team)}
                        className="bg-[var(--card)] border border-[var(--border)] border-l-4 border-l-indigo-600 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                                <Users
                                    size={20}
                                    className="text-indigo-700 dark:text-indigo-300"
                                />    </div>

                            {/* Team Details */}
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold text-[var(--text)]">
                                    {team.team_name}
                                </h2>

                                <p className="text-sm text-[var(--text-muted)] mt-1">
                                    Team Lead: <span className="font-medium">{team.team_lead}</span>
                                </p>

                                <p className="text-sm text-[var(--text-muted)]">
                                    Department:{" "}
                                    <span className="font-medium">{team.department}</span>
                                </p>

                                <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-2">
                                    {team.description || "No description available"}
                                </p>

                            </div>

                        </div>
                        {/* Bottom Actions */}
                        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-[var(--border)]">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(team)
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            >
                                <Pencil size={16} />
                                <span className="text-sm">Edit</span>
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(team.id)
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                            >
                                <Trash2 size={16} />
                                <span className="text-sm">Delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                {selectedTeam && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

                        <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b">

                                <div className="flex items-center gap-4">

                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                        <Users className="text-indigo-700" size={24} />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold">
                                            {selectedTeam.team_name}
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Team Details
                                        </p>
                                    </div>

                                </div>


                                <button
                                    onClick={() => setSelectedTeam(null)}
                                    className="w-9 h-9 rounded-full hover:bg-red-100 text-red-500 text-xl"
                                >
                                    ×
                                </button>

                            </div>



                            {/* Body */}
                            <div className="p-6 space-y-5">


                                {/* Info Cards */}

                                <div className="grid grid-cols-2 gap-4">


                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500">
                                            Team Lead
                                        </p>

                                        <p className="font-semibold mt-1">
                                            {selectedTeam.team_lead}
                                        </p>
                                    </div>


                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500">
                                            Department
                                        </p>

                                        <p className="font-semibold mt-1">
                                            {selectedTeam.department}
                                        </p>
                                    </div>


                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500">
                                            Status
                                        </p>

                                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium
                            ${selectedTeam.status === "Active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }
                        `}>
                                            {selectedTeam.status}
                                        </span>

                                    </div>


                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500">
                                            Members
                                        </p>

                                        <p className="font-semibold mt-1">
                                            {selectedTeam.members?.length || 0}
                                        </p>
                                    </div>


                                </div>



                                {/* Description */}

                                <div>

                                    <h3 className="font-semibold mb-2">
                                        Description
                                    </h3>

                                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
                                        {selectedTeam.description ||
                                            "No description available"}
                                    </p>

                                </div>



                                {/* Members */}

                                <div>

                                    <h3 className="font-semibold mb-3">
                                        Team Members
                                    </h3>


                                    <div className="space-y-3 max-h-64 overflow-y-auto">


                                        {
                                            selectedTeam.members?.length > 0 ? (

                                                selectedTeam.members.map((id) => {

                                                    const emp = employees.find(
                                                        e => String(e.id) === String(id)
                                                    );


                                                    return (

                                                        <div
                                                            key={id}
                                                            onClick={() => {
    setSelectedTeam(null);
    router.push(`/organization?id=${emp.id}`);
}}
                                                            className="
                                flex items-center gap-4
                                p-3 rounded-xl
                                border
                                cursor-pointer
                                hover:bg-indigo-50
                                transition
                                "
                                                        >


                                                            <div className="
                                    w-10 h-10 rounded-full
                                    bg-indigo-900
                                    text-white
                                    flex items-center justify-center
                                    font-semibold
                                ">
                                                                {emp?.employee_name?.charAt(0)}
                                                            </div>


                                                            <div>

                                                                <p className="font-medium">
                                                                    {emp?.employee_name}
                                                                </p>

                                                                <p className="text-sm text-gray-500">
                                                                    {emp?.designation || "Employee"}
                                                                </p>

                                                            </div>


                                                        </div>

                                                    )

                                                })


                                            ) : (

                                                <div className="text-center py-6 text-gray-500">
                                                    No Members Added
                                                </div>

                                            )

                                        }


                                    </div>

                                </div>


                            </div>



                            {/* Footer */}

                            <div className="border-t p-4 flex justify-end">

                                <button
                                    onClick={() => setSelectedTeam(null)}
                                    className="px-5 py-2 rounded-lg bg-indigo-900 text-white hover:bg-indigo-800 "
                                >
                                    Close
                                </button>

                            </div>


                        </div>

                    </div>
                )}
            </div>

            

        </div>
    )
}

export default page