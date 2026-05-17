import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  getActiveProducts,
  getProductCount,
  getCategoriesWithCounts,
} from "@/server/queries/products";
import type { ProductListItem, SortOption, CategoryWithCount } from "@/lib/types/product";
import CatalogSidebar from "@/components/catalog/CatalogSidebar";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";
import ProductGallery from "@/components/catalog/ProductGallery";
import Pagination from "@/components/catalog/Pagination";
import { SITE_NAME } from "@/lib/constants";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Productos",
  description: `Explora el catálogo de ${SITE_NAME}: camisetas, hoodies, jerseys, mugs y más productos personalizados con impresión DTF. Envíos en Medellín y Área Metropolitana.`,
  openGraph: {
    title: `Productos — ${SITE_NAME}`,
    description: `Catálogo completo de productos personalizados de ${SITE_NAME}. Elige tu diseño favorito.`,
  },
};

// ─── Search params ────────────────────────────────────────────────────────────

interface ProductosPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
    sizes?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const params = await searchParams;

  const categorySlug = params.category ?? undefined;
  const sort: SortOption = isValidSort(params.sort) ? params.sort : "newest";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const sizes = params.sizes ? params.sizes.split(",").filter(Boolean) : [];
  const minPrice = params.minPrice ? parseInt(params.minPrice, 10) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice, 10) : undefined;

  let products: ProductListItem[] = [];
  let total = 0;
  let categories: CategoryWithCount[] = [];
  let catalogError = false;

  try {
    [products, total, categories] = await Promise.all([
      getActiveProducts({ categorySlug, sort, page, pageSize: PAGE_SIZE, minPrice, maxPrice, sizes }),
      getProductCount({ categorySlug, minPrice, maxPrice, sizes }),
      getCategoriesWithCounts(),
    ]);
  } catch (error) {
    catalogError = true;
    console.error("No se pudo cargar el catálogo de productos.", error);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          <li>
            <Link href="/" className="hover:underline" style={{ color: "var(--color-text-secondary)" }}>
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><polyline points="9 18 15 12 9 6"/></svg>
          </li>
          <li aria-current="page" style={{ color: "var(--color-text-primary)" }}>
            Productos
          </li>
        </ol>
      </nav>

      {/* Page title */}
      <h1
        className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ color: "var(--color-text-primary)" }}
      >
        Productos
      </h1>

      {catalogError && <CatalogErrorNotice />}

      {/* Two-column layout */}
      <div className="lg:flex lg:gap-8">
        {/* Sidebar */}
        <aside className="mb-6 lg:mb-0 lg:w-60 lg:shrink-0">
          <Suspense fallback={<SidebarSkeleton />}>
            <CatalogSidebar
              categories={categories}
              activeCategory={categorySlug}
              activeSizes={sizes}
              activeMinPrice={minPrice}
              activeMaxPrice={maxPrice}
            />
          </Suspense>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <Suspense fallback={<ToolbarSkeleton />}>
            <CatalogToolbar total={total} activeSort={sort} />
          </Suspense>

          <ProductGallery products={products} />

          {totalPages > 1 && (
            <div className="mt-10">
              <Suspense fallback={null}>
                <Pagination currentPage={page} totalPages={totalPages} />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidSort(value: string | undefined): value is SortOption {
  return value === "price_asc" || value === "price_desc" || value === "newest";
}

function CatalogErrorNotice() {
  return (
    <section
      className="mb-8 rounded-lg p-4 text-sm"
      style={{
        backgroundColor: "rgba(255,69,0,0.08)",
        border: "1px solid rgba(255,69,0,0.28)",
        color: "var(--color-text-secondary)",
      }}
      role="status"
    >
      <p className="font-bold" style={{ color: "var(--color-text-primary)" }}>
        No pudimos cargar el catálogo.
      </p>
      <p className="mt-1">
        Revisa que PostgreSQL esté activo y que hayas ejecutado `npm run db:push` y `npm run db:seed`.
      </p>
    </section>
  );
}

function SidebarSkeleton() {
  return (
    <div
      className="rounded-lg p-4 space-y-4"
      style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      aria-hidden="true"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-7 animate-pulse rounded"
          style={{ backgroundColor: "var(--color-surface-elevated)" }}
        />
      ))}
    </div>
  );
}

function ToolbarSkeleton() {
  return (
    <div
      className="h-10 animate-pulse rounded mb-5"
      style={{ backgroundColor: "var(--color-surface-elevated)" }}
      aria-hidden="true"
    />
  );
}
