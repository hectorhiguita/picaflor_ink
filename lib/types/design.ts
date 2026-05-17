/**
 * TypeScript types for design catalog API responses.
 */

// ─── Design Item ──────────────────────────────────────────────────────────────

export interface DesignItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  imageUrl: string | null;
  createdAt: string; // ISO string
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface DesignQueryParams {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

// ─── Paginated Response ───────────────────────────────────────────────────────

export interface PaginatedDesigns {
  designs: DesignItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
