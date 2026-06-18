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
  const role = roles.includes("admin")
    ? "admin"
    : roles.includes("hr")
    ? "hr"
    : "user";

  return {
    userId: decoded.sub,
    name: decoded.name || decoded.preferred_username || "User",
    role,
  };
}

export async function GET(request) {
  try {
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // hr/admin see notifications where role = 'hr' or 'admin' or 'all'
    // regular users see role = 'user' or 'all'
    // (employee_id-specific targeting can be added later once the id mapping is confirmed)
    let roleFilter;
    if (user.role === "admin" || user.role === "hr") {
      roleFilter = `role.eq.hr,role.eq.admin,role.eq.all`;
    } else {
      roleFilter = `role.eq.user,role.eq.all`;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(roleFilter)
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