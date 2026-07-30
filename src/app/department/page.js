import React from 'react'
import { Eye, Pencil, Trash2, X, Users, UserCheck, UserX, Building2 } from "lucide-react";

function page() {
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
            Manage and view all Teams
          </p>
        </div>
      </div>

    </div>
  )
}

export default page