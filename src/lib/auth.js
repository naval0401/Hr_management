import { supabase } from "./supabase";
import jwt from "jsonwebtoken";

export async function verifyUser(request) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  
  const decoded = jwt.verify(token, process.env.KEYCLOAK_PUBLIC_KEY, {
    algorithms: ["RS256"],
  });

  const { data: empData } = await supabase
    .from("employees")
    .select("id, role, employee_name, department")
    .eq("keycloak_id", decoded.sub)
    .single();

  return {
    keycloak_id: decoded.sub,
    employee_id: empData?.id || null,
    role: empData?.role || "user",
    employee_name: empData?.employee_name || "",
    department: empData?.department || "",
  };
}