/**
 * TypeScript types for product API responses.
 * All prices are in COP (integer, no decimals).
 */

import type { StockStatus, PrintPosition } from "@/lib/generated/prisma/client";

// ─── Category ────────────────────────────────────────────────────────────────

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

export interface CategoryWithCount extends CategoryItem {
  count: number;
}

// ─── Variant (summary for listing) ───────────────────────────────────────────

export interface VariantSummary {
  id: string;
  colorName: string;
  colorHex: string;
  size: string;
  sku: string;
  /** Effective price: priceOverrideCop if set, otherwise the product's basePriceCop */
  effectivePriceCop: number;
  stockStatus: StockStatus;
  mockupImageUrl: string | null;
}

// ─── Color variant (deduplicated, for swatches) ───────────────────────────────

export interface ColorVariant {
  colorName: string;
  colorHex: string;
}

// ─── Printable Area ───────────────────────────────────────────────────────────

export interface PrintableAreaItem {
  id: string;
  position: PrintPosition;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

// ─── Product List Item (gallery) ─────────────────────────────────────────────

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  basePriceCop: number;
  printTechnique: string;
  featured: boolean;
  createdAt: string; // ISO string
  category: CategoryItem;
  /** First active variant — used for the gallery card image and default color */
  firstVariant: VariantSummary | null;
  /** All unique color variants — used for color swatches in the gallery card */
  colorVariants: ColorVariant[];
}

// ─── Product Detail (product page) ───────────────────────────────────────────

export interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  basePriceCop: number;
  printTechnique: string;
  featured: boolean;
  createdAt: string; // ISO string
  category: CategoryItem;
  variants: VariantSummary[];
  printableAreas: PrintableAreaItem[];
}

// ─── Paginated response ───────────────────────────────────────────────────────

export interface PaginatedProducts {
  products: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export type SortOption = "price_asc" | "price_desc" | "newest";

export interface ProductQueryParams {
  categorySlug?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
}
