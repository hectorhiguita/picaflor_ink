/**
 * Server-side query functions for the Coupon module.
 *
 * Validates coupons and links/unlinks them to carts.
 * All validation is performed server-side (Req 8.11).
 */

import { db } from "@/server/db";
import { getCartWithItems } from "@/server/queries/cart";
import type { CartData } from "@/lib/types/cart";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Minimal coupon data returned to the client after successful validation.
 * Does not expose internal fields like usageCount or usageLimit.
 */
export interface CouponData {
  id: string;
  code: string;
  /** PERCENTAGE or FIXED_COP */
  type: string;
  /** Percentage (0–100) or fixed amount in COP */
  value: number;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Validates a coupon code server-side.
 *
 * Checks:
 * 1. Coupon exists.
 * 2. Coupon is active (Req 8.11).
 * 3. Coupon has not expired (Req 8.11).
 * 4. Coupon has not exceeded its usage limit (Req 8.11).
 *
 * Returns `{ valid: true, coupon }` on success or `{ valid: false, error }` on failure.
 */
export async function validateCoupon(
  code: string
): Promise<{ valid: true; coupon: CouponData } | { valid: false; error: string }> {
  const coupon = await db.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
    select: {
      id: true,
      code: true,
      type: true,
      value: true,
      active: true,
      expiresAt: true,
      usageLimit: true,
      usageCount: true,
    },
  });

  if (!coupon) {
    return { valid: false, error: "El cupón no existe" };
  }

  if (!coupon.active) {
    return { valid: false, error: "El cupón no está activo" };
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: "El cupón ha expirado" };
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usageCount >= coupon.usageLimit
  ) {
    return { valid: false, error: "El cupón ha alcanzado su límite de usos" };
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    },
  };
}

/**
 * Links a validated coupon to a cart.
 * Increments the coupon's usageCount.
 *
 * Call `validateCoupon` before this to ensure the coupon is still valid.
 */
export async function applyCouponToCart(
  cartId: string,
  couponId: string
): Promise<CartData | null> {
  // Remove any previously applied coupon first (decrement its usageCount)
  const existingCart = await db.cart.findUnique({
    where: { id: cartId },
    select: { couponId: true },
  });

  if (existingCart?.couponId && existingCart.couponId !== couponId) {
    await db.coupon.update({
      where: { id: existingCart.couponId },
      data: { usageCount: { decrement: 1 } },
    });
  }

  // Link the new coupon and increment its usageCount
  await db.cart.update({
    where: { id: cartId },
    data: { couponId },
  });

  if (!existingCart?.couponId || existingCart.couponId !== couponId) {
    await db.coupon.update({
      where: { id: couponId },
      data: { usageCount: { increment: 1 } },
    });
  }

  return getCartWithItems(cartId);
}

/**
 * Removes the coupon from a cart and decrements the coupon's usageCount.
 */
export async function removeCouponFromCart(
  cartId: string
): Promise<CartData | null> {
  const cart = await db.cart.findUnique({
    where: { id: cartId },
    select: { couponId: true },
  });

  if (cart?.couponId) {
    await db.coupon.update({
      where: { id: cart.couponId },
      data: { usageCount: { decrement: 1 } },
    });
  }

  await db.cart.update({
    where: { id: cartId },
    data: { couponId: null },
  });

  return getCartWithItems(cartId);
}
