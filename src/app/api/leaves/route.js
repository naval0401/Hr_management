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

    const roles = decoded.realm_access?.roles || [];
    const role = roles.includes("admin")
      ? "admin"
      : roles.includes("hr")
      ? "hr"
      : "user";

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
        },
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // 🔔 Notify HR: matches your real notifications schema
    // (id, employee_id, role, type, title, message, is_read, created_at)
    // employee_id left null for now since it targets a ROLE (hr), not one person.
    const { error: notifyError } = await supabase
      .from("notifications")
      .insert([
        {
          employee_id: null,
          role: "hr",
          type: "leave",
          title: "New Leave Request",
          message: `${name} applied for leave from ${fromDate} to ${toDate}.`,
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