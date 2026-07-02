import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth";

// GET — employees see their own requests, HR/admin see all.
export async function GET(request) {
  try {
    const { role, keycloak_id: userId } = await verifyUser(request);

    let query = supabase
      .from("advance_salary_request")
      .select("*")
      .order("created_at", { ascending: false });

    if (role !== "hr" && role !== "admin") {
      query = query.eq("employee_id", userId);
    }

    const { data: requests, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const keycloakIds = [...new Set(requests.map((r) => r.employee_id).filter(Boolean))];

    let employeeMap = {};
    if (keycloakIds.length > 0) {
      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("employee_name, department, designation, keycloak_id")
        .in("keycloak_id", keycloakIds);

      if (!empError && employees) {
        employees.forEach((emp) => {
          employeeMap[emp.keycloak_id] = emp;
        });
      }
    }

    const enrichedRequests = requests.map((r) => ({
      ...r,
      employee_name: employeeMap[r.employee_id]?.employee_name || "Unknown",
      department: employeeMap[r.employee_id]?.department || "-",
      designation: employeeMap[r.employee_id]?.designation || "-",
    }));

    return NextResponse.json(enrichedRequests, { status: 200 });

  } catch (err) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

// POST — employee submits a new advance salary request
export async function POST(request) {
  try {
    const { keycloak_id: userId, employee_name } = await verifyUser(request);

    const body = await request.json();
    const { month, total_salary, advance_amount, reason } = body;

    if (!month || !advance_amount) {
      return NextResponse.json(
        { error: "Month and advance amount are required" },
        { status: 400 }
      );
    }

    const remaining_salary = total_salary ? total_salary - advance_amount : null;

    const { data, error } = await supabase
      .from("advance_salary_request")
      .insert([
        {
          employee_id: userId,
          month,
          total_salary,
          advance_amount,
          remaining_salary,
          reason,
          status: "pending",
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { error: notifyError } = await supabase
      .from("notifications")
      .insert([
        {
          role: "hr",
          type: "advance_salary",
          title: "New Advance Salary Request",
          message: `${employee_name} requested an advance of ₹${advance_amount} for ${month}.`,
          is_read: false,
        },
      ]);

    if (notifyError) {
      console.error("Failed to create notification:", notifyError.message);
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

// PUT — HR/admin approves or rejects a request
export async function PUT(request) {
  try {
    const { role } = await verifyUser(request);

    if (role !== "hr" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("advance_salary_request")
      .update({ status })
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