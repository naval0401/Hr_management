import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    // Decode user from Keycloak token
    const decoded = jwt.verify(
      token,
      process.env.KEYCLOAK_PUBLIC_KEY,
      { algorithms: ["RS256"] }
    );

    const user = {
      id: decoded.sub,
      employee_name:
        decoded.name ||
        decoded.preferred_username ||
        "User",
      email: decoded.email || "",
      status: "active",
    };

    //  UPSERT (insert/update)
    const { error } = await supabase
      .from("employee")
      .upsert(user);

    if (error) {
      console.log("SUPABASE ERROR:", error);
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.log("SYNC ERROR:", err);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}