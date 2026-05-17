import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getCategoriesWithCounts,
  getActiveProducts,
  getProductCount,
} from "@/server/queries/products";
import ProductGallery from "@/components/catalog/ProductGallery";
import CatalogSidebar from "@/components/catalog/CatalogSidebar";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";
import Pagination from "@/components/catalog/Pagination";
import { SITE_NAME } from "@/lib/constants";
import type { CategoryWithCount, ProductListItem, SortOption } from "@/lib/types/product";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const categories = await getCategoriesWithCounts();
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    page?: string;
    sizes?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  let categoryName: string | undefined;
  let categoryDescription: string | null | undefined;

  try {
    const categories = await getCategoriesWithCounts();
    const category = categories.find((c) => c.slug === slug);
    if (category) {
      categoryName = category.name;
      categoryDescription = category.description;
    }
  } catch {
    // DB unavailable
  }

  if (!categoryName) {
    return { title: `Categoría — ${SITE_NAME}` };
  }

  const title = `${categoryName} — ${SITE_NAME}`;
  const description =
    categoryDescription ??
    `Explora los productos de ${categoryName} en ${SITE_NAME}. Personalización DTF con envíos en Medellín y Área Metropolitana.`;

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary", title, description },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const sort: SortOption = isValidSort(sp.sort) ? sp.sort : "newest";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const sizes = sp.sizes ? sp.sizes.split(",").filter(Boolean) : [];
  const minPrice = sp.minPrice ? parseInt(sp.minPrice, 10) : undefined;
  const maxPrice = sp.maxPrice ? parseInt(sp.maxPrice, 10) : undefined;

  let categories: CategoryWithCount[] = [];
  let categoryError = false;

  try {
    categories = await getCategoriesWithCounts();
  } catch (error) {
    categoryError = true;
    console.error("No se pudieron cargar las categorías.", error);
  }

  const category = categories.find((c) => c.slug === slug);

  if (!category && !categoryError) {
    notFound();
  }

  let products: ProductListItem[] = [];
  let total = 0;
  let productsError = categoryError;

  if (!categoryError) {
    try {
      [products, total] = await Promise.all([
        getActiveProducts({ categorySlug: slug, sort, page, pageSize: PAGE_SIZE, minPrice, maxPrice, sizes }),
        getProductCount({ categorySlug: slug, minPrice, maxPrice, sizes }),
      ]);
    } catch (error) {
      productsError = true;
      console.error("No se pudo cargar la categoría.", error);
    }
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
          <li>
            <Link href="/productos" className="hover:underline" style={{ color: "var(--color-text-secondary)" }}>
              Productos
            </Link>
          </li>
          <li aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><polyline points="9 18 15 12 9 6"/></svg>
          </li>
          <li aria-current="page" style={{ color: "var(--color-text-primary)" }}>
            {category?.name ?? "Categoría"}
          </li>
        </ol>
      </nav>

      {/* Page title */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: "var(--color-text-primary)" }}
        >
          {category?.name ?? "Categoría"}
        </h1>
        {category?.description && (
          <p
            className="mt-2 max-w-2xl text-base"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {category.description}
          </p>
        )}
      </div>

      {productsError && <CatalogErrorNotice />}

      {/* Two-column layout */}
      <div className="lg:flex lg:gap-8">
        {/* Sidebar */}
        <aside className="mb-6 lg:mb-0 lg:w-60 lg:shrink-0">
          <Suspense fallback={<SidebarSkeleton />}>
            <CatalogSidebar
              categories={categories}
              activeCategory={slug}
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
        No pudimos cargar esta categoría.
      </p>
      <p className="mt-1">
        Revisa que PostgreSQL esté activo y que el esquema haya sido aplicado.
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
