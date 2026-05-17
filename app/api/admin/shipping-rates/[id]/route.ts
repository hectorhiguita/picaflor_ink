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
    zone?: string;
    priceCop?: number | null;
    active?: boolean;
    sortOrder?: number;
  };

  const rate = await db.shippingRate.update({
    where: { id },
    data: body,
  });

  return NextResponse.json({ rate });
}

