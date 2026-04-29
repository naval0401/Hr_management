import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

// ================= GET =================
export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.KEYCLOAK_PUBLIC_KEY,
      { algorithms: ["RS256"] }
    );

    const userId = decoded.sub;

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// ================= POST =================
export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.KEYCLOAK_PUBLIC_KEY,
      { algorithms: ["RS256"] }
    );

    const userId = decoded.sub;

    const { type } = await request.json();

    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", userId)
      .eq("date", today)
      .maybeSingle();

    // CHECK-IN
    if (type === "checkin") {
      if (existing?.check_in) {
        return NextResponse.json(
          { error: "Already checked in" },
          { status: 400 }
        );
      }

      await supabase.from("attendance").insert({
        employee_id: userId,
        date: today,
        check_in: new Date(),
        status: "present",
      });
    }

    // CHECK-OUT
    else if (type === "checkout") {
      if (!existing?.check_in) {
        return NextResponse.json(
          { error: "Check-in required first" },
          { status: 400 }
        );
      }

      if (existing?.check_out) {
        return NextResponse.json(
          { error: "Already checked out" },
          { status: 400 }
        );
      }

      await supabase
        .from("attendance")
        .update({
          check_out: new Date(),
        })
        .eq("id", existing.id);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}