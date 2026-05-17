/**
 * TypeScript types for the Shipping module.
 *
 * Supports fixed and zone-based shipping rates (Req 12.1) and the
 * "Por confirmar" state when no rate is configured (Req 12.4).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A shipping rate as returned to the client.
 * `priceCop` is null when the rate is pending confirmation (Req 12.4).
 */
export interface ShippingRateData {
  id: string;
  name: string;
  zone: string;
  /** Shipping cost in COP, or null when the price is "Por confirmar". */
  priceCop: number | null;
  active: boolean;
}

/**
 * Result of a shipping calculation for a given zone.
 *
 * - `rate`: the matched ShippingRate, or null if none was found.
 * - `priceCop`: the shipping cost in COP, or null when pending confirmation.
 * - `isPendingConfirmation`: true when no rate is configured or the rate has
 *   a null priceCop — the customer will be contacted to coordinate shipping
 *   (Req 12.4).
 */
export interface ShippingCalculationResult {
  rate: ShippingRateData | null;
  priceCop: number | null;
  isPendingConfirmation: boolean;
}
