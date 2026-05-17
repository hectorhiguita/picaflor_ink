/**
 * GET /api/categories
 *
 * Returns all active categories sorted by sortOrder ascending.
 */

import { NextResponse } from "next/server";
import { getCategories } from "@/server/queries/products";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(categories);
}
