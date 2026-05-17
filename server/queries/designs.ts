/**
 * Server-side query functions for the design catalog.
 * All functions use the `db` singleton and only return active records.
 */

import { db } from "@/server/db";
import type { DesignItem, DesignQueryParams } from "@/lib/types/design";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapDesignItem(design: {
  id: string;
  slug: string;
  name: string;
  category: string;
  imageAsset: { url: string } | null;
  createdAt: Date;
}): DesignItem {
  return {
    id: design.id,
    slug: design.slug,
    name: design.name,
    category: design.category,
    imageUrl: design.imageAsset?.url ?? null,
    createdAt: design.createdAt.toISOString(),
  };
}

// ─── Shared where clause builder ──────────────────────────────────────────────

function buildWhereClause(params: { search?: string; category?: string }) {
  const { search, category } = params;

  return {
    active: true,
    ...(search
      ? {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(category ? { category } : {}),
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Returns a paginated list of active designs, optionally filtered by name
 * (case-insensitive contains) and/or category.
 */
export async function getActiveDesigns(
  params: DesignQueryParams = {}
): Promise<DesignItem[]> {
  const { search, category, page = 1, pageSize = 24 } = params;

  const skip = (page - 1) * pageSize;

  const designs = await db.designCatalogItem.findMany({
    where: buildWhereClause({ search, category }),
    orderBy: { createdAt: "desc" },
    skip,
    take: pageSize,
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      createdAt: true,
      imageAsset: {
        select: { url: true },
      },
    },
  });

  return designs.map(mapDesignItem);
}

/**
 * Returns the total count of active designs, optionally filtered by name
 * and/or category.
 */
export async function getDesignCount(params: {
  search?: string;
  category?: string;
}): Promise<number> {
  return db.designCatalogItem.count({
    where: buildWhereClause(params),
  });
}

/**
 * Returns distinct category values from active designs, sorted alphabetically.
 * Used to populate the category filter UI.
 */
export async function getDesignCategories(): Promise<string[]> {
  const results = await db.designCatalogItem.findMany({
    where: { active: true },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return results.map((r) => r.category);
}
