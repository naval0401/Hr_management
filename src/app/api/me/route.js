import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const { role, employee_name, employee_id } = await verifyUser(request);

    return NextResponse.json({
      role,
      employee_name,
      id: employee_id,
    });
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}