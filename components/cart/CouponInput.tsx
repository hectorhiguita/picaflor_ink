"use client";

import { useState } from "react";
import type { CartData } from "@/lib/types/cart";

interface CouponInputProps {
  cartId: string;
  appliedCouponCode: string | null;
  onCouponApplied: (cart: CartData) => void;
}

/**
 * Coupon input widget for the cart summary.
 *
 * - Shows a text input + "Aplicar" button when no coupon is applied.
 * - Shows a green success badge with the code and a "Quitar cupón" button
 *   when a coupon is already applied.
 * - Shows a descriptive error message on validation failure.
 *
 * Satisfies Req 8.11 (server-side validation before applying discount).
 */
export default function CouponInput({
  cartId,
  appliedCouponCode,
  onCouponApplied,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Apply coupon ────────────────────────────────────────────────────────────

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });

      const body = (await res.json()) as CartData & { error?: string };

      if (!res.ok) {
        setError(body.error ?? "Error al aplicar el cupón");
        return;
      }

      setCode("");
      onCouponApplied(body);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // ── Remove coupon ───────────────────────────────────────────────────────────

  async function handleRemove() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cart/coupon", { method: "DELETE" });

      const body = (await res.json()) as CartData & { error?: string };

      if (!res.ok) {
        setError(body.error ?? "Error al quitar el cupón");
        return;
      }

      onCouponApplied(body);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-2" aria-label="Cupón de descuento">
      {appliedCouponCode ? (
        /* Applied state */
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckIcon />
            <span
              className="rounded px-2 py-0.5 text-xs font-mono font-semibold"
              style={{
                backgroundColor: "rgba(100,220,20,0.12)",
                color: "var(--color-green)",
                border: "1px solid rgba(100,220,20,0.25)",
              }}
              aria-label={`Cupón aplicado: ${appliedCouponCode}`}
            >
              {appliedCouponCode}
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--color-green)" }}
            >
              Cupón aplicado
            </span>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="text-xs underline transition-opacity focus-visible:outline-none focus-visible:ring-1 disabled:opacity-50"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label="Quitar cupón"
          >
            {loading ? "Quitando…" : "Quitar cupón"}
          </button>
        </div>
      ) : (
        /* Input state */
        <form
          onSubmit={handleApply}
          className="flex gap-2"
          aria-label="Aplicar cupón"
        >
          <label htmlFor={`coupon-input-${cartId}`} className="sr-only">
            Código de cupón
          </label>
          <input
            id={`coupon-input-${cartId}`}
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            placeholder="Código de cupón"
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-lg px-3 py-2 text-sm font-mono tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              // @ts-expect-error CSS custom property
              "--tw-ring-color": "var(--color-cyan)",
            }}
            aria-describedby={error ? `coupon-error-${cartId}` : undefined}
            aria-invalid={error ? "true" : undefined}
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-cyan)",
              color: "var(--color-ink)",
              // @ts-expect-error CSS custom property
              "--tw-ring-color": "var(--color-cyan)",
            }}
            onMouseEnter={(e) => {
              if (!loading && code.trim()) {
                (e.currentTarget as HTMLButtonElement).style.filter =
                  "brightness(1.1)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.filter = "";
            }}
          >
            {loading ? "…" : "Aplicar"}
          </button>
        </form>
      )}

      {/* Error message */}
      {error && (
        <p
          id={`coupon-error-${cartId}`}
          className="text-xs"
          style={{ color: "var(--color-error)" }}
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--color-green)" }}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
