/**
 * POST   /api/cart/coupon  — Apply a coupon to the current cart.
 * DELETE /api/cart/coupon  — Remove the coupon from the current cart.
 *
 * Both endpoints return the updated CartData.
 * Satisfies Req 8.11 (server-side validation before applying discount).
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOrCreateCart } from "@/server/queries/cart";
import {
  validateCoupon,
  applyCouponToCart,
  removeCouponFromCart,
} from "@/server/queries/coupons";

const SESSION_COOKIE = "picaflor_session";

// ─── POST — apply coupon ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Sesión no encontrada" },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Cuerpo de la solicitud inválido" },
        { status: 400 }
      );
    }

    const data = body as { code?: unknown };

    if (!data.code || typeof data.code !== "string" || !data.code.trim()) {
      return NextResponse.json(
        { error: "El código del cupón es requerido" },
        { status: 400 }
      );
    }

    // Validate the coupon server-side (Req 8.11)
    const validation = await validateCoupon(data.code);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    const cart = await getOrCreateCart(sessionId);
    const cartData = await applyCouponToCart(cart.id, validation.coupon.id);

    return NextResponse.json(cartData);
  } catch (error) {
    console.error("[POST /api/cart/coupon]", error);
    return NextResponse.json(
      { error: "Error al aplicar el cupón" },
      { status: 500 }
    );
  }
}

// ─── DELETE — remove coupon ───────────────────────────────────────────────────

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Sesión no encontrada" },
        { status: 400 }
      );
    }

    const cart = await getOrCreateCart(sessionId);
    const cartData = await removeCouponFromCart(cart.id);

    return NextResponse.json(cartData);
  } catch (error) {
    console.error("[DELETE /api/cart/coupon]", error);
    return NextResponse.json(
      { error: "Error al quitar el cupón" },
      { status: 500 }
    );
  }
}
