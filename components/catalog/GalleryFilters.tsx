"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { CategoryItem } from "@/lib/types/product";
import type { SortOption } from "@/lib/types/product";

interface GalleryFiltersProps {
  categories: CategoryItem[];
  /** Currently active category slug (undefined = all) */
  activeCategory?: string;
  /** Currently active sort option */
  activeSort: SortOption;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
];

/**
 * Client component for category filter tabs and sort dropdown.
 * Updates URL search params on change without full page reload.
 * Meets Req 1.3, 1.4.
 */
export default function GalleryFilters({
  categories,
  activeCategory,
  activeSort,
}: GalleryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /** Build a new URL with updated params, resetting page to 1 on filter change */
  const buildUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      // Reset to page 1 whenever filters change
      if ("category" in updates || "sort" in updates) {
        params.delete("page");
      }

      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams]
  );

  const handleCategoryChange = (slug: string | undefined) => {
    router.push(buildUrl({ category: slug }), { scroll: false });
  };

  const handleSortChange = (value: SortOption) => {
    router.push(buildUrl({ sort: value }), { scroll: false });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Category filter tabs */}
      <nav aria-label="Filtrar por categoría">
        <ul className="flex flex-wrap gap-2" role="list">
          {/* "All" tab */}
          <li>
            <CategoryButton
              label="Todos"
              isActive={!activeCategory}
              onClick={() => handleCategoryChange(undefined)}
            />
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <CategoryButton
                label={cat.name}
                isActive={activeCategory === cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2 shrink-0">
        <label
          htmlFor="sort-select"
          className="text-sm whitespace-nowrap"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Ordenar por:
        </label>
        <select
          id="sort-select"
          value={activeSort}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="rounded px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 cursor-pointer"
          style={{
            backgroundColor: "var(--color-surface-elevated)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            outlineColor: "var(--color-cyan)",
          }}
          aria-label="Ordenar productos"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface CategoryButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function CategoryButton({ label, isActive, onClick }: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 cursor-pointer"
      style={
        isActive
          ? {
              backgroundColor: "var(--color-magenta)",
              color: "#ffffff",
              border: "1px solid var(--color-magenta)",
              outlineColor: "var(--color-cyan)",
            }
          : {
              backgroundColor: "transparent",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
              outlineColor: "var(--color-cyan)",
            }
      }
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = "var(--color-text-primary)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = "var(--color-text-secondary)";
          e.currentTarget.style.borderColor = "var(--color-border)";
        }
      }}
    >
      {label}
    </button>
  );
}
