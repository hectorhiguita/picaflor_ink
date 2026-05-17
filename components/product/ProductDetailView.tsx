"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductDetail, VariantSummary } from "@/lib/types/product";
import { formatCOP } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import VariantSelector from "@/components/product/VariantSelector";

interface ProductDetailViewProps {
  product: ProductDetail;
}

// Human-readable labels for printable area positions
const POSITION_LABELS: Record<string, string> = {
  FRONT_CHEST: "Pecho frontal",
  BACK: "Espalda",
  SLEEVE: "Manga",
  MUG_FRONT: "Frente del mug",
};

/**
 * Interactive product detail view.
 * Handles variant selection, mockup image display, price updates and CTA.
 * Meets Req 1.2, 3.1, 3.2, 10.1, 10.5.
 */
export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const { slug, name, description, basePriceCop, category, variants, printableAreas } =
    product;

  // Default to first available (non-UNAVAILABLE) variant, or just the first
  const defaultVariant =
    variants.find((v) => v.stockStatus !== "UNAVAILABLE") ?? variants[0] ?? null;

  const [selectedVariant, setSelectedVariant] = useState<VariantSummary | null>(
    defaultVariant
  );

  const effectivePrice = selectedVariant?.effectivePriceCop ?? basePriceCop;
  const mockupUrl = selectedVariant?.mockupImageUrl ?? null;

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* ── Left: Mockup image ──────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div
            className="relative aspect-square w-full overflow-hidden rounded-xl"
            style={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
            }}
          >
            {mockupUrl ? (
              <Image
                src={mockupUrl}
                alt={`Mockup de ${name}${selectedVariant ? ` en color ${selectedVariant.colorName}` : ""}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                loading="lazy"
                priority={false}
              />
            ) : (
              <PlaceholderImage name={name} />
            )}
          </div>

          {/* Printable areas info */}
          {printableAreas.length > 0 && (
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Áreas de impresión disponibles
              </p>
              <ul className="flex flex-wrap gap-2">
                {printableAreas.map((area) => (
                  <li key={area.id}>
                    <Badge variant="cyan">
                      {POSITION_LABELS[area.position] ?? area.position}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Right: Product info ─────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* Category badge */}
          <div>
            <Badge variant="default">{category.name}</Badge>
          </div>

          {/* Product name */}
          <h1
            className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
            style={{ color: "var(--color-text-primary)" }}
          >
            {name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span
              className="text-3xl font-extrabold"
              style={{ color: "var(--color-magenta)" }}
              aria-label={`Precio: ${formatCOP(effectivePrice)}`}
            >
              {formatCOP(effectivePrice)}
            </span>
            {selectedVariant?.effectivePriceCop !== basePriceCop && (
              <span
                className="text-sm line-through"
                style={{ color: "var(--color-text-secondary)" }}
                aria-label={`Precio base: ${formatCOP(basePriceCop)}`}
              >
                {formatCOP(basePriceCop)}
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {description}
            </p>
          )}

          {/* Variant selector */}
          {variants.length > 0 && (
            <VariantSelector
              variants={variants}
              selectedVariantId={selectedVariant?.id ?? null}
              onVariantChange={setSelectedVariant}
            />
          )}

          {/* Stock status message */}
          {selectedVariant && (
            <StockMessage stockStatus={selectedVariant.stockStatus} />
          )}

          {/* CTA — Personalizar */}
          <div className="mt-2">
            <Link
              href={
                selectedVariant
                  ? `/personalizar/${slug}?variant=${selectedVariant.id}`
                  : `/personalizar/${slug}`
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-4 text-base font-bold tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto"
              style={{
                backgroundColor:
                  selectedVariant?.stockStatus === "UNAVAILABLE"
                    ? "var(--color-surface-elevated)"
                    : "var(--color-magenta)",
                color:
                  selectedVariant?.stockStatus === "UNAVAILABLE"
                    ? "var(--color-text-secondary)"
                    : "#ffffff",
                border:
                  selectedVariant?.stockStatus === "UNAVAILABLE"
                    ? "1px solid var(--color-border)"
                    : "none",
                pointerEvents:
                  selectedVariant?.stockStatus === "UNAVAILABLE" ? "none" : "auto",
                // @ts-expect-error CSS custom property
                "--tw-ring-color": "var(--color-cyan)",
              }}
              aria-disabled={selectedVariant?.stockStatus === "UNAVAILABLE"}
              tabIndex={selectedVariant?.stockStatus === "UNAVAILABLE" ? -1 : 0}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Personalizar este producto
            </Link>
          </div>

          {/* Print technique badge */}
          <div className="flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--color-green)" }}
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span
              className="text-xs"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Técnica de impresión:{" "}
              <span style={{ color: "var(--color-green)" }}>
                {product.printTechnique}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlaceholderImage({ name }: { name: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      aria-hidden="true"
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "var(--color-border)" }}
        aria-label={`Sin imagen para ${name}`}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}

function StockMessage({ stockStatus }: { stockStatus: string }) {
  if (stockStatus === "UNAVAILABLE") {
    return (
      <p
        className="flex items-center gap-1.5 text-sm font-medium"
        style={{ color: "var(--color-error)" }}
        role="status"
        aria-live="polite"
      >
        <span aria-hidden="true">✕</span>
        Esta variante está agotada
      </p>
    );
  }

  if (stockStatus === "LIMITED") {
    return (
      <p
        className="flex items-center gap-1.5 text-sm font-medium"
        style={{ color: "var(--color-yellow)" }}
        role="status"
        aria-live="polite"
      >
        <span aria-hidden="true">⚠</span>
        Últimas unidades disponibles
      </p>
    );
  }

  return (
    <p
      className="flex items-center gap-1.5 text-sm"
      style={{ color: "var(--color-green)" }}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true">✓</span>
      Disponible
    </p>
  );
}
