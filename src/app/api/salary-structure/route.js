import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth";

// GET — HR/admin see all salary structures
export async function GET(request) {
  try {
    const { role } = await verifyUser(request);

    if (role !== "hr" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("salary_structures")
      .select("*, employees(employee_name, department, designation)")
      .order("created_at", { ascending: false });

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

// POST — HR/admin sets a new salary structure for an employee
export async function POST(request) {
  try {
    const { role } = await verifyUser(request);

    if (role !== "hr" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { employee_id, gross_salary, pf_deduction } = body;

    if (!employee_id || !gross_salary) {
      return NextResponse.json(
        { error: "employee_id and gross_salary are required" },
        { status: 400 }
      );
    }

    const net_salary = gross_salary - (pf_deduction || 0);

    const { data, error } = await supabase
      .from("salary_structures")
      .insert([
        {
          employee_id,
          gross_salary,
          pf_deduction: pf_deduction || 0,
          net_salary,
        },
      ])
      .select();

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

// PUT — HR/admin edits an existing salary structure
export async function PUT(request) {
  try {
    const { role } = await verifyUser(request);

    if (role !== "hr" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, gross_salary, pf_deduction } = body;

    if (!id || !gross_salary) {
      return NextResponse.json(
        { error: "id and gross_salary are required" },
        { status: 400 }
      );
    }

    const net_salary = gross_salary - (pf_deduction || 0);

    const { data, error } = await supabase
      .from("salary_structures")
      .update({ gross_salary, pf_deduction: pf_deduction || 0, net_salary })
      .eq("id", id)
      .select();

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