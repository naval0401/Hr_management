import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth";

// GET — list employees, with optional ?department= and ?status= filters
export async function GET(request) {
  try {
    const { role } = await verifyUser(request);

if (!(role === "hr" || role === "admin" || role === "manager")) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const status = searchParams.get("status");

    let query = supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });

    if (department && department !== "all") {
      query = query.eq("department", department);
    }

    if (status && status !== "all") {
      query = query.eq("status", status === "active");
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err) {
    console.log("EMPLOYEES API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

// POST — add a new employee
export async function POST(request) {
  try {
    const { role } = await verifyUser(request);

if (!(role === "hr" || role === "admin")) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

    const body = await request.json();
    const {
      employee_name,
      email,
      phone,
      employee_id,
      designation,
      department,
      date_of_joining,
      status,
    } = body;

    if (!employee_name || !email) {
      return NextResponse.json(
        { error: "Employee name and email are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("employees")
      .insert([
        {
          employee_name,
          email,
          phone,
          employee_id,
          designation,
          department,
          date_of_joining,
          status: status ?? true,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.log("EMPLOYEES POST ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

// PUT — edit an existing employee
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
      .from("employees")
      .update(fields)
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.log("EMPLOYEES PUT ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

// DELETE — remove an employee
export async function DELETE(request) {
  try {
    const { role } = await verifyUser(request);

if (!(role === "hr" || role === "admin")) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.log("EMPLOYEES DELETE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}