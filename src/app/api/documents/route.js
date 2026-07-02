import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth";

// GET — list documents
// HR/Admin → all documents
// Employee → only their own documents
export async function GET(request) {
  try {
    const { role, employee_id } = await verifyUser(request);
const allowed = role === "hr" || role === "admin";

let query = supabase
  .from("documents")
  .select(`*, employees(employee_name, employee_id, designation)`)
  .order("created_at", { ascending: false });

// Employee sirf apne documents dekhe, HR sab dekhe
if (!allowed) {
  query = query.eq("employee_id", employee_id);
}

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err) {
    console.log("DOCUMENTS GET ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

// POST — upload document metadata (HR/Admin only)
// File upload Supabase storage mein page.js se hoga
// Ye route sirf documents table mein metadata insert karta hai
export async function POST(request) {
  try {
    const { role, employee_name } = await verifyUser(request);

if (!(role === "hr" || role === "admin")) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

const body = await request.json();
const { employee_id, title, file_url, document_type, request_id } = body;

if (!employee_id || !title || !file_url) {
  return NextResponse.json(
    { error: "employee_id, title, and file_url are required" },
    { status: 400 }
  );
}

    const { data, error } = await supabase
      .from("documents")
      .insert([
        {
          employee_id,
          title,
          file_url,
          document_type: document_type || null,
          request_id: request_id || null,
          uploaded_by: employee_name || "HR",
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.log("DOCUMENTS POST ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

// PUT — update document title or type (HR/Admin only)
export async function PUT(request) {
  try {
    const { role } = await verifyUser(request);
if (!(role === "hr" || role === "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("documents")
      .update(fields)
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.log("DOCUMENTS PUT ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

// DELETE — remove a document (HR/Admin only)
export async function DELETE(request) {
  try {
    const decoded = verifyUser(request);

    if (!(await isHRorAdmin(decoded))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, file_url } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Supabase storage se file bhi delete karo
    if (file_url) {
      await supabase.storage.from("documents").remove([file_url]);
    }

    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.log("DOCUMENTS DELETE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}