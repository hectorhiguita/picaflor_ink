/**
 * GET /api/designs
 *
 * Returns a paginated list of active designs from the design catalog.
 *
 * Query params:
 *   search    — case-insensitive name search (optional)
 *   category  — exact category filter (optional)
 *   page      — page number, 1-based (default: 1)
 *   pageSize  — items per page, max 100 (default: 24)
 *
 * Response: { designs, total, page, pageSize, totalPages }
 */

import { NextRequest, NextResponse } from "next/server";
import { getActiveDesigns, getDesignCount } from "@/server/queries/designs";

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const search = searchParams.get("search") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const pageParam = searchParams.get("page") ?? "1";
  const pageSizeParam = searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE);

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
      {
        error: `Invalid pageSize value. Must be between 1 and ${MAX_PAGE_SIZE}.`,
      },
      { status: 400 }
    );
  }

  const [designs, total] = await Promise.all([
    getActiveDesigns({ search, category, page, pageSize }),
    getDesignCount({ search, category }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return NextResponse.json({
    designs,
    total,
    page,
    pageSize,
    totalPages,
  });
}
