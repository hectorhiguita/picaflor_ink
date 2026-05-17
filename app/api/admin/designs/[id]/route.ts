import { NextRequest, NextResponse } from "next/server";
import { requireAdminResponse } from "@/server/admin-guard";
import { db } from "@/server/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    category?: string;
    imageAssetId?: string | null;
    active?: boolean;
  };

  const design = await db.designCatalogItem.update({
    where: { id },
    data: body,
  });

  return NextResponse.json({ design });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const design = await db.designCatalogItem.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ design });
}

