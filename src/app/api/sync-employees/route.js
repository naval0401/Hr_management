import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.KEYCLOAK_PUBLIC_KEY, {
      algorithms: ["RS256"],
    });

    const employee_id = decoded.sub;

    const newData = {
      employee_id,
      employee_name:
        decoded.name || decoded.preferred_username || "User",
      email: decoded.email || "",
      phone: decoded.phone || "",
      department: decoded.department || "general",
      role: decoded.realm_access?.roles || [],
    };

    // 1. check existing user
    const { data: existing, error: fetchError } = await supabase
      .from("employees")
      .select("*")
      .eq("employee_id", employee_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    let finalData = newData;

    // 2. merge logic (only fill empty fields)
    if (existing) {
      finalData = {
        employee_id,

        employee_name:
          existing.employee_name || newData.employee_name,

        email: existing.email || newData.email,

        phone: existing.phone || newData.phone,

        department: existing.department || newData.department,

        role:
          existing.role && existing.role.length > 0
            ? existing.role
            : newData.role,
      };
    }

    // 3. update only (no overwrite issue)
    const { error } = await supabase
      .from("employees")
      .upsert(finalData, {
        onConflict: "employee_id",
      });

    if (error) {
      console.log("SUPABASE ERROR:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.log("SYNC ERROR:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}