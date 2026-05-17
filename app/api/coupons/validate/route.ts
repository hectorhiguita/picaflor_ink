/**
 * POST /api/coupons/validate
 *
 * Validates a coupon code server-side without applying it to a cart.
 * Returns coupon data on success or an error message on failure.
 *
 * Satisfies Req 8.11 (server-side coupon validation).
 */

import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/server/queries/coupons";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { valid: false, error: "Cuerpo de la solicitud inválido" },
        { status: 400 }
      );
    }

    const data = body as { code?: unknown };

    if (!data.code || typeof data.code !== "string" || !data.code.trim()) {
      return NextResponse.json(
        { valid: false, error: "El código del cupón es requerido" },
        { status: 400 }
      );
    }

    const result = await validateCoupon(data.code);

    if (!result.valid) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/coupons/validate]", error);
    return NextResponse.json(
      { valid: false, error: "Error al validar el cupón" },
      { status: 500 }
    );
  }
}
