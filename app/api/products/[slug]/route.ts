/**
 * GET /api/products/[slug]
 *
 * Returns the full product detail including all active variants,
 * category, and printable areas.
 *
 * Returns 404 if the product is not found or is inactive.
 */

import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/server/queries/products";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return NextResponse.json(
      { error: "Product not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(product);
}
