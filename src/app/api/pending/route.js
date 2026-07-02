import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const { keycloak_id, role } = await verifyUser(request);

    let query = supabase
      .from("leaves")
      .select("*")
      .order("created_at", { ascending: false });

    if (role === "user") {
      query = query.eq("user_id", keycloak_id);

    } else if (role === "manager") {
      // Find this manager's employees.id
      const { data: myRow } = await supabase
        .from("employees")
        .select("id")
        .eq("keycloak_id", keycloak_id)
        .single();

      // Find which department(s) this person manages
      const { data: managedDepts, error: deptError } = await supabase
        .from("departments")
        .select("name")
        .eq("manager_id", myRow?.id);

      if (deptError) {
        return NextResponse.json({ error: deptError.message }, { status: 500 });
      }

      const deptNames = (managedDepts || []).map((d) => d.name);

      if (deptNames.length === 0) {
        return NextResponse.json([], { status: 200 });
      }

      // Find all employees in those departments
      const { data: teamEmployees, error: teamError } = await supabase
        .from("employees")
        .select("keycloak_id")
        .in("department", deptNames);

      if (teamError) {
        return NextResponse.json({ error: teamError.message }, { status: 500 });
      }

      const teamKeycloakIds = (teamEmployees || [])
        .map((e) => e.keycloak_id)
        .filter(Boolean);

      if (teamKeycloakIds.length === 0) {
        return NextResponse.json([], { status: 200 });
      }

      query = query
        .in("user_id", teamKeycloakIds)
        .eq("manager_status", "pending");

    } else if (role === "hr" || role === "admin") {
  query = query
    .eq("manager_status", "Approved");
}

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || [], { status: 200 });

  } catch (err) {
    console.log("PENDING GET ERROR:", err);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export async function PUT(request) {
  try {
    

    const { role } = await verifyUser(request);

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 }
      );
    }

    let updateFields = {};

    if (role === "manager") {
      updateFields = { manager_status: status };
    } else if (role === "hr" || role === "admin") {
      updateFields = { hr_status: status };
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status === "Rejected") {
      updateFields.status = "Rejected";
    } else if (role === "hr" && status === "Approved") {
      updateFields.status = "Approved";
    }

    const { data, error } = await supabase
      .from("leaves")
      .update(updateFields)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("DEBUG: role =", JSON.stringify(role), "| status =", JSON.stringify(status), "| data[0] exists =", !!data?.[0]);

if (role === "manager" && status === "Approved" && data?.[0]) {
  console.log("DEBUG: Condition matched, attempting to notify HR");
  const leave = data[0];

  const { data: notifData, error: notifyError } = await supabase
    .from("notifications")
    .insert([
      {
        role: "hr",
        type: "leave",
        title: "Leave Request — Manager Approved, Awaiting HR",
        message: `${leave.name}'s leave request was approved by the manager and now needs your final approval.`,
        is_read: false,
      },
    ])
    .select();

  console.log("DEBUG: HR notification insert result =", notifData, "| error =", notifyError);

  if (notifyError) {
    console.error("Failed to notify HR:", notifyError.message);
  }
} else {
  console.log("DEBUG: Condition did NOT match, no HR notification sent");
}

    if (
      (role === "manager" && status === "Rejected") ||
      (role === "hr" && (status === "Approved" || status === "Rejected"))
    ) {
      const leave = data?.[0];
      if (leave?.user_id) {
        const { error: empNotifyError } = await supabase
          .from("notifications")
          .insert([
            {
              employee_id: leave.user_id,
              role: "user",
              type: "leave",
              title: `Leave Request ${status}`,
              message: `Your leave request (${leave.from_date} to ${leave.to_date}) was ${status.toLowerCase()}.`,
              is_read: false,
            },
          ]);

        if (empNotifyError) {
          console.error("Failed to notify employee:", empNotifyError.message);
        }
      }
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.log("PENDING PUT ERROR:", err);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}