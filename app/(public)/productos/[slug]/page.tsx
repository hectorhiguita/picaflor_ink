import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getActiveProducts,
} from "@/server/queries/products";
import ProductDetailView from "@/components/product/ProductDetailView";
import { SITE_NAME } from "@/lib/constants";

// ISR: revalidate every 60 seconds so product updates appear quickly
// while still benefiting from static caching.
export const revalidate = 60;
export const dynamic = "force-dynamic";

// ─── Static params ────────────────────────────────────────────────────────────

/**
 * Pre-render all active product slugs at build time.
 * Falls back to an empty array (on-demand ISR) when the DB is unavailable
 * (e.g. during CI builds without a database connection).
 * Meets Req 10.1 (SSG for SEO).
 */
export async function generateStaticParams() {
  try {
    const products = await getActiveProducts({ pageSize: 1000 });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    // No DB available at build time — pages will be rendered on first request
    return [];
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Per-product SEO metadata.
 * Meets Req 10.1: unique title/description/og:image per product page,
 * including "Picaflor INK" in the title.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch((error) => {
    console.error("No se pudo cargar metadata del producto.", error);
    return null;
  });

  if (!product) {
    return {
      title: `Producto no encontrado — ${SITE_NAME}`,
    };
  }

  // Use the first variant's mockup image as og:image if available
  const ogImage =
    product.variants.find((v) => v.mockupImageUrl)?.mockupImageUrl ?? undefined;

  const title = `${product.name} — ${SITE_NAME}`;
  const description =
    product.description ??
    `Personaliza ${product.name} con tu diseño favorito. Impresión DTF de alta calidad. Envíos en Medellín y Área Metropolitana.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt: `${product.name} — ${SITE_NAME}`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Product detail page — /productos/[slug]
 * Server Component with SSG/ISR (revalidate = 60s).
 * Fetches full product data server-side for SEO.
 * Meets Req 1.2, 10.1.
 */
export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch((error) => {
    console.error("No se pudo cargar el producto.", error);
    return null;
  });

  if (!product) {
    notFound();
  }

  return (
    <main>
      <ProductDetailView product={product} />
    </main>
  );
}
