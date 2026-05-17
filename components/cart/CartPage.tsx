"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore, selectIsCartEmpty } from "@/lib/cart-store";
import CartItemRow from "@/components/cart/CartItemRow";
import CartSummary from "@/components/cart/CartSummary";

/**
 * Main cart page client component.
 * Fetches cart on mount, shows loading skeleton, empty state or item list + summary.
 * Meets Req 4.2, 4.3, 4.4, 4.6, 4.7.
 */
export default function CartPage() {
  const cart = useCartStore((s) => s.cart);
  const loading = useCartStore((s) => s.loading);
  const error = useCartStore((s) => s.error);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const setCart = useCartStore((s) => s.setCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const isEmpty = useCartStore(selectIsCartEmpty);

  // Fetch cart from server on mount to ensure fresh data
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <header className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: "var(--color-text-primary)" }}
        >
          Carrito
        </h1>
      </header>

      {/* Loading skeleton */}
      {loading && !cart && <CartSkeleton />}

      {/* Error state */}
      {error && !loading && (
        <div
          className="mb-6 rounded-xl px-5 py-4 text-sm"
          style={{
            backgroundColor: "rgba(255,77,77,0.1)",
            border: "1px solid rgba(255,77,77,0.3)",
            color: "var(--color-error)",
          }}
          role="alert"
        >
          <strong>Error al cargar el carrito:</strong> {error}
        </div>
      )}

      {/* Empty state (Req 4.6) */}
      {!loading && isEmpty && (
        <EmptyCart />
      )}

      {/* Cart content */}
      {!isEmpty && cart && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Items list */}
          <section aria-label="Ítems del carrito">
            <div className="flex flex-col gap-4">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            {/* Continue shopping link */}
            <div className="mt-6">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 text-sm transition-colors focus-visible:outline-none focus-visible:underline"
                style={{ color: "var(--color-text-secondary)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--color-cyan)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--color-text-secondary)";
                }}
              >
                <ArrowLeftIcon />
                Continuar comprando
              </Link>
            </div>
          </section>

          {/* Order summary sidebar */}
          <div className="lg:sticky lg:top-24">
            <CartSummary cart={cart} onCartUpdated={setCart} />
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Empty cart state with link to continue shopping (Req 4.6) */
function EmptyCart() {
  return (
    <div
      className="flex flex-col items-center gap-6 rounded-2xl px-8 py-16 text-center"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
      role="status"
      aria-live="polite"
    >
      {/* Cart icon */}
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--color-surface-elevated)" }}
        aria-hidden="true"
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Tu carrito está vacío
        </h2>
        <p
          className="max-w-xs text-sm leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Aún no has agregado ningún producto. ¡Explora el catálogo y
          personaliza tu primer artículo!
        </p>
      </div>

      <Link
        href="/productos"
        className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          backgroundColor: "var(--color-magenta)",
          color: "#ffffff",
          // @ts-expect-error CSS custom property
          "--tw-ring-color": "var(--color-cyan)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.filter =
            "brightness(1.15)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.filter = "";
        }}
      >
        Ver productos
      </Link>
    </div>
  );
}

/** Loading skeleton while cart is being fetched */
function CartSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]"
      aria-busy="true"
      aria-label="Cargando carrito"
    >
      {/* Items skeleton */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-xl p-4"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="h-24 w-24 shrink-0 animate-pulse rounded-lg"
              style={{ backgroundColor: "var(--color-surface-elevated)" }}
            />
            <div className="flex flex-1 flex-col gap-3">
              <div
                className="h-4 w-3/4 animate-pulse rounded"
                style={{ backgroundColor: "var(--color-surface-elevated)" }}
              />
              <div
                className="h-3 w-1/2 animate-pulse rounded"
                style={{ backgroundColor: "var(--color-surface-elevated)" }}
              />
              <div
                className="mt-auto h-8 w-32 animate-pulse rounded-lg"
                style={{ backgroundColor: "var(--color-surface-elevated)" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary skeleton */}
      <div
        className="flex flex-col gap-4 rounded-xl p-6"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          className="h-4 w-1/2 animate-pulse rounded"
          style={{ backgroundColor: "var(--color-surface-elevated)" }}
        />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div
              className="h-3 w-1/3 animate-pulse rounded"
              style={{ backgroundColor: "var(--color-surface-elevated)" }}
            />
            <div
              className="h-3 w-1/4 animate-pulse rounded"
              style={{ backgroundColor: "var(--color-surface-elevated)" }}
            />
          </div>
        ))}
        <div
          className="mt-4 h-12 w-full animate-pulse rounded-lg"
          style={{ backgroundColor: "var(--color-surface-elevated)" }}
        />
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
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
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
