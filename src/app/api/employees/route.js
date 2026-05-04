import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("employee")
      .select("*");

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}