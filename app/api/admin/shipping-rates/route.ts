import { NextRequest, NextResponse } from "next/server";
import { requireAdminResponse } from "@/server/admin-guard";
import { db } from "@/server/db";

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    zone?: string;
    priceCop?: number | null;
    sortOrder?: number;
  } | null;

  if (!body?.name || !body.zone) {
    return NextResponse.json(
      { error: "name y zone son requeridos" },
      { status: 400 }
    );
  }

  const rate = await db.shippingRate.create({
    data: {
      name: body.name,
      zone: body.zone,
      priceCop: body.priceCop ?? null,
      sortOrder: body.sortOrder ?? 0,
    },
  });

  return NextResponse.json({ rate }, { status: 201 });
}

