"use client";

import { useEffect, useState } from "react";
import { Megaphone, Plus, Pencil, Trash2, X, Pin } from "lucide-react";
import keycloak from "@/lib/keycloak";

const CATEGORIES = [
  { value: "holiday", label: "Holiday", emoji: "🎉" },
  { value: "policy", label: "Policy", emoji: "📢" },
  { value: "training", label: "Training", emoji: "📝" },
  { value: "health", label: "Health", emoji: "🏥" },
  { value: "general", label: "General", emoji: "📣" },
];

const AUDIENCES = [
  { value: "all", label: "Everyone" },
  { value: "user", label: "Employees only" },
  { value: "hr", label: "HR only" },
];

const EMPTY_FORM = {
  title: "",
  message: "",
  category: "general",
  emoji: "📣",
  target_audience: "all",
  event_date: "",
  is_pinned: false,
};

function formatDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isHR() {
  const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
  return roles.includes("hr") || roles.includes("admin");
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      if (!keycloak?.token) return;

      const res = await fetch("/api/announcements", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        setAnnouncements([]);
        return;
      }

      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (keycloak?.authenticated) {
      fetchAnnouncements();
    }
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData({
      title: item.title,
      message: item.message,
      category: item.category || "general",
      emoji: item.emoji || "📣",
      target_audience: item.target_audience || "all",
      event_date: item.event_date || "",
      is_pinned: Boolean(item.is_pinned),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormData(EMPTY_FORM);
  };

  const handleCategoryChange = (category) => {
    const match = CATEGORIES.find((c) => c.value === category);
    setFormData({
      ...formData,
      category,
      emoji: match?.emoji || "📣",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      alert("Please fill title and message");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/announcements", {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify(editing ? { id: editing.id, ...formData } : formData),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        alert(data.error || "Failed to save announcement");
        return;
      }

      closeForm();
      fetchAnnouncements();
    } catch (err) {
      setSubmitting(false);
      alert("Server error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;

    try {
      const res = await fetch(`/api/announcements?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete");
        return;
      }

      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert("Server error");
    }
  };

  const filtered = announcements.filter(
    (a) => filter === "all" || a.category === filter
  );

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">
      {/* Header */}
      <div className="mb-8 bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-900 rounded-full flex items-center justify-center text-white">
            <Megaphone size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Announcements</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Company updates, holidays, and important notices
            </p>
          </div>
        </div>

        {isHR() && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-800 transition"
          >
            <Plus size={16} />
            New Announcement
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterChip>
        {CATEGORIES.map((cat) => (
          <FilterChip
            key={cat.value}
            active={filter === cat.value}
            onClick={() => setFilter(cat.value)}
          >
            {cat.emoji} {cat.label}
          </FilterChip>
        ))}
      </div>

      {loading && (
        <p className="text-sm text-[var(--text-muted)]">Loading announcements...</p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-12 text-center">
          <Megaphone size={40} className="mx-auto mb-4 text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)]">No announcements yet.</p>
          {isHR() && (
            <button
              onClick={openCreate}
              className="mt-4 text-indigo-600 text-sm font-medium hover:underline"
            >
              Create the first one
            </button>
          )}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="relative bg-gradient-to-br from-indigo-900 via-sky-900 to-zinc-800 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            {item.is_pinned && (
              <span className="absolute top-3 right-3 bg-white/20 p-1 rounded-full">
                <Pin size={14} />
              </span>
            )}

            <div className="text-3xl mb-3">{item.emoji || "📣"}</div>

            <h3 className="text-lg font-semibold mb-2 pr-6">{item.title}</h3>
            <p className="text-sm opacity-90 flex-1">{item.message}</p>

            <div className="mt-4 pt-3 border-t border-white/20 text-xs opacity-80 space-y-1">
              {item.event_date && (
                <p>📅 {formatDate(item.event_date)}</p>
              )}
              <p>
                Posted {formatDate(item.created_at)}
                {item.created_by ? ` · ${item.created_by}` : ""}
              </p>
              <p className="capitalize">
                {item.category} · {item.target_audience === "all" ? "Everyone" : item.target_audience}
              </p>
            </div>

            {isHR() && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEdit(item)}
                  className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs transition"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center gap-1 bg-red-500/80 hover:bg-red-500 px-3 py-1.5 rounded-lg text-xs transition"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold">
                {editing ? "Edit Announcement" : "New Announcement"}
              </h2>
              <button onClick={closeForm} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <Field label="Title">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--background)] text-[var(--text)] text-sm"
                  placeholder="Holiday on 21 June"
                />
              </Field>

              <Field label="Message">
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--background)] text-[var(--text)] text-sm resize-none"
                  placeholder="Office closed for all departments..."
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--background)] text-[var(--text)] text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Audience">
                  <select
                    value={formData.target_audience}
                    onChange={(e) =>
                      setFormData({ ...formData, target_audience: e.target.value })
                    }
                    className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--background)] text-[var(--text)] text-sm"
                  >
                    {AUDIENCES.map((aud) => (
                      <option key={aud.value} value={aud.value}>
                        {aud.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Event date (optional)">
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--background)] text-[var(--text)] text-sm"
                />
              </Field>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_pinned}
                  onChange={(e) =>
                    setFormData({ ...formData, is_pinned: e.target.checked })
                  }
                  className="rounded"
                />
                Pin to top
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-800 disabled:opacity-50 transition"
                >
                  {submitting ? "Saving..." : editing ? "Update" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
        active
          ? "bg-indigo-900 text-white"
          : "bg-[var(--card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-indigo-400"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
