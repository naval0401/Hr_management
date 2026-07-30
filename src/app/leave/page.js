'use client';

import { useState } from 'react';
import keycloak from '@/lib/keycloak';

export default function LeaveForm() {

  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ name remove from validation
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      alert("From date cannot be after To date");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify(formData), // ✅ no name भेजना
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.error || "Error submitting leave");
        return;
      }

      setSubmitted(true);

    } catch (err) {
      setLoading(false);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)] text-[var(--text)] transition-colors duration-300">

      <div className="w-full max-w-xl">

        <div className="bg-[var(--card)] border border-[var(--border)] shadow-xl rounded-2xl p-8">

          {submitted ? (
            <div className="text-center">
              <div className="text-green-500 text-5xl mb-3">✔</div>
              <h2 className="text-2xl font-bold text-green-500 mb-2">
                Leave Submitted!
              </h2>
              <p className="text-[var(--text-muted)]">
                Your request has been successfully recorded.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-[var(--text)] text-center mb-6">
                Leave Application
              </h2>

              {/* ✅ Optional: user name दिखाओ */}
              <p className="text-sm text-[var(--text-muted)] mb-4 text-center">
                Logged in as: {keycloak.tokenParsed?.name}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleChange}
                  className="w-full bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-lg px-4 py-3 outline-none dark:text-white dark:bg-gray-500"
                  style={{ colorScheme: "dark" }}
                />

                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  min={formData.fromDate}
                  onChange={handleChange}
                  className="w-full bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-lg px-4 py-3 outline-none dark:text-white dark:bg-gray-500"
                  style={{ colorScheme: "dark" }}
                />

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Write your reason..."
                  rows={4}
                  className="w-full bg-transparent border border-[var(--border)] text-[var(--text)] rounded-lg px-4 py-3 outline-none"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
                >
                  {loading ? "Submitting..." : "Submit Leave"}
                </button>

              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
}