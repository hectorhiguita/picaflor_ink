import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/server/queries/products";
import MockupCustomizer from "@/components/mockup/MockupCustomizer";
import { SITE_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

// ─── Page props ───────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ productSlug: string }>;
  searchParams: Promise<{ variant?: string }>;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

/**
 * Per-product customizer metadata.
 * Meets Req 10.1: unique title including "Picaflor INK".
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productSlug } = await params;
  const product = await getProductBySlug(productSlug);

  if (!product) {
    return {
      title: `Personalizar — ${SITE_NAME}`,
    };
  }

  const title = `Personalizar ${product.name} — ${SITE_NAME}`;
  const description =
    product.description ??
    `Personaliza ${product.name} con tu diseño favorito. Impresión DTF de alta calidad.`;

  return {
    title,
    description,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Mockup Generator page — /personalizar/[productSlug]
 *
 * Server Component: fetches product data and passes it to the interactive
 * MockupCustomizer client component.
 *
 * Accepts `?variant=<variantId>` search param to pre-select a variant
 * (e.g. when navigating from the product detail page).
 *
 * Meets Req 3.1, 3.2, 3.9.
 */
export default async function PersonalizarPage({ params, searchParams }: PageProps) {
  const { productSlug } = await params;
  const { variant: initialVariantId } = await searchParams;

  const product = await getProductBySlug(productSlug);

  if (!product) {
    notFound();
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        backgroundColor: "var(--color-bg-primary)",
        paddingTop: "var(--space-8)",
        paddingBottom: "var(--space-16)",
      }}
    >
      <MockupCustomizer
        product={product}
        initialVariantId={initialVariantId}
      />
    </main>
  );
}
