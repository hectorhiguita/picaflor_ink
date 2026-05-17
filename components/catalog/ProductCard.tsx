import Image from "next/image";
import Link from "next/link";
import type { ProductListItem } from "@/lib/types/product";
import { formatCOP } from "@/lib/utils";

interface ProductCardProps {
  product: ProductListItem;
}

const NEW_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export default function ProductCard({ product }: ProductCardProps) {
  const { slug, name, basePriceCop, firstVariant, colorVariants, category, createdAt, featured } = product;
  const imageUrl = firstVariant?.mockupImageUrl ?? null;
  const isNew = Date.now() - new Date(createdAt).getTime() < NEW_THRESHOLD_MS;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-lg transition-transform duration-200 hover:-translate-y-1 focus-within:-translate-y-1"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden">
        <Link
          href={`/productos/${slug}`}
          className="block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
          style={{ outlineColor: "var(--color-cyan)" }}
          tabIndex={0}
          aria-label={`Ver ${name}`}
        >
          <div
            className="relative h-full w-full"
            style={{ backgroundColor: "var(--color-surface-elevated)" }}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`Mockup de ${name}${firstVariant ? ` en color ${firstVariant.colorName}` : ""}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <PlaceholderImage name={name} />
            )}
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none">
          {isNew && (
            <span
              className="rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide"
              style={{ backgroundColor: "var(--color-cyan)", color: "#000" }}
            >
              Nuevo
            </span>
          )}
          {featured && !isNew && (
            <span
              className="rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide"
              style={{ backgroundColor: "var(--color-magenta)", color: "#fff" }}
            >
              Destacado
            </span>
          )}
        </div>

        {/* "Personalizar" CTA overlay — visible on group hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-200 group-hover:translate-y-0 p-3">
          <Link
            href={`/personalizar/${slug}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-xs font-bold uppercase tracking-wide transition-opacity"
            style={{
              backgroundColor: "var(--color-magenta)",
              color: "#fff",
            }}
            tabIndex={-1}
            aria-hidden="true"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Personalizar
          </Link>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {/* Category label */}
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {category.name}
        </span>

        {/* Product name */}
        <Link
          href={`/productos/${slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug transition-colors duration-150 hover:underline focus-visible:outline-none"
          style={{ color: "var(--color-text-primary)" }}
        >
          {name}
        </Link>

        {/* Price */}
        <p
          className="mt-auto text-base font-bold pt-1"
          style={{ color: "var(--color-magenta)" }}
        >
          {formatCOP(basePriceCop)}
        </p>

        {/* Color swatches */}
        {colorVariants.length > 0 && (
          <ColorSwatches colorVariants={colorVariants} />
        )}
      </div>
    </article>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlaceholderImage({ name }: { name: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      aria-hidden="true"
      style={{ backgroundColor: "var(--color-surface-elevated)" }}
    >
      <svg
        width="64"
        height="64"
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

const MAX_SWATCHES = 5;

function ColorSwatches({
  colorVariants,
}: {
  colorVariants: { colorName: string; colorHex: string }[];
}) {
  const visible = colorVariants.slice(0, MAX_SWATCHES);
  const overflow = colorVariants.length - MAX_SWATCHES;

  return (
    <div className="flex items-center gap-1.5" aria-label="Colores disponibles">
      {visible.map((v) => (
        <span
          key={v.colorName}
          className="inline-block h-4 w-4 rounded-full flex-shrink-0"
          style={{
            backgroundColor: v.colorHex,
            outline: "1.5px solid var(--color-border)",
            outlineOffset: "1px",
          }}
          title={v.colorName}
          aria-label={v.colorName}
        />
      ))}
      {overflow > 0 && (
        <span
          className="text-xs"
          style={{ color: "var(--color-text-secondary)" }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
