import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";

export async function requireAdminResponse(): Promise<NextResponse | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return null;
}

