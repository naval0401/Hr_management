import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.KEYCLOAK_PUBLIC_KEY,
      { algorithms: ["RS256"] }
    );

    const userId = decoded.sub;

    const name =
      decoded.name ||
      decoded.preferred_username ||
      "User";

    // Role now comes from Supabase (employees.role), not from Keycloak.
// Keycloak is only used for authentication; authorization is decided by Supabase.
const { data: empData } = await supabase
  .from("employees")
  .select("role")
  .eq("keycloak_id", userId)
  .single();

const role = empData?.role || "user";

    const body = await request.json();
    const { fromDate, toDate, reason } = body;

    const { data, error } = await supabase
      .from("leaves")
      .insert([
        {
          name,
          user_id: userId,
          role: role,
          from_date: fromDate,
          to_date: toDate,
          reason,
          status: "pending",
          manager_status: "pending",
          hr_status: "pending",
        },
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

   // 🔔 Find this employee's manager via reporting_manager,
    // and notify that specific manager (not a generic "hr" role notification).
    console.log("DEBUG: Looking up employee row for userId:", userId);

    const { data: employeeRow, error: empError } = await supabase
      .from("employees")
      .select("reporting_manager")
      .eq("keycloak_id", userId)
      .single();

    console.log("DEBUG: employeeRow =", employeeRow, "empError =", empError);

    if (!empError && employeeRow?.reporting_manager) {
      console.log("DEBUG: Found reporting_manager =", employeeRow.reporting_manager);

      const { data: managerRow, error: managerError } = await supabase
        .from("employees")
        .select("keycloak_id")
        .eq("id", employeeRow.reporting_manager)
        .single();

      console.log("DEBUG: managerRow =", managerRow, "managerError =", managerError);

      if (managerRow?.keycloak_id) {
        console.log("DEBUG: Attempting to insert notification for manager keycloak_id =", managerRow.keycloak_id);

        const { data: notifData, error: notifyError } = await supabase
          .from("notifications")
          .insert([
            {
              employee_id: managerRow.keycloak_id,
              role: "manager",
              type: "leave",
              title: "New Leave Request — Awaiting Your Approval",
              message: `${name} applied for leave — ${reason}`,
              is_read: false,
            },
          ])
          .select();

        console.log("DEBUG: notification insert result =", notifData, "notifyError =", notifyError);

        if (notifyError) {
          console.error("Failed to create manager notification:", notifyError.message);
        }
      } else {
        console.log("DEBUG: managerRow.keycloak_id was missing/null, no notification sent");
      }
    } else {
      console.log("DEBUG: No reporting_manager found, falling back to HR notification");

      // Fallback: if no manager is set up for this employee,
      // notify HR directly so the request doesn't go unnoticed.
      const { error: fallbackError } = await supabase
        .from("notifications")
        .insert([
          {
            role: "hr",
            type: "leave",
            title: "New Leave Request",
            message: `${name} applied for leave — ${reason} (no manager assigned)`,
            is_read: false,
          },
        ]);

      if (fallbackError) {
        console.error("Failed to create fallback notification:", fallbackError.message);
      }
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}