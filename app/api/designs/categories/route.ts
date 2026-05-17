/**
 * GET /api/designs/categories
 *
 * Returns the list of distinct category values from active designs,
 * sorted alphabetically. Used to populate the category filter UI.
 *
 * Response: string[]
 */

import { NextResponse } from "next/server";
import { getDesignCategories } from "@/server/queries/designs";

export async function GET() {
  const categories = await getDesignCategories();
  return NextResponse.json(categories);
}
