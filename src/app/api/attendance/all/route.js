import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

// ================= SAFE DATE =================
const getToday = () => {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
};

// ================= VERIFY TOKEN =================
const verifyUser = (request) => {
  const token = request.headers.get("authorization")?.split(" ")[1];
  if (!token) throw new Error("No token");

  return jwt.verify(token, process.env.KEYCLOAK_PUBLIC_KEY, {
    algorithms: ["RS256"],
  });
};

// ================= HR CHECK =================
const isHR = (decoded) => {
  return decoded?.realm_access?.roles?.includes("hr");
};

// =================  GET  =================
export async function GET(request) {
  try {
    const decoded = verifyUser(request);

    if (!isHR(decoded)) {
      return NextResponse.json(
        { error: "Forbidden - HR only" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err) {
    console.log("GET ALL ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// =================  POST =================
export async function POST(request) {
  try {
    const decoded = verifyUser(request);

    const userId = decoded.sub;

    const { type } = await request.json();

    const today = getToday();
    const now = new Date().toISOString();

    // CHECK EXISTING
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

      const nowDate = new Date();
      if (
        nowDate.getHours() > 9 ||
        (nowDate.getHours() === 9 && nowDate.getMinutes() > 30)
      ) {
        status = "Late";
      }

      // 🔥 GET EMPLOYEE NAME FROM EMPLOYEES TABLE
      const { data: employee, error: empError } = await supabase
        .from("employees")
        .select("employee_name")
        .eq("employee_id", userId)
        .single();

      if (empError) throw empError;

      const { error } = await supabase.from("attendance").insert({
        employee_id: userId,
        employee_name: employee?.employee_name, // ✅ FIX
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
      const hoursWorked =
        (new Date() - checkInTime) / (1000 * 60 * 60);

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
    console.log("POST ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}