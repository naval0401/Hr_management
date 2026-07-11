import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.KEYCLOAK_PUBLIC_KEY, {
      algorithms: ["RS256"],
    });

    const keycloak_id = decoded.sub;
    const email = decoded.email || "";

    if (!email) {
      return NextResponse.json({ error: "No email in token" }, { status: 400 });
    }

    // find Existing Employee with Email
    const { data: existing } = await supabase
      .from("employees")
      .select("id, keycloak_id")
      .eq("email", email)
      .maybeSingle();

    // if employee find update only keycloak_id
    if (existing) {
      await supabase
        .from("employees")
        .update({ keycloak_id })
        .eq("email", email);

      return NextResponse.json({ success: true });
    }

    // id employee does not find do nothing
    return NextResponse.json({ success: true });

  } catch (err) {
    console.log("SYNC ERROR:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}