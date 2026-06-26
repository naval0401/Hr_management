import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

function verifyToken(request) {
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

  const roles = decoded.realm_access?.roles || [];

  const username = decoded.preferred_username;
  let role;
  if (username === "vrish") {
    role = "user";
  } else {
    role = roles.includes("admin")
      ? "admin"
      : roles.includes("hr")
      ? "hr"
      : "user";
  }

  return {
    userId: decoded.sub,
    name: decoded.name || decoded.preferred_username || "User",
    role,
  };
}

// GET — employees see their own requests, HR/admin see all.
// Looks up employee name/department via keycloak_id, since
// employee_id here stores the Keycloak sub, not employees.id.
export async function GET(request) {
  try {
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let query = supabase
      .from("advance_salary_request")
      .select("*")
      .order("created_at", { ascending: false });

    if (user.role !== "hr" && user.role !== "admin") {
      query = query.eq("employee_id", user.userId);
    }

    const { data: requests, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Look up employee names/departments via keycloak_id for all requests
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
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { month, total_salary, advance_amount, reason } = body;

    if (!month || !advance_amount) {
      return NextResponse.json(
        { error: "Month and advance amount are required" },
        { status: 400 }
      );
    }

    const remaining_salary = total_salary
      ? total_salary - advance_amount
      : null;

    const { data, error } = await supabase
      .from("advance_salary_request")
      .insert([
        {
          employee_id: user.userId,
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
          message: `${user.name} requested an advance of ₹${advance_amount} for ${month}.`,
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
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "hr" && user.role !== "admin") {
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