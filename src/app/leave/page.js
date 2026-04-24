'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase'; 

export default function LeaveForm() {
  const [formData, setFormData] = useState({
    name: '',
    fromDate: '',
    toDate: '',
    reason: '',
    status: 'pending',
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
      alert('Please fill all fields.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('leaves')
      .insert([
        {
          name: formData.name,
          from_date: formData.fromDate,
          to_date: formData.toDate,
          reason: formData.reason,
          status: 'pending',
        },
      ]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert('Error submitting leave. Please try again.');
      return;
    }

    console.log('Leave submitted:', data);
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      
      <main className="pt-16 flex justify-center items-start p-6 w-full">
        {submitted ? (
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">
              Leave Submitted!
            </h2>
            <p>Thank you, {formData.name}. Your leave request has been recorded.</p>
          </div>
        ) : (
          <form
            className="bg-white p-6 rounded shadow-md w-full max-w-xl space-y-4"
            onSubmit={handleSubmit}
          >
            <h2 className="text-2xl font-bold text-center mb-4">Leave Application</h2>

            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">From Date</label>
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">To Date</label>
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Reason</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Reason for leave"
              />
            </div>

            <button
              type="submit"
              className={`w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600 transition
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Leave'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}