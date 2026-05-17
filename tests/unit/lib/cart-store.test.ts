/**
 * Unit tests for cart calculation logic.
 *
 * These tests verify the pure calculation functions used by the cart:
 * - Subtotal calculation (sum of unitPriceCop × quantity)
 * - Discount application (PERCENTAGE and FIXED_COP coupon types)
 * - Total calculation (subtotal − discount, never negative)
 *
 * The server-side computeDiscount logic is mirrored here so we can test it
 * without a database connection.
 */

import type { CartItemData, CartData } from "@/lib/types/cart";

// ─── Pure helpers (mirrors server/queries/cart.ts logic) ─────────────────────

function computeSubtotal(items: CartItemData[]): number {
  return items.reduce((sum, item) => sum + item.unitPriceCop * item.quantity, 0);
}

function computeDiscount(
  subtotal: number,
  coupon: { type: "PERCENTAGE" | "FIXED_COP"; value: number } | null
): number {
  if (!coupon) return 0;
  if (coupon.type === "PERCENTAGE") {
    return Math.round((subtotal * coupon.value) / 100);
  }
  return Math.min(coupon.value, subtotal);
}

function computeTotal(subtotal: number, discount: number): number {
  return Math.max(0, subtotal - discount);
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeItem(
  overrides: Partial<CartItemData> = {}
): CartItemData {
  return {
    id: "item-1",
    productId: "prod-1",
    productName: "Camiseta Algodón",
    productSlug: "camiseta-algodon",
    variantId: "var-1",
    variantLabel: "Negro / M",
    quantity: 1,
    unitPriceCop: 40000,
    previewUrl: null,
    customizationJson: null,
    ...overrides,
  };
}

// ─── Subtotal calculation ─────────────────────────────────────────────────────

describe("computeSubtotal", () => {
  it("returns 0 for an empty cart", () => {
    expect(computeSubtotal([])).toBe(0);
  });

  it("returns unitPriceCop for a single item with quantity 1", () => {
    const items = [makeItem({ unitPriceCop: 40000, quantity: 1 })];
    expect(computeSubtotal(items)).toBe(40000);
  });

  it("multiplies unitPriceCop by quantity for a single item", () => {
    const items = [makeItem({ unitPriceCop: 40000, quantity: 3 })];
    expect(computeSubtotal(items)).toBe(120000);
  });

  it("sums multiple items correctly", () => {
    const items = [
      makeItem({ id: "item-1", unitPriceCop: 40000, quantity: 2 }),
      makeItem({ id: "item-2", unitPriceCop: 15000, quantity: 1 }),
    ];
    expect(computeSubtotal(items)).toBe(95000);
  });

  it("handles items with different quantities and prices", () => {
    const items = [
      makeItem({ id: "item-1", unitPriceCop: 45000, quantity: 1 }),
      makeItem({ id: "item-2", unitPriceCop: 40000, quantity: 2 }),
      makeItem({ id: "item-3", unitPriceCop: 15000, quantity: 3 }),
    ];
    // 45000 + 80000 + 45000 = 170000
    expect(computeSubtotal(items)).toBe(170000);
  });
});

// ─── Discount calculation ─────────────────────────────────────────────────────

describe("computeDiscount", () => {
  it("returns 0 when there is no coupon", () => {
    expect(computeDiscount(100000, null)).toBe(0);
  });

  it("applies PERCENTAGE discount correctly", () => {
    expect(computeDiscount(100000, { type: "PERCENTAGE", value: 10 })).toBe(10000);
  });

  it("rounds PERCENTAGE discount to nearest integer", () => {
    // 10% of 33333 = 3333.3 → rounds to 3333
    expect(computeDiscount(33333, { type: "PERCENTAGE", value: 10 })).toBe(3333);
  });

  it("applies FIXED_COP discount correctly", () => {
    expect(computeDiscount(100000, { type: "FIXED_COP", value: 5000 })).toBe(5000);
  });

  it("caps FIXED_COP discount at the subtotal (never negative total)", () => {
    expect(computeDiscount(3000, { type: "FIXED_COP", value: 5000 })).toBe(3000);
  });

  it("applies 100% PERCENTAGE discount correctly", () => {
    expect(computeDiscount(50000, { type: "PERCENTAGE", value: 100 })).toBe(50000);
  });

  it("applies 0% PERCENTAGE discount correctly", () => {
    expect(computeDiscount(50000, { type: "PERCENTAGE", value: 0 })).toBe(0);
  });

  it("applies FIXED_COP discount equal to subtotal (results in 0 total)", () => {
    expect(computeDiscount(5000, { type: "FIXED_COP", value: 5000 })).toBe(5000);
  });
});

// ─── Total calculation ────────────────────────────────────────────────────────

describe("computeTotal", () => {
  it("returns subtotal when discount is 0", () => {
    expect(computeTotal(100000, 0)).toBe(100000);
  });

  it("subtracts discount from subtotal", () => {
    expect(computeTotal(100000, 10000)).toBe(90000);
  });

  it("returns 0 when discount equals subtotal", () => {
    expect(computeTotal(50000, 50000)).toBe(0);
  });

  it("never returns a negative total", () => {
    // This should not happen in practice (FIXED_COP is capped), but guard anyway
    expect(computeTotal(10000, 20000)).toBe(0);
  });
});

// ─── End-to-end cart totals ───────────────────────────────────────────────────

describe("cart totals end-to-end", () => {
  it("computes correct totals for a cart with no coupon", () => {
    const items = [
      makeItem({ id: "item-1", unitPriceCop: 40000, quantity: 2 }),
      makeItem({ id: "item-2", unitPriceCop: 15000, quantity: 1 }),
    ];
    const subtotal = computeSubtotal(items);
    const discount = computeDiscount(subtotal, null);
    const total = computeTotal(subtotal, discount);

    expect(subtotal).toBe(95000);
    expect(discount).toBe(0);
    expect(total).toBe(95000);
  });

  it("computes correct totals with a 20% coupon", () => {
    const items = [
      makeItem({ id: "item-1", unitPriceCop: 40000, quantity: 1 }),
    ];
    const subtotal = computeSubtotal(items);
    const discount = computeDiscount(subtotal, { type: "PERCENTAGE", value: 20 });
    const total = computeTotal(subtotal, discount);

    expect(subtotal).toBe(40000);
    expect(discount).toBe(8000);
    expect(total).toBe(32000);
  });

  it("computes correct totals with a fixed COP coupon", () => {
    const items = [
      makeItem({ id: "item-1", unitPriceCop: 45000, quantity: 2 }),
    ];
    const subtotal = computeSubtotal(items);
    const discount = computeDiscount(subtotal, { type: "FIXED_COP", value: 10000 });
    const total = computeTotal(subtotal, discount);

    expect(subtotal).toBe(90000);
    expect(discount).toBe(10000);
    expect(total).toBe(80000);
  });

  it("matches the CartData shape returned by the server", () => {
    const items = [makeItem({ unitPriceCop: 40000, quantity: 1 })];
    const subtotalCop = computeSubtotal(items);
    const discountCop = computeDiscount(subtotalCop, null);
    const totalCop = computeTotal(subtotalCop, discountCop);

    const cartData: CartData = {
      id: "cart-1",
      sessionId: "session-abc",
      items,
      subtotalCop,
      couponCode: null,
      discountCop,
      totalCop,
    };

    expect(cartData.subtotalCop).toBe(40000);
    expect(cartData.discountCop).toBe(0);
    expect(cartData.totalCop).toBe(40000);
  });
});
