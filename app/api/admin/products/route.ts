import { NextRequest, NextResponse } from "next/server";
import { requireAdminResponse } from "@/server/admin-guard";
import { db } from "@/server/db";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    description?: string;
    categoryId?: string;
    basePriceCop?: number;
    active?: boolean;
  } | null;

  if (!body?.name || !body.categoryId || typeof body.basePriceCop !== "number") {
    return NextResponse.json(
      { error: "name, categoryId y basePriceCop son requeridos" },
      { status: 400 }
    );
  }

  const product = await db.product.create({
    data: {
      slug: slugify(body.name),
      name: body.name,
      description: body.description ?? null,
      categoryId: body.categoryId,
      basePriceCop: body.basePriceCop,
      active: body.active ?? true,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}

