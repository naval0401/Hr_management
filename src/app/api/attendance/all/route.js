import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

// ================= GET (ALL USERS DATA) =================
export async function GET() {
  try {
    // ✅ NO AUTH, NO FILTER — FULL TABLE DATA
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.log("SUPABASE ERROR:", error);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.log("SERVER ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// ================= POST (CHECK-IN / CHECK-OUT) =================
export async function POST(request) {
  try {
    const token = request.headers
      .get("authorization")
      ?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "No token" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.KEYCLOAK_PUBLIC_KEY,
      { algorithms: ["RS256"] }
    );

    const userId = decoded.sub;

    // ✅ SAFE NAME EXTRACTION
    const userName =
      decoded?.name ||
      decoded?.preferred_username ||
      decoded?.email ||
      (decoded?.given_name && decoded?.family_name
        ? `${decoded.given_name} ${decoded.family_name}`
        : null) ||
      "User";

    const { type } = await request.json();
    console.log("USER LOGIN:", userId, userName);

    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", userId)
      .eq("date", today)
      .maybeSingle();

    // ================= CHECK-IN =================
    if (type === "checkin") {
      if (existing?.check_in) {
        return NextResponse.json(
          { error: "Already checked in" },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from("attendance")
        .insert({
          employee_id: userId,
          employee_name: userName,
          date: today,
          check_in: new Date(),
          status: "present",
        });

      if (error) throw error;
    }

    // ================= CHECK-OUT =================
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

      const { error } = await supabase
        .from("attendance")
        .update({
          check_out: new Date(),
        })
        .eq("id", existing.id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.log("POST ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}