import { NextRequest, NextResponse } from "next/server";
import { requireAdminResponse } from "@/server/admin-guard";
import { db } from "@/server/db";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    category?: string;
    imageAssetId?: string;
    active?: boolean;
  } | null;

  if (!body?.name || !body.category) {
    return NextResponse.json(
      { error: "name y category son requeridos" },
      { status: 400 }
    );
  }

  const design = await db.designCatalogItem.create({
    data: {
      slug: slugify(body.name),
      name: body.name,
      category: body.category,
      imageAssetId: body.imageAssetId ?? null,
      active: body.active ?? true,
    },
  });

  return NextResponse.json({ design }, { status: 201 });
}

