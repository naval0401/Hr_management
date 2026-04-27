'use client';

import { useState } from 'react';
import keycloak from '@/lib/keycloak';

export default function LeaveForm() {
  const [formData, setFormData] = useState({
    name: '',
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

    if (!formData.name || !formData.fromDate || !formData.toDate || !formData.reason) {
      alert("Please fill all fields");
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
        body: JSON.stringify({
          name: formData.name,
          fromDate: formData.fromDate,
          toDate: formData.toDate,
          reason: formData.reason,
        }),
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-6">

      <div className="w-full max-w-xl">

        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">

          {submitted ? (
            <div className="text-center">
              <div className="text-green-500 text-5xl mb-3">✔</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Leave Submitted!
              </h2>
              <p className="text-gray-600">
                Your request has been successfully recorded.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                Leave Application
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Write your reason..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg text-white font-semibold transition
                    ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
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