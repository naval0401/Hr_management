import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth";

// GET
export async function GET(request) {
  try {
    const { keycloak_id: userId } = await verifyUser(request);

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

// POST
export async function POST(request) {
  try {
    const { keycloak_id: userId } = await verifyUser(request);

    const { type } = await request.json();

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // check existing
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

      let status = "Present";

      if (
        now.getHours() > 9 ||
        (now.getHours() === 9 && now.getMinutes() > 30)
      ) {
        status = "Late";
      }

      const { data: employee, error: empError } = await supabase
        .from("employees")
        .select("employee_name")
        .eq("employee_id", userId)
        .single();

      if (empError) throw empError;

      const { error } = await supabase.from("attendance").insert({
        employee_id: userId,
        employee_name: employee?.employee_name,
        date: today,
        check_in: now,
        status: status,
      });

      if (error) {
        if (error.code === "23505") {
          return NextResponse.json(
            { error: "Already checked in today" },
            { status: 400 }
          );
        }
        throw error;
      }

      await supabase
        .from("employees")
        .update({ status: "active" })
        .eq("employee_id", userId);
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

      let status = existing.status;

      const checkInTime = new Date(existing.check_in);
      const hoursWorked = (now - checkInTime) / (1000 * 60 * 60);

      if (hoursWorked < 4) {
        status = "Half Day";
      }

      const { error } = await supabase
        .from("attendance")
        .update({
          check_out: now,
          status: status,
        })
        .eq("id", existing.id);

      if (error) throw error;

      await supabase
        .from("employees")
        .update({ status: "inactive" })
        .eq("employee_id", userId);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}