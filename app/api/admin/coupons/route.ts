import { NextRequest, NextResponse } from "next/server";
import { requireAdminResponse } from "@/server/admin-guard";
import { db } from "@/server/db";

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as {
    code?: string;
    type?: "PERCENTAGE" | "FIXED_COP";
    value?: number;
    expiresAt?: string | null;
    usageLimit?: number | null;
  } | null;

  if (!body?.code || !body.type || typeof body.value !== "number") {
    return NextResponse.json(
      { error: "code, type y value son requeridos" },
      { status: 400 }
    );
  }

  const coupon = await db.coupon.create({
    data: {
      code: body.code.trim().toUpperCase(),
      type: body.type,
      value: body.value,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      usageLimit: body.usageLimit ?? null,
    },
  });

  return NextResponse.json({ coupon }, { status: 201 });
}

