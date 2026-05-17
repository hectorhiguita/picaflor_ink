/**
 * Server-side query functions for the Shipping module.
 *
 * Provides active shipping rates and zone-based shipping calculation.
 * Supports fixed and zone-based rates (Req 12.1) and the "Por confirmar"
 * state when no rate is configured (Req 12.4).
 */

import { db } from "@/server/db";
import type {
  ShippingRateData,
  ShippingCalculationResult,
} from "@/lib/types/shipping";

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Returns all active shipping rates sorted by sortOrder ascending.
 *
 * Used by the checkout to display available shipping options (Req 12.1).
 */
export async function getActiveShippingRates(): Promise<ShippingRateData[]> {
  const rates = await db.shippingRate.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      zone: true,
      priceCop: true,
      active: true,
    },
  });

  return rates;
}

/**
 * Calculates the shipping cost for the given zone.
 *
 * Lookup strategy:
 * 1. If a zone is provided, find the first active rate whose zone matches
 *    (case-insensitive). If found, use it.
 * 2. If no zone-specific rate is found, fall back to the first active rate
 *    (lowest sortOrder) as a general/default rate.
 * 3. If no active rates exist at all, return isPendingConfirmation: true.
 *
 * When the matched rate has a null priceCop, isPendingConfirmation is true
 * and the customer will be contacted to coordinate shipping (Req 12.4).
 */
export async function calculateShipping(
  zone?: string
): Promise<ShippingCalculationResult> {
  const allActiveRates = await db.shippingRate.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      zone: true,
      priceCop: true,
      active: true,
    },
  });

  if (allActiveRates.length === 0) {
    // No rates configured at all — pending confirmation (Req 12.4)
    return {
      rate: null,
      priceCop: null,
      isPendingConfirmation: true,
    };
  }

  let matched: ShippingRateData | null = null;

  if (zone) {
    const normalizedZone = zone.trim().toLowerCase();
    const zoneMatch = allActiveRates.find(
      (r) => r.zone.trim().toLowerCase() === normalizedZone
    );
    if (zoneMatch) {
      matched = zoneMatch;
    }
  }

  // Fall back to the first active rate (lowest sortOrder) if no zone match
  if (!matched) {
    matched = allActiveRates[0];
  }

  const isPendingConfirmation = matched.priceCop === null;

  return {
    rate: matched,
    priceCop: matched.priceCop,
    isPendingConfirmation,
  };
}
