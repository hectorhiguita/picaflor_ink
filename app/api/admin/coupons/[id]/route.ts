import { NextRequest, NextResponse } from "next/server";
import { requireAdminResponse } from "@/server/admin-guard";
import { db } from "@/server/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    active?: boolean;
    value?: number;
    expiresAt?: string | null;
    usageLimit?: number | null;
  };

  const coupon = await db.coupon.update({
    where: { id },
    data: {
      active: body.active,
      value: body.value,
      expiresAt:
        body.expiresAt === undefined
          ? undefined
          : body.expiresAt
            ? new Date(body.expiresAt)
            : null,
      usageLimit: body.usageLimit,
    },
  });

  return NextResponse.json({ coupon });
}

