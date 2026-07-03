import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const { role, keycloak_id, employee_id } = await verifyUser(request);

    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (role === "admin" || role === "hr") {
      query = query.or(`role.eq.hr,role.eq.admin,role.eq.all`);
    } else if (role === "manager") {
  query = query.or(`role.eq.manager,role.eq.all,employee_id.eq.${employee_id}`);
} else {
      query = query.or(`role.eq.user,role.eq.all,employee_id.eq.${keycloak_id}`);
    }

    const { data, error } = await query;

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

export async function POST(request) {
  try {
    const { role } = await verifyUser(request);

    if (role !== "hr" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { employee_id, role: notifRole, title, message, type } = body;

    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          employee_id: employee_id || null,
          role: notifRole || "all",
          title,
          message,
          type: type || "general",
          is_read: false,
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

export async function PATCH(request) {
  try {
    await verifyUser(request);

    const { id } = await request.json();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}