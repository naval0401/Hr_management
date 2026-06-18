"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdvanceSalaryPage() {
  const [employee, setEmployee] = useState(null);
  const [percent, setPercent] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);

  useEffect(() => {
    const fetchEmployee = async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", 1) // example employee_id
        .single();

      if (!error) setEmployee(data);
    };
    fetchEmployee();
  }, []);

  const handlePercentChange = (e) => {
    const value = e.target.value;
    setPercent(value);
    if (employee) setAdvanceAmount((employee.total_salary * value) / 100);
  };

  const handleSubmit = async () => {
    if (!employee) return;

    const payload = {
      month: new Date().toISOString().slice(0, 7),
      total_salary: employee.total_salary,
      employee_id: employee.id,
      advance_amount: advanceAmount,
      remaining_salary: employee.total_salary - advanceAmount,
      reason: "Personal needs",
      status: "Pending",
    };

    const res = await fetch("/api/advance-salary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("Submitted:", data);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800">Advance Salary Request</h2>

      <div className="bg-white shadow-lg rounded-xl p-6 space-y-6">
        {employee ? (
          <>
            <p className="text-lg font-semibold">Total Salary: ₹{employee.total_salary}</p>
            <div>
              <label className="block mb-2 font-medium">Advance Percentage</label>
              <input
                type="number"
                value={percent}
                onChange={handlePercentChange}
                className="border border-gray-300 rounded-lg p-2 w-32"
                placeholder="e.g. 20"
              />
            </div>
            <p className="text-lg font-semibold">Advance Amount: ₹{advanceAmount}</p>
            <p className="text-lg font-semibold">
              Remaining Salary: ₹{employee.total_salary - advanceAmount}
            </p>
            <button
              onClick={handleSubmit}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Submit Request
            </button>
          </>
        ) : (
          <p className="text-gray-500">Loading employee data...</p>
        )}
      </div>
    </div>
  );
}
