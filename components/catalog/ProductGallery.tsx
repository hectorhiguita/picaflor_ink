import type { ProductListItem } from "@/lib/types/product";
import ProductCard from "./ProductCard";

interface ProductGalleryProps {
  products: ProductListItem[];
}

/**
 * Responsive grid of ProductCards.
 * 1 column on mobile, 2 on tablet, 3–4 on desktop.
 * Shows an empty state when no products are found.
 * Meets Req 1.1.
 */
export default function ProductGallery({ products }: ProductGalleryProps) {
  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <section aria-label="Catálogo de productos">
      <ul
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
      >
        {products.map((product) => (
          <li key={product.id} role="listitem">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-lg px-6 py-20 text-center"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
      role="status"
      aria-live="polite"
    >
      {/* Illustration */}
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "var(--color-text-secondary)" }}
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>

      <div>
        <p
          className="text-base font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          No se encontraron productos
        </p>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Intenta con otro filtro o categoría.
        </p>
      </div>
    </div>
  );
}
