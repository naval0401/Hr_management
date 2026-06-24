"use client";

export default function SettingsPage() {
  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        App settings and preferences will appear here.
      </p>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 flex items-center justify-center">
        <p className="text-[var(--text-muted)]">
          🚧 More settings coming soon.
        </p>
      </div>
    </div>
  );
}