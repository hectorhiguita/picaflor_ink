import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import CartPage from "@/components/cart/CartPage";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: `Carrito — ${SITE_NAME}`,
  description: "Revisa y gestiona los productos en tu carrito antes de proceder al pago.",
  robots: {
    index: false,
    follow: false,
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Cart page — /carrito
 * Server Component wrapper that renders the interactive CartPage client component.
 * Meets Req 4.2, 4.3, 4.4, 4.6, 4.7.
 */
export default function CarritoPage() {
  return <CartPage />;
}
