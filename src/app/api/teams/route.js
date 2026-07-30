import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ======================
// GET - Fetch Teams
// ======================
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ======================
// POST - Create Team
// ======================
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      team_name,
      team_lead,
      department,
      status,
      description,
      members,
    } = body;

    if (!team_name || !team_lead || !department) {
      return NextResponse.json(
        {
          success: false,
          message: "Team Name, Team Lead and Department are required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("teams")
      .insert([
        {
          team_name,
          team_lead,
          department,
          status,
          description,
          members,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Team created successfully.",
      data,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ======================
// PUT - Update Team
// ======================
export async function PUT(request) {
  try {
    const body = await request.json();

    const {
      id,
      team_name,
      team_lead,
      department,
      status,
      description,
      members,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Team ID is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("teams")
      .update({
        team_name,
        team_lead,
        department,
        status,
        description,
        members,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Team updated successfully.",
      data,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ======================
// DELETE - Delete Team
// ======================
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Team ID is required.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Team deleted successfully.",
    });

  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}