import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

async function verifyToken(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(
    token,
    process.env.KEYCLOAK_PUBLIC_KEY,
    { algorithms: ["RS256"] }
  );

  const userId = decoded.sub;

  // Role now comes from Supabase (employees.role), not from Keycloak.
  const { data: empData } = await supabase
    .from("employees")
    .select("role")
    .eq("keycloak_id", userId)
    .single();

  const role = empData?.role || "user";

  return {
    userId,
    role,
  };
}

// GET — HR/admin see all generated payslips
export async function GET(request) {
  try {
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "hr" && user.role !== "admin") {
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
// Combines salary_structures with any Approved advance for that month,
// and creates one payslip row per employee who has a salary structure.
export async function POST(request) {
  try {
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "hr" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { month } = body; // expected format: "YYYY-MM"

    if (!month) {
      return NextResponse.json({ error: "month is required" }, { status: 400 });
    }

    const monthDate = `${month}-01`;

    // Step 1: get all salary structures (latest per employee)
    const { data: structures, error: structError } = await supabase
      .from("salary_structures")
      .select("*");

    if (structError) {
      return NextResponse.json({ error: structError.message }, { status: 500 });
    }

    // Step 2: get all approved advances for this month
    const { data: advances, error: advError } = await supabase
      .from("advance_salary_request")
      .select("*")
      .eq("month", monthDate)
      .eq("status", "Approved");

    if (advError) {
      return NextResponse.json({ error: advError.message }, { status: 500 });
    }

    // Step 3: build one payslip per employee with a salary structure
    const payslipRows = structures.map((s) => {
      const matchingAdvance = advances.find(
        (a) => a.employee_id === s.employee_id
      );
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