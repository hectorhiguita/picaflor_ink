"use client";

import Link from "next/link";
import type { CartData } from "@/lib/types/cart";
import { formatCOP } from "@/lib/utils";
import CouponInput from "@/components/cart/CouponInput";

interface CartSummaryProps {
  cart: CartData;
  onCartUpdated?: (cart: CartData) => void;
}

/**
 * Order summary sidebar showing subtotal, discount, shipping and total.
 * Includes a coupon input and a "Proceder al pago" CTA linking to /checkout.
 * Meets Req 4.4, 4.7, 8.11, 12.4.
 */
export default function CartSummary({ cart, onCartUpdated }: CartSummaryProps) {
  const hasDiscount = cart.discountCop > 0;

  return (
    <aside
      className="flex flex-col gap-4 rounded-xl p-6"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
      aria-label="Resumen del pedido"
    >
      <h2
        className="text-base font-bold uppercase tracking-wider"
        style={{ color: "var(--color-text-primary)" }}
      >
        Resumen del pedido
      </h2>

      {/* Coupon input */}
      <CouponInput
        cartId={cart.id}
        appliedCouponCode={cart.couponCode}
        onCouponApplied={onCartUpdated ?? (() => {})}
      />

      {/* Divider */}
      <div
        className="h-px"
        style={{ backgroundColor: "var(--color-border)" }}
        role="separator"
      />

      {/* Line items */}
      <dl className="flex flex-col gap-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between gap-4">
          <dt
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Subtotal
          </dt>
          <dd
            className="text-sm font-semibold tabular-nums"
            style={{ color: "var(--color-text-primary)" }}
          >
            {formatCOP(cart.subtotalCop)}
          </dd>
        </div>

        {/* Coupon / discount */}
        {cart.couponCode && (
          <div className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-1.5 text-sm">
              <span style={{ color: "var(--color-text-secondary)" }}>
                Cupón
              </span>
              <span
                className="rounded px-1.5 py-0.5 text-xs font-mono font-semibold"
                style={{
                  backgroundColor: "rgba(100,220,20,0.12)",
                  color: "var(--color-green)",
                  border: "1px solid rgba(100,220,20,0.25)",
                }}
              >
                {cart.couponCode}
              </span>
            </dt>
            <dd
              className="text-sm font-semibold tabular-nums"
              style={{ color: "var(--color-green)" }}
            >
              {hasDiscount ? `−${formatCOP(cart.discountCop)}` : "—"}
            </dd>
          </div>
        )}

        {/* Shipping */}
        <div className="flex items-center justify-between gap-4">
          <dt
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Envío
          </dt>
          <dd
            className="text-sm font-semibold"
            style={{ color: "var(--color-yellow)" }}
          >
            Por confirmar
          </dd>
        </div>

        {/* Divider */}
        <div
          className="my-1 h-px"
          style={{ backgroundColor: "var(--color-border)" }}
          role="separator"
        />

        {/* Total */}
        <div className="flex items-center justify-between gap-4">
          <dt
            className="text-base font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Total
          </dt>
          <dd
            className="text-xl font-extrabold tabular-nums"
            style={{ color: "var(--color-magenta)" }}
            aria-label={`Total: ${formatCOP(cart.totalCop)}`}
          >
            {formatCOP(cart.totalCop)}
          </dd>
        </div>
      </dl>

      {/* Shipping notice */}
      <p
        className="rounded-lg px-3 py-2 text-xs leading-relaxed"
        style={{
          backgroundColor: "rgba(255,179,0,0.07)",
          border: "1px solid rgba(255,179,0,0.18)",
          color: "var(--color-text-secondary)",
        }}
      >
        El costo de envío se confirmará una vez que ingreses tu dirección de
        entrega en el siguiente paso.
      </p>

      {/* CTA */}
      <Link
        href="/checkout"
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-4 text-base font-bold tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
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
        <LockIcon />
        Proceder al pago
      </Link>
    </aside>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function LockIcon() {
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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
