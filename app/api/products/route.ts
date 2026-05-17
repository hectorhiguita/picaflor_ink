/**
 * GET /api/products
 *
 * Returns a paginated list of active products.
 *
 * Query params:
 *   category  — category slug filter (optional)
 *   sort      — "price_asc" | "price_desc" | "newest" (default: "newest")
 *   page      — page number, 1-based (default: 1)
 *   pageSize  — items per page, max 50 (default: 20)
 *
 * Response: { products, total, page, pageSize, totalPages }
 */

import { NextRequest, NextResponse } from "next/server";
import { getActiveProducts, getProductCount } from "@/server/queries/products";
import type { SortOption } from "@/lib/types/product";

const VALID_SORT_OPTIONS: SortOption[] = ["price_asc", "price_desc", "newest"];
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const categorySlug = searchParams.get("category") ?? undefined;
  const sortParam = searchParams.get("sort") ?? "newest";
  const pageParam = searchParams.get("page") ?? "1";
  const pageSizeParam = searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE);

  // Validate sort
  if (!VALID_SORT_OPTIONS.includes(sortParam as SortOption)) {
    return NextResponse.json(
      {
        error: `Invalid sort value. Must be one of: ${VALID_SORT_OPTIONS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  // Validate page
  const page = parseInt(pageParam, 10);
  if (isNaN(page) || page < 1) {
    return NextResponse.json(
      { error: "Invalid page value. Must be a positive integer." },
      { status: 400 }
    );
  }

  // Validate pageSize
  const pageSize = parseInt(pageSizeParam, 10);
  if (isNaN(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    return NextResponse.json(
      { error: `Invalid pageSize value. Must be between 1 and ${MAX_PAGE_SIZE}.` },
      { status: 400 }
    );
  }

  const sort = sortParam as SortOption;

  let products;
  let total;

  try {
    [products, total] = await Promise.all([
      getActiveProducts({ categorySlug, sort, page, pageSize }),
      getProductCount({ categorySlug }),
    ]);
  } catch (error) {
    console.error("GET /api/products failed.", error);
    return NextResponse.json(
      {
        error:
          "Product catalog is temporarily unavailable. Check the database connection and schema.",
      },
      { status: 503 }
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return NextResponse.json({
    products,
    total,
    page,
    pageSize,
    totalPages,
  });
}
