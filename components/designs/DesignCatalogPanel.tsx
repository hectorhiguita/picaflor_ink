"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { DesignItem, PaginatedDesigns } from "@/lib/types/design";
import DesignCard from "@/components/designs/DesignCard";

const PAGE_SIZE = 24;
const DEBOUNCE_MS = 300;

interface DesignCatalogPanelProps {
  /** Called when the user clicks a design card */
  onDesignSelect: (design: DesignItem) => void;
  /** ID of the currently selected design (highlights the card) */
  selectedDesignId?: string;
}

/**
 * Client component that renders the full design catalog with:
 * - Debounced search input (300ms)
 * - Category filter buttons (All + each category)
 * - Responsive grid of DesignCard components
 * - Pagination (previous / next page)
 * - Loading and empty states
 * Meets Req 2.2, 2.4, 2.7.
 */
export default function DesignCatalogPanel({
  onDesignSelect,
  selectedDesignId,
}: DesignCatalogPanelProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // debounced value
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    undefined
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedDesigns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Debounce search ────────────────────────────────────────────────────────
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearch(value);
      setPage(1); // reset to first page on new search
    }, DEBOUNCE_MS);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // ── Fetch categories once ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/designs/categories")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((cats: string[]) => setCategories(cats))
      .catch(() => {
        // Non-critical: categories just won't show filter buttons
      });
  }, []);

  // ── Fetch designs ──────────────────────────────────────────────────────────
  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (activeCategory) params.set("category", activeCategory);
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));

    try {
      const res = await fetch(`/api/designs?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      const json: PaginatedDesigns = await res.json();
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los diseños."
      );
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, page]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCategoryChange = (cat: string | undefined) => {
    setActiveCategory(cat);
    setPage(1);
  };

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () =>
    setPage((p) => (data ? Math.min(data.totalPages, p + 1) : p));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div className="relative">
        <label htmlFor="design-search" className="sr-only">
          Buscar diseños por nombre
        </label>
        <span
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center"
          aria-hidden="true"
        >
          <SearchIcon />
        </span>
        <input
          id="design-search"
          type="search"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar diseños…"
          className="w-full rounded-lg py-2.5 pl-10 pr-4 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{
            backgroundColor: "var(--color-surface-elevated)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            outlineColor: "var(--color-cyan)",
          }}
          aria-label="Buscar diseños por nombre"
          autoComplete="off"
        />
      </div>

      {/* Category filter buttons */}
      {categories.length > 0 && (
        <nav aria-label="Filtrar por categoría de diseño">
          <ul className="flex flex-wrap gap-2" role="list">
            <li>
              <CategoryButton
                label="Todos"
                isActive={!activeCategory}
                onClick={() => handleCategoryChange(undefined)}
              />
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <CategoryButton
                  label={cat}
                  isActive={activeCategory === cat}
                  onClick={() => handleCategoryChange(cat)}
                />
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Results count */}
      {!loading && data && (
        <p
          className="text-xs"
          style={{ color: "var(--color-text-secondary)" }}
          aria-live="polite"
          aria-atomic="true"
        >
          {data.total === 0
            ? "Sin resultados"
            : `${data.total} diseño${data.total !== 1 ? "s" : ""}${
                search ? ` para "${search}"` : ""
              }${activeCategory ? ` en ${activeCategory}` : ""}`}
        </p>
      )}

      {/* Loading state */}
      {loading && (
        <div
          className="flex items-center justify-center py-16"
          aria-label="Cargando diseños"
          role="status"
        >
          <LoadingSpinner />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          className="rounded-lg p-4 text-sm"
          style={{
            backgroundColor: "rgba(255,77,77,0.1)",
            border: "1px solid rgba(255,77,77,0.3)",
            color: "var(--color-error)",
          }}
          role="alert"
        >
          <p className="font-medium">Error al cargar diseños</p>
          <p className="mt-1 opacity-80">{error}</p>
          <button
            type="button"
            onClick={fetchDesigns}
            className="mt-2 text-xs underline cursor-pointer focus-visible:outline-none focus-visible:ring-2"
            style={{ outlineColor: "var(--color-cyan)" }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && data?.designs.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-3 py-16 text-center"
          role="status"
        >
          <EmptyIcon />
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            No se encontraron diseños
            {search && (
              <>
                {" "}
                para{" "}
                <span style={{ color: "var(--color-text-primary)" }}>
                  &ldquo;{search}&rdquo;
                </span>
              </>
            )}
            {activeCategory && (
              <>
                {" "}
                en{" "}
                <span style={{ color: "var(--color-text-primary)" }}>
                  {activeCategory}
                </span>
              </>
            )}
          </p>
          {(search || activeCategory) && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setActiveCategory(undefined);
                setPage(1);
              }}
              className="text-xs underline cursor-pointer focus-visible:outline-none focus-visible:ring-2"
              style={{
                color: "var(--color-cyan)",
                outlineColor: "var(--color-cyan)",
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Design grid */}
      {!loading && !error && data && data.designs.length > 0 && (
        <ul
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          role="list"
          aria-label="Catálogo de diseños"
        >
          {data.designs.map((design) => (
            <li key={design.id}>
              <DesignCard
                design={design}
                isSelected={selectedDesignId === design.id}
                onSelect={onDesignSelect}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {!loading && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={page <= 1}
            className="flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            style={{
              backgroundColor: "transparent",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
              outlineColor: "var(--color-cyan)",
            }}
            aria-label="Página anterior"
          >
            <ChevronLeftIcon />
            Anterior
          </button>

          <span
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
            aria-live="polite"
          >
            Página{" "}
            <span style={{ color: "var(--color-text-primary)" }}>{page}</span>{" "}
            de{" "}
            <span style={{ color: "var(--color-text-primary)" }}>
              {data.totalPages}
            </span>
          </span>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={page >= data.totalPages}
            className="flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            style={{
              backgroundColor: "transparent",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
              outlineColor: "var(--color-cyan)",
            }}
            aria-label="Página siguiente"
          >
            Siguiente
            <ChevronRightIcon />
          </button>
        </div>
      )}
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
      className="rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 cursor-pointer"
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

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--color-text-secondary)" }}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin"
      style={{ color: "var(--color-magenta)" }}
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--color-border)" }}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
