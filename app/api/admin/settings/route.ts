import { NextRequest, NextResponse } from "next/server";
import { requireAdminResponse } from "@/server/admin-guard";
import { db } from "@/server/db";

export async function PATCH(request: NextRequest) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as {
    key?: string;
    value?: unknown;
  } | null;

  if (!body?.key) {
    return NextResponse.json({ error: "key es requerido" }, { status: 400 });
  }

  const setting = await db.siteSetting.upsert({
    where: { key: body.key },
    update: { valueJson: body.value as object },
    create: { key: body.key, valueJson: body.value as object },
  });

  return NextResponse.json({ setting });
}

