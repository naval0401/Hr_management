import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth";

// GET — HR/admin see all generated payslips
export async function GET(request) {
  try {
    const { role } = await verifyUser(request);

    if (role !== "hr" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("payslips")
      .select("*, employees(employee_name, department, designation)")
      .order("month", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

// POST — "Run Payroll" for a given month.
export async function POST(request) {
  try {
    const { role } = await verifyUser(request);

    if (role !== "hr" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { month } = body;

    if (!month) {
      return NextResponse.json({ error: "month is required" }, { status: 400 });
    }

    const monthDate = `${month}-01`;

    const { data: structures, error: structError } = await supabase
      .from("salary_structures")
      .select("*");

    if (structError) {
      return NextResponse.json({ error: structError.message }, { status: 500 });
    }

    const { data: advances, error: advError } = await supabase
      .from("advance_salary_request")
      .select("*")
      .eq("month", monthDate)
      .eq("status", "Approved");

    if (advError) {
      return NextResponse.json({ error: advError.message }, { status: 500 });
    }

    const payslipRows = structures.map((s) => {
      const matchingAdvance = advances.find((a) => a.employee_id === s.employee_id);
      const advanceDeducted = matchingAdvance ? Number(matchingAdvance.advance_amount) : 0;
      const netPay = Number(s.net_salary) - advanceDeducted;

      return {
        employee_id: s.employee_id,
        month: monthDate,
        gross_salary: s.gross_salary,
        pf_deduction: s.pf_deduction,
        advance_deducted: advanceDeducted,
        net_pay: netPay,
      };
    });

    if (payslipRows.length === 0) {
      return NextResponse.json(
        { error: "No salary structures found to run payroll for" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("payslips")
      .insert(payslipRows)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.log("PAYROLL RUN ERROR:", err);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}