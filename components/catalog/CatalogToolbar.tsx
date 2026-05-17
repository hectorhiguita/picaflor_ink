"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { SortOption } from "@/lib/types/product";

interface CatalogToolbarProps {
  total: number;
  activeSort: SortOption;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
];

export default function CatalogToolbar({ total, activeSort }: CatalogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = useCallback(
    (value: SortOption) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", value);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <div
      className="flex items-center justify-between py-3 mb-5"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        <span
          className="font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {total}
        </span>{" "}
        producto{total !== 1 ? "s" : ""}
      </p>

      <div className="flex items-center gap-2">
        <label
          htmlFor="catalog-sort"
          className="text-xs whitespace-nowrap"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Ordenar:
        </label>
        <select
          id="catalog-sort"
          value={activeSort}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{
            backgroundColor: "var(--color-surface-elevated)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            outlineColor: "var(--color-cyan)",
          }}
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
