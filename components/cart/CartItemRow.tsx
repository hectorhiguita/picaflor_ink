"use client";

import Image from "next/image";
import Link from "next/link";
import type { CartItemData } from "@/lib/types/cart";
import { formatCOP } from "@/lib/utils";

interface CartItemRowProps {
  item: CartItemData;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

/**
 * Renders a single cart item row with preview image, product info,
 * quantity controls, pricing and a remove button.
 * Meets Req 4.2, 4.3, 4.4, 4.7.
 */
export default function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const lineTotal = item.unitPriceCop * item.quantity;

  function handleDecrement() {
    if (item.quantity <= 1) {
      // Reducing to 0 removes the item (Req 4.3)
      onRemove(item.id);
    } else {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  }

  function handleIncrement() {
    onUpdateQuantity(item.id, item.quantity + 1);
  }

  return (
    <article
      className="flex gap-4 rounded-xl p-4 sm:gap-6"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
      aria-label={`${item.productName} — ${item.variantLabel}`}
    >
      {/* Preview image */}
      <div
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28"
        style={{
          backgroundColor: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
        }}
      >
        {item.previewUrl ? (
          <Image
            src={item.previewUrl}
            alt={`Preview de ${item.productName}`}
            fill
            sizes="112px"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <PlaceholderImage name={item.productName} />
        )}
      </div>

      {/* Item details */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Product name + variant */}
        <div>
          <Link
            href={`/productos/${item.productSlug}`}
            className="line-clamp-2 text-sm font-semibold leading-snug transition-colors hover:underline focus-visible:outline-none focus-visible:underline"
            style={{ color: "var(--color-text-primary)" }}
          >
            {item.productName}
          </Link>
          <p
            className="mt-0.5 text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {item.variantLabel}
          </p>
        </div>

        {/* Unit price */}
        <p
          className="text-xs"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Precio unitario:{" "}
          <span style={{ color: "var(--color-text-primary)" }}>
            {formatCOP(item.unitPriceCop)}
          </span>
        </p>

        {/* Bottom row: quantity controls + line total + remove */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          {/* Quantity controls */}
          <div
            className="flex items-center gap-1 rounded-lg"
            style={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
            }}
            role="group"
            aria-label={`Cantidad de ${item.productName}`}
          >
            <button
              type="button"
              onClick={handleDecrement}
              className="flex h-8 w-8 items-center justify-center rounded-l-lg text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-2"
              style={{
                color: "var(--color-text-secondary)",
                // @ts-expect-error CSS custom property
                "--tw-ring-color": "var(--color-cyan)",
              }}
              aria-label={
                item.quantity <= 1
                  ? `Eliminar ${item.productName}`
                  : `Reducir cantidad de ${item.productName}`
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-error)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
            >
              −
            </button>

            <span
              className="min-w-[2rem] text-center text-sm font-semibold tabular-nums"
              style={{ color: "var(--color-text-primary)" }}
              aria-live="polite"
              aria-atomic="true"
            >
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={handleIncrement}
              className="flex h-8 w-8 items-center justify-center rounded-r-lg text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-2"
              style={{
                color: "var(--color-text-secondary)",
                // @ts-expect-error CSS custom property
                "--tw-ring-color": "var(--color-cyan)",
              }}
              aria-label={`Aumentar cantidad de ${item.productName}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-cyan)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
            >
              +
            </button>
          </div>

          {/* Line total */}
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: "var(--color-magenta)" }}
            aria-label={`Subtotal: ${formatCOP(lineTotal)}`}
          >
            {formatCOP(lineTotal)}
          </span>

          {/* Remove button */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2"
            style={{
              color: "var(--color-text-secondary)",
              // @ts-expect-error CSS custom property
              "--tw-ring-color": "var(--color-cyan)",
            }}
            aria-label={`Eliminar ${item.productName} del carrito`}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-error)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-text-secondary)";
            }}
          >
            <TrashIcon />
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        </div>
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
    >
      <svg
        width="36"
        height="36"
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

function TrashIcon() {
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
