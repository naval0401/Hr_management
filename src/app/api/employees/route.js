import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

// 🔐 VERIFY TOKEN
const verifyUser = (request) => {
  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) throw new Error("No token");

  const decoded = jwt.verify(
    token,
    process.env.KEYCLOAK_PUBLIC_KEY,
    { algorithms: ["RS256"] }
  );

  return decoded;
};

// 🧑‍💼 ROLE CHECK (HR / ADMIN)
const isAllowed = (decoded) => {
  return decoded?.realm_access?.roles?.includes("hr") ||
         decoded?.realm_access?.roles?.includes("admin");
};

export async function GET(request) {
  try {
    const decoded = verifyUser(request);

    if (!isAllowed(decoded)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });

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