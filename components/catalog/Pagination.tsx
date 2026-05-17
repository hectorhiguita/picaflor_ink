"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

/**
 * Pagination component that updates the URL `?page=N` param.
 * Hidden when totalPages <= 1.
 * Meets Req 1.5.
 */
export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildPageUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams]
  );

  const goToPage = (page: number) => {
    router.push(buildPageUrl(page), { scroll: true });
  };

  if (totalPages <= 1) return null;

  const pages = buildPageRange(currentPage, totalPages);

  return (
    <nav
      aria-label="Paginación de productos"
      className="flex items-center justify-center gap-1"
    >
      {/* Previous */}
      <PageButton
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeftIcon />
      </PageButton>

      {/* Page numbers */}
      {pages.map((item, idx) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex h-9 w-9 items-center justify-center text-sm select-none"
            style={{ color: "var(--color-text-secondary)" }}
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <PageButton
            key={item}
            onClick={() => goToPage(item)}
            isActive={item === currentPage}
            aria-label={`Ir a página ${item}`}
            aria-current={item === currentPage ? "page" : undefined}
          >
            {item}
          </PageButton>
        )
      )}

      {/* Next */}
      <PageButton
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRightIcon />
      </PageButton>
    </nav>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a compact page range with ellipsis for large page counts.
 * e.g. [1, 2, 3, "ellipsis", 10] or [1, "ellipsis", 4, 5, 6, "ellipsis", 10]
 */
function buildPageRange(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const range: (number | "ellipsis")[] = [];

  // Always show first page
  range.push(1);

  if (current > 3) {
    range.push("ellipsis");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  if (current < total - 2) {
    range.push("ellipsis");
  }

  // Always show last page
  range.push(total);

  return range;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PageButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  children: React.ReactNode;
  "aria-label"?: string;
  "aria-current"?: "page" | undefined;
}

function PageButton({
  onClick,
  disabled = false,
  isActive = false,
  children,
  ...ariaProps
}: PageButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
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
        if (!isActive && !disabled) {
          e.currentTarget.style.color = "var(--color-text-primary)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive && !disabled) {
          e.currentTarget.style.color = "var(--color-text-secondary)";
          e.currentTarget.style.borderColor = "var(--color-border)";
        }
      }}
      {...ariaProps}
    >
      {children}
    </button>
  );
}

function ChevronLeftIcon() {
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
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
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
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
