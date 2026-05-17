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
    description?: string | null;
    categoryId?: string;
    basePriceCop?: number;
    active?: boolean;
  };

  const product = await db.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      categoryId: body.categoryId,
      basePriceCop: body.basePriceCop,
      active: body.active,
    },
  });

  return NextResponse.json({ product });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const product = await db.product.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ product });
}

