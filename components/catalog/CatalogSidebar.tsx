"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { CategoryWithCount } from "@/lib/types/product";

interface CatalogSidebarProps {
  categories: CategoryWithCount[];
  activeCategory?: string;
  activeSizes: string[];
  activeMinPrice?: number;
  activeMaxPrice?: number;
}

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL"];

export default function CatalogSidebar({
  categories,
  activeCategory,
  activeSizes,
  activeMinPrice,
  activeMaxPrice,
}: CatalogSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      const filterKeys = ["category", "sizes", "minPrice", "maxPrice"];
      if (Object.keys(updates).some((k) => filterKeys.includes(k))) {
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

  const handleSizeToggle = (size: string) => {
    const next = activeSizes.includes(size)
      ? activeSizes.filter((s) => s !== size)
      : [...activeSizes, size];
    router.push(
      buildUrl({ sizes: next.length > 0 ? next.join(",") : undefined }),
      { scroll: false }
    );
  };

  const handleMinPrice = (value: string) => {
    router.push(
      buildUrl({ minPrice: value || undefined }),
      { scroll: false }
    );
  };

  const handleMaxPrice = (value: string) => {
    router.push(
      buildUrl({ maxPrice: value || undefined }),
      { scroll: false }
    );
  };

  const handleClearFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters =
    activeCategory ||
    activeSizes.length > 0 ||
    activeMinPrice !== undefined ||
    activeMaxPrice !== undefined;

  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-3">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
          }}
        >
          <span className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="20" y2="12" />
              <line x1="12" y1="18" x2="20" y2="18" />
            </svg>
            Filtros
            {hasActiveFilters && (
              <span
                className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-xs font-bold"
                style={{
                  backgroundColor: "var(--color-magenta)",
                  color: "#fff",
                }}
              >
                {(activeCategory ? 1 : 0) +
                  (activeSizes.length > 0 ? 1 : 0) +
                  (activeMinPrice !== undefined || activeMaxPrice !== undefined
                    ? 1
                    : 0)}
              </span>
            )}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${mobileOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Sidebar content */}
      <div
        className={`${mobileOpen ? "block" : "hidden"} lg:block space-y-6 rounded-lg p-4`}
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Filtros
          </h2>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs transition-colors hover:opacity-80"
              style={{ color: "var(--color-magenta)" }}
            >
              Limpiar todo
            </button>
          )}
        </div>

        {/* Categories */}
        <section>
          <h3
            className="mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Categoría
          </h3>
          <ul className="space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => handleCategoryChange(undefined)}
                className="w-full flex items-center justify-between rounded px-2 py-1.5 text-sm text-left transition-all"
                style={
                  !activeCategory
                    ? {
                        backgroundColor: "var(--color-magenta)",
                        color: "#fff",
                        fontWeight: 600,
                      }
                    : { color: "var(--color-text-secondary)" }
                }
              >
                <span>Todos</span>
                <span
                  className="text-xs"
                  style={{ opacity: 0.7 }}
                >
                  {totalCount}
                </span>
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => handleCategoryChange(cat.slug)}
                  className="w-full flex items-center justify-between rounded px-2 py-1.5 text-sm text-left transition-all"
                  style={
                    activeCategory === cat.slug
                      ? {
                          backgroundColor: "var(--color-magenta)",
                          color: "#fff",
                          fontWeight: 600,
                        }
                      : { color: "var(--color-text-secondary)" }
                  }
                >
                  <span>{cat.name}</span>
                  <span className="text-xs" style={{ opacity: 0.7 }}>
                    {cat.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Divider */}
        <hr style={{ borderColor: "var(--color-border)" }} />

        {/* Sizes */}
        <section>
          <h3
            className="mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Talla
          </h3>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SIZES.map((size) => {
              const isActive = activeSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className="rounded px-3 py-1 text-xs font-medium transition-all"
                  style={
                    isActive
                      ? {
                          backgroundColor: "var(--color-magenta)",
                          color: "#fff",
                          border: "1px solid var(--color-magenta)",
                        }
                      : {
                          backgroundColor: "transparent",
                          color: "var(--color-text-secondary)",
                          border: "1px solid var(--color-border)",
                        }
                  }
                >
                  {size}
                </button>
              );
            })}
          </div>
        </section>

        {/* Divider */}
        <hr style={{ borderColor: "var(--color-border)" }} />

        {/* Price range */}
        <section>
          <h3
            className="mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Precio (COP)
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Mínimo"
              defaultValue={activeMinPrice ?? ""}
              onBlur={(e) => handleMinPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleMinPrice(e.currentTarget.value);
              }}
              className="w-full rounded px-2 py-1.5 text-xs"
              style={{
                backgroundColor: "var(--color-surface-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
              min={0}
              step={5000}
              aria-label="Precio mínimo"
            />
            <span style={{ color: "var(--color-text-secondary)" }} aria-hidden>—</span>
            <input
              type="number"
              placeholder="Máximo"
              defaultValue={activeMaxPrice ?? ""}
              onBlur={(e) => handleMaxPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleMaxPrice(e.currentTarget.value);
              }}
              className="w-full rounded px-2 py-1.5 text-xs"
              style={{
                backgroundColor: "var(--color-surface-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
              min={0}
              step={5000}
              aria-label="Precio máximo"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
