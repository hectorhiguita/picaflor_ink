/**
 * Server-side query functions for the product catalog.
 * All functions use the `db` singleton and only return active records.
 */

import { db } from "@/server/db";
import type {
  CategoryItem,
  CategoryWithCount,
  ColorVariant,
  ProductListItem,
  ProductDetail,
  ProductQueryParams,
  VariantSummary,
  PrintableAreaItem,
} from "@/lib/types/product";
import { slugify } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapCategoryItem(
  category: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    sortOrder: number;
  }
): CategoryItem {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    sortOrder: category.sortOrder,
  };
}

function mapVariantSummary(
  variant: {
    id: string;
    colorName: string;
    colorHex: string;
    size: string;
    sku: string;
    priceOverrideCop: number | null;
    stockStatus: string;
    mockupImage: { url: string } | null;
  },
  basePriceCop: number,
  productSlug: string
): VariantSummary {
  return {
    id: variant.id,
    colorName: variant.colorName,
    colorHex: variant.colorHex,
    size: variant.size,
    sku: variant.sku,
    effectivePriceCop: variant.priceOverrideCop ?? basePriceCop,
    stockStatus: variant.stockStatus as VariantSummary["stockStatus"],
    mockupImageUrl:
      variant.mockupImage?.url ??
      getDefaultMockupImageUrl(productSlug, variant.colorName),
  };
}

function getDefaultMockupImageUrl(
  productSlug: string,
  colorName: string
): string {
  return `/images/products/${productSlug}/mockups/${slugify(colorName)}.svg`;
}

function mapPrintableArea(area: {
  id: string;
  position: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}): PrintableAreaItem {
  return {
    id: area.id,
    position: area.position as PrintableAreaItem["position"],
    x: area.x,
    y: area.y,
    width: area.width,
    height: area.height,
    rotation: area.rotation,
  };
}

function extractColorVariants(
  variants: { colorName: string; colorHex: string }[]
): ColorVariant[] {
  const seen = new Set<string>();
  const result: ColorVariant[] = [];
  for (const v of variants) {
    if (!seen.has(v.colorName)) {
      seen.add(v.colorName);
      result.push({ colorName: v.colorName, colorHex: v.colorHex });
    }
  }
  return result;
}

// ─── Variant select shape ─────────────────────────────────────────────────────

const variantSelect = {
  id: true,
  colorName: true,
  colorHex: true,
  size: true,
  sku: true,
  priceOverrideCop: true,
  stockStatus: true,
  mockupImage: {
    select: { url: true },
  },
} as const;

// ─── Where clause builder ─────────────────────────────────────────────────────

function buildProductWhereClause(params: {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
}) {
  const { categorySlug, minPrice, maxPrice, sizes } = params;

  return {
    active: true,
    ...(categorySlug
      ? { category: { slug: categorySlug, active: true } }
      : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          basePriceCop: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(sizes && sizes.length > 0
      ? { variants: { some: { active: true, size: { in: sizes } } } }
      : {}),
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Returns all active categories sorted by sortOrder ascending.
 */
export async function getCategories(): Promise<CategoryItem[]> {
  const categories = await db.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      sortOrder: true,
    },
  });

  return categories.map(mapCategoryItem);
}

/**
 * Returns all active categories with the count of active products in each.
 */
export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const [categories, counts] = await Promise.all([
    db.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        sortOrder: true,
      },
    }),
    db.product.groupBy({
      by: ["categoryId"],
      where: { active: true },
      _count: { _all: true },
    }),
  ]);

  const countMap = new Map(counts.map((c) => [c.categoryId, c._count._all]));

  return categories.map((cat) => ({
    ...mapCategoryItem(cat),
    count: countMap.get(cat.id) ?? 0,
  }));
}

/**
 * Returns the total count of active products, filtered by the given params.
 */
export async function getProductCount(params: {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
}): Promise<number> {
  return db.product.count({
    where: buildProductWhereClause(params),
  });
}

/**
 * Returns a paginated list of active products with all active variants
 * (for color swatches), category, and filtering by category, price, and size.
 */
export async function getActiveProducts(
  params: ProductQueryParams = {}
): Promise<ProductListItem[]> {
  const {
    categorySlug,
    sort = "newest",
    page = 1,
    pageSize = 20,
    minPrice,
    maxPrice,
    sizes,
  } = params;

  const skip = (page - 1) * pageSize;

  const orderBy = (() => {
    switch (sort) {
      case "price_asc":
        return { basePriceCop: "asc" as const };
      case "price_desc":
        return { basePriceCop: "desc" as const };
      case "newest":
      default:
        return { createdAt: "desc" as const };
    }
  })();

  const products = await db.product.findMany({
    where: buildProductWhereClause({ categorySlug, minPrice, maxPrice, sizes }),
    orderBy,
    skip,
    take: pageSize,
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      basePriceCop: true,
      printTechnique: true,
      featured: true,
      createdAt: true,
      category: {
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          sortOrder: true,
        },
      },
      variants: {
        where: { active: true },
        orderBy: [{ colorName: "asc" }, { id: "asc" }],
        select: variantSelect,
      },
    },
  });

  return products.map((product) => {
    const colorVariants = extractColorVariants(product.variants);
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      basePriceCop: product.basePriceCop,
      printTechnique: product.printTechnique,
      featured: product.featured,
      createdAt: product.createdAt.toISOString(),
      category: mapCategoryItem(product.category),
      firstVariant: product.variants[0]
        ? mapVariantSummary(
            product.variants[0],
            product.basePriceCop,
            product.slug
          )
        : null,
      colorVariants,
    };
  });
}

/**
 * Returns a full product with all active variants, category, and printable areas.
 * Returns null if the product is not found or is inactive.
 */
export async function getProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  const product = await db.product.findFirst({
    where: { slug, active: true },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      basePriceCop: true,
      printTechnique: true,
      featured: true,
      createdAt: true,
      category: {
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          sortOrder: true,
        },
      },
      variants: {
        where: { active: true },
        orderBy: { id: "asc" },
        select: variantSelect,
      },
      printableAreas: {
        where: { active: true },
        select: {
          id: true,
          position: true,
          x: true,
          y: true,
          width: true,
          height: true,
          rotation: true,
        },
      },
    },
  });

  if (!product) return null;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    basePriceCop: product.basePriceCop,
    printTechnique: product.printTechnique,
    featured: product.featured,
    createdAt: product.createdAt.toISOString(),
    category: mapCategoryItem(product.category),
    variants: product.variants.map((v) =>
      mapVariantSummary(v, product.basePriceCop, product.slug)
    ),
    printableAreas: product.printableAreas.map(mapPrintableArea),
  };
}
