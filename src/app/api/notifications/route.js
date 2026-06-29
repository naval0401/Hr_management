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
    name: decoded.name || decoded.preferred_username || "User",
    role,
  };
}

export async function GET(request) {
  try {
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // hr/admin: see hr/admin/all notifications
    // manager: see notifications specifically addressed to them (employee_id match) or role=manager/all
    // regular users: see role=user or all
    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (user.role === "admin" || user.role === "hr") {
      query = query.or(`role.eq.hr,role.eq.admin,role.eq.all`);
    } else if (user.role === "manager") {
      query = query.or(`role.eq.manager,role.eq.all,employee_id.eq.${user.userId}`);
    } else {
      query = query.or(`role.eq.user,role.eq.all,employee_id.eq.${user.userId}`);
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
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "hr" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { employee_id, role, title, message, type } = body;

    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          employee_id: employee_id || null,
          role: role || "all",
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
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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