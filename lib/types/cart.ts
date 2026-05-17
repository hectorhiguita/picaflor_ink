/**
 * TypeScript types for the Cart API responses and requests.
 * Matches the Cart and CartItem data model defined in the Prisma schema.
 */

import type { CustomizationJson } from "@/lib/types/mockup";

// ─── Response Types ───────────────────────────────────────────────────────────

/**
 * A single item in the cart, enriched with product and variant display data.
 */
export interface CartItemData {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  variantLabel: string;
  quantity: number;
  unitPriceCop: number;
  previewUrl: string | null;
  customizationJson: CustomizationJson | null;
}

/**
 * Full cart with items and computed totals.
 */
export interface CartData {
  id: string;
  sessionId: string;
  items: CartItemData[];
  subtotalCop: number;
  couponCode: string | null;
  discountCop: number;
  totalCop: number;
}

// ─── Request Types ────────────────────────────────────────────────────────────

/**
 * Payload for adding a new item to the cart.
 */
export interface AddCartItemRequest {
  productId: string;
  variantId: string;
  quantity: number;
  unitPriceCop: number;
  previewUrl?: string;
  customizationJson?: CustomizationJson;
}

/**
 * Payload for updating the quantity of an existing cart item.
 * Setting quantity to 0 removes the item.
 */
export interface UpdateCartItemRequest {
  quantity: number;
}
