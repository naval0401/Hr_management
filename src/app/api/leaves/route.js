import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    
    const decoded = jwt.verify(
      token,
      process.env.KEYCLOAK_PUBLIC_KEY,
      { algorithms: ["RS256"] }
    );

    const userId = decoded.sub; 

    
    const body = await request.json();
    const { name, fromDate, toDate, reason } = body;

    
    const { data, error } = await supabase
      .from("leaves")
      .insert([
        {
          name,
          user_id: userId, 
          from_date: fromDate,
          to_date: toDate,
          reason,
          status: "pending",
        },
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}