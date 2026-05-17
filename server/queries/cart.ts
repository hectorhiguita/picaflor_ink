/**
 * Server-side query functions for the Cart module.
 *
 * Handles session-based cart persistence (Req 4.5) and account synchronization
 * when a user logs in (Req 6.7).
 */

import { db } from "@/server/db";
import type {
  CartData,
  CartItemData,
  AddCartItemRequest,
} from "@/lib/types/cart";
import type { CustomizationJson } from "@/lib/types/mockup";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Computes the discount amount for a cart based on its coupon.
 */
function computeDiscount(
  subtotal: number,
  coupon: { type: string; value: number } | null
): number {
  if (!coupon) return 0;
  if (coupon.type === "PERCENTAGE") {
    return Math.round((subtotal * coupon.value) / 100);
  }
  // FIXED_COP — never exceed the subtotal
  return Math.min(coupon.value, subtotal);
}

/**
 * Maps a raw DB cart item row (with joined product/variant/previewAsset) to
 * the CartItemData shape returned by the API.
 */
function mapCartItem(item: {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPriceCop: number;
  customizationJson: unknown;
  product: { name: string; slug: string };
  variant: { colorName: string; size: string };
  previewAsset: { url: string } | null;
}): CartItemData {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productSlug: item.product.slug,
    variantId: item.variantId,
    variantLabel: `${item.variant.colorName} / ${item.variant.size}`,
    quantity: item.quantity,
    unitPriceCop: item.unitPriceCop,
    previewUrl: item.previewAsset?.url ?? null,
    customizationJson: (item.customizationJson as CustomizationJson) ?? null,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Finds an existing cart for the given session (and optionally user), or
 * creates a new one. When a userId is provided the cart is linked to the user.
 *
 * Satisfies Req 4.5 (session persistence) and Req 6.7 (account sync).
 */
export async function getOrCreateCart(
  sessionId: string,
  userId?: string
): Promise<{ id: string; sessionId: string; userId: string | null }> {
  // 1. Try to find an existing cart for this session
  const existing = await db.cart.findFirst({
    where: { sessionId },
    select: { id: true, sessionId: true, userId: true },
  });

  if (existing) {
    // If a userId is now available and the cart is not yet linked, link it
    if (userId && !existing.userId) {
      const updated = await db.cart.update({
        where: { id: existing.id },
        data: { userId },
        select: { id: true, sessionId: true, userId: true },
      });
      return updated;
    }
    return existing;
  }

  // 2. Create a new cart
  const created = await db.cart.create({
    data: {
      sessionId,
      userId: userId ?? null,
      currency: "COP",
    },
    select: { id: true, sessionId: true, userId: true },
  });

  return created;
}

/**
 * Returns the full cart with items, product names, variant labels, and
 * computed totals (subtotal, discount, total).
 *
 * Returns null if the cart does not exist.
 */
export async function getCartWithItems(
  cartId: string
): Promise<CartData | null> {
  const cart = await db.cart.findUnique({
    where: { id: cartId },
    select: {
      id: true,
      sessionId: true,
      coupon: {
        select: { code: true, type: true, value: true },
      },
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          productId: true,
          variantId: true,
          quantity: true,
          unitPriceCop: true,
          customizationJson: true,
          product: { select: { name: true, slug: true } },
          variant: { select: { colorName: true, size: true } },
          previewAsset: { select: { url: true } },
        },
      },
    },
  });

  if (!cart) return null;

  const items = cart.items.map(mapCartItem);
  const subtotalCop = items.reduce(
    (sum, item) => sum + item.unitPriceCop * item.quantity,
    0
  );
  const discountCop = computeDiscount(subtotalCop, cart.coupon);
  const totalCop = Math.max(0, subtotalCop - discountCop);

  return {
    id: cart.id,
    sessionId: cart.sessionId,
    items,
    subtotalCop,
    couponCode: cart.coupon?.code ?? null,
    discountCop,
    totalCop,
  };
}

/**
 * Adds an item to the cart. If an identical product+variant combination already
 * exists, increments the quantity instead of creating a duplicate.
 *
 * Returns the updated CartItemData for the affected item.
 */
export async function addCartItem(
  cartId: string,
  item: AddCartItemRequest
): Promise<CartItemData> {
  const previewAssetId = item.previewUrl
    ? (
        await db.mediaAsset.create({
          data: {
            storageKey: `cart-previews/${crypto.randomUUID()}.png`,
            url: item.previewUrl,
            mimeType: "image/png",
            altText: "Previsualización del producto personalizado",
          },
          select: { id: true },
        })
      ).id
    : null;

  // Check for an existing item with the same product+variant
  const existing = await db.cartItem.findFirst({
    where: { cartId, productId: item.productId, variantId: item.variantId },
    select: { id: true, quantity: true },
  });

  let cartItemId: string;

  if (existing) {
    // Increment quantity. Keep the newest customization/preview because two
    // custom items with the same variant can still differ visually.
    await db.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + item.quantity,
        previewAssetId,
        customizationJson: item.customizationJson
          ? (item.customizationJson as object)
          : undefined,
      },
    });
    cartItemId = existing.id;
  } else {
    // Create new item
    const created = await db.cartItem.create({
      data: {
        cartId,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPriceCop: item.unitPriceCop,
        previewAssetId,
        customizationJson: item.customizationJson
          ? (item.customizationJson as object)
          : undefined,
      },
      select: { id: true },
    });
    cartItemId = created.id;
  }

  // Re-fetch the full item with joins for the response
  const row = await db.cartItem.findUniqueOrThrow({
    where: { id: cartItemId },
    select: {
      id: true,
      productId: true,
      variantId: true,
      quantity: true,
      unitPriceCop: true,
      customizationJson: true,
      product: { select: { name: true, slug: true } },
      variant: { select: { colorName: true, size: true } },
      previewAsset: { select: { url: true } },
    },
  });

  return mapCartItem(row);
}

/**
 * Updates the quantity of a cart item. If quantity is 0, the item is removed.
 *
 * Returns the updated CartItemData, or null if the item was removed.
 */
export async function updateCartItemQuantity(
  cartId: string,
  itemId: string,
  quantity: number
): Promise<CartItemData | null> {
  // Verify the item belongs to this cart
  const item = await db.cartItem.findFirst({
    where: { id: itemId, cartId },
    select: { id: true },
  });

  if (!item) return null;

  if (quantity <= 0) {
    await db.cartItem.delete({ where: { id: itemId } });
    return null;
  }

  await db.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  const row = await db.cartItem.findUniqueOrThrow({
    where: { id: itemId },
    select: {
      id: true,
      productId: true,
      variantId: true,
      quantity: true,
      unitPriceCop: true,
      customizationJson: true,
      product: { select: { name: true, slug: true } },
      variant: { select: { colorName: true, size: true } },
      previewAsset: { select: { url: true } },
    },
  });

  return mapCartItem(row);
}

/**
 * Removes a cart item by ID. Returns true if the item was deleted, false if
 * it was not found or did not belong to this cart.
 */
export async function removeCartItem(
  cartId: string,
  itemId: string
): Promise<boolean> {
  const item = await db.cartItem.findFirst({
    where: { id: itemId, cartId },
    select: { id: true },
  });

  if (!item) return false;

  await db.cartItem.delete({ where: { id: itemId } });
  return true;
}

/**
 * Merges all items from a guest session cart into the authenticated user's cart.
 * After merging, the guest cart is deleted.
 *
 * Satisfies Req 6.7: cart synchronization on login.
 */
export async function mergeGuestCartToUser(
  guestSessionId: string,
  userId: string
): Promise<void> {
  const guestCart = await db.cart.findFirst({
    where: { sessionId: guestSessionId, userId: null },
    select: {
      id: true,
      items: {
        select: {
          productId: true,
          variantId: true,
          quantity: true,
          unitPriceCop: true,
          customizationJson: true,
          previewAssetId: true,
        },
      },
    },
  });

  if (!guestCart || guestCart.items.length === 0) return;

  // Find or create the user's own cart
  let userCart = await db.cart.findFirst({
    where: { userId },
    select: {
      id: true,
      items: {
        select: { id: true, productId: true, variantId: true, quantity: true },
      },
    },
  });

  if (!userCart) {
    userCart = await db.cart.create({
      data: { userId, sessionId: guestSessionId, currency: "COP" },
      select: {
        id: true,
        items: {
          select: {
            id: true,
            productId: true,
            variantId: true,
            quantity: true,
          },
        },
      },
    });
  }

  // Merge each guest item into the user cart
  for (const guestItem of guestCart.items) {
    const existingUserItem = userCart.items.find(
      (i) =>
        i.productId === guestItem.productId &&
        i.variantId === guestItem.variantId
    );

    if (existingUserItem) {
      await db.cartItem.update({
        where: { id: existingUserItem.id },
        data: { quantity: existingUserItem.quantity + guestItem.quantity },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: guestItem.productId,
          variantId: guestItem.variantId,
          quantity: guestItem.quantity,
          unitPriceCop: guestItem.unitPriceCop,
          previewAssetId: guestItem.previewAssetId,
          customizationJson: guestItem.customizationJson ?? undefined,
        },
      });
    }
  }

  // Delete the guest cart (cascade deletes its items)
  await db.cart.delete({ where: { id: guestCart.id } });
}
