import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data: employees } = await supabase
      .from("employee")   
      .select("*");

    const { data: attendance } = await supabase
      .from("attendance")
      .select("*")
      .eq("date", today);

    const updated = employees.map((emp) => {
      const active = attendance?.some(
        (a) =>
          a.employee_id === emp.id &&
          a.check_in
      );

      return {
        id: emp.id,
        status: active ? "active" : "inactive",
      };
    });

    const { error } = await supabase
      .from("employee")   
      .upsert(updated);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}