import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  const body = await request.json();
  const { name, fromDate, toDate, reason } = body;

  const { data, error } = await supabase
    .from("leaves")
    .insert([
      {
        name,
        from_date: fromDate,
        to_date: toDate,
        reason,
        status: "pending",
      },
    ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
