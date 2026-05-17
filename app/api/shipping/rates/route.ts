/**
 * GET /api/shipping/rates
 *
 * Returns all active shipping rates sorted by sortOrder.
 * Used by the checkout to display available shipping options (Req 12.1, 12.2).
 */

import { NextResponse } from "next/server";
import { getActiveShippingRates } from "@/server/queries/shipping";

export async function GET() {
  try {
    const rates = await getActiveShippingRates();
    return NextResponse.json({ rates });
  } catch (error) {
    console.error("[GET /api/shipping/rates]", error);
    return NextResponse.json(
      { error: "Error al obtener las tarifas de envío" },
      { status: 500 }
    );
  }
}
