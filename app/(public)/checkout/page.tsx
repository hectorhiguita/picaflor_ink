import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import CheckoutForm from "@/components/checkout/CheckoutForm";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: `Checkout — ${SITE_NAME}`,
  description:
    "Completa tu pedido ingresando tus datos de contacto y dirección de entrega.",
  robots: {
    index: false,
    follow: false,
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Checkout page — /checkout
 * Server Component wrapper that renders the interactive CheckoutForm client component.
 * Meets Req 5.1, 5.2, 5.5, 12.2.
 */
export default function CheckoutPage() {
  return <CheckoutForm />;
}
