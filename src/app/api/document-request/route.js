import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const { employee_id, role } = await verifyUser(request);
    let query = supabase
  .from("document_request")
  .select("*, employees(employee_name, designation)")
  .order("created_at", { ascending: false });
    if (role === "user") {
      query = query.eq("employee_id", employee_id);
    }
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || [], { status: 200 });
  } catch (err) {
    console.log("DOCUMENT REQUEST GET ERROR:", err);
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    const { employee_id } = await verifyUser(request);
    const body = await request.json();
    const { document_type, reason } = body;
    if (!document_type || !reason) {
      return NextResponse.json({ error: "document_type and reason are required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("document_request")
      .insert([{ employee_id, document_type, reason, status: "pending" }])
      .select();
    if (error) throw error;
    await supabase.from("notifications").insert([{
      role: "hr",
      type: "document",
      title: "New Document Request",
      message: `An employee has requested a ${document_type}.`,
      is_read: false,
    }]);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.log("DOCUMENT REQUEST POST ERROR:", err);
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request) {
  try {
    const { role } = await verifyUser(request);
    if (role !== "hr" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("document_request")
      .update({ status })
      .eq("id", id)
      .select();
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.log("DOCUMENT REQUEST PUT ERROR:", err);
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}