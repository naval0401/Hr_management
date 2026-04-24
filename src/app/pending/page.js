'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function PendingPage() {
    const [leaves, setLeaves] = useState([]);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        const { data, error } = await supabase
            .from('leaves')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        setLeaves(data);
    };

    return (
        <div className="pt-16 p-6 bg-white min-h-screen rounded-2xl">

            <div className="mb-10 bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">
                        Recent Leave Requests
                    </h1>
                    <p className="text-xs text-gray-500">
                        Overview of all submitted leaves
                    </p>
                </div>
            </div>

            {/* Header */}
            <div className="grid grid-cols-5 items-center bg-orange-400 text-white text-sm font-semibold px-6 py-4 rounded-xl shadow-sm mb-4">
                <div>Employee</div>
                <div>Reason</div>
                <div>From</div>
                <div>To</div>
                <div>Status</div>
            </div>

            {/* Rows */}
            <div className="space-y-4">
                {leaves.map((leave) => (
                    <div
                        key={leave.id}
                        className="grid grid-cols-5 items-center bg-white px-6 py-4 rounded-xl shadow-sm hover:shadow-md transition"
                    >
                        <div className="font-medium text-gray-800">
                            {leave.name}
                        </div>

                        <div className="text-gray-600">
                            {leave.reason}
                        </div>

                        <div className="text-gray-600">
                            {formatDate(leave.from_date)}
                        </div>

                        <div className="text-gray-600">
                            {formatDate(leave.to_date)}
                        </div>

                        <div>
                            <span className="px-3 py-1 text-sm rounded-full bg-yellow-400 text-white shadow-sm">
                                {leave.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}

// Date format
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
    });
}