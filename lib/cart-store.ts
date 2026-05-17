/**
 * Client-side cart state using Zustand with localStorage persistence.
 *
 * The store keeps CartData in memory and syncs with the server API.
 * On mount, it fetches the current cart from the server (which reads the
 * session cookie). After every mutation it re-fetches to stay in sync.
 *
 * localStorage is used as a fallback so the cart survives page reloads even
 * before the server responds (Req 4.5).
 *
 * When the user logs in, call `mergeGuestCart()` to trigger server-side
 * account synchronization (Req 6.7).
 */

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartData, AddCartItemRequest } from "@/lib/types/cart";

// ─── State shape ──────────────────────────────────────────────────────────────

interface CartState {
  /** The current cart data, or null if not yet loaded */
  cart: CartData | null;
  /** True while a server request is in flight */
  loading: boolean;
  /** Last error message, if any */
  error: string | null;

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Fetch the current cart from the server and update local state */
  fetchCart: () => Promise<void>;

  /** Directly set the cart data (e.g. after coupon applied) */
  setCart: (cart: CartData) => void;

  /** Add an item to the cart */
  addItem: (item: AddCartItemRequest) => Promise<void>;

  /** Update the quantity of a cart item (quantity = 0 removes the item) */
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;

  /** Remove a cart item */
  removeItem: (itemId: string) => Promise<void>;

  /** Clear the local cart state (e.g. after checkout) */
  clearCart: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      loading: false,
      error: null,

      fetchCart: async () => {
        set({ loading: true, error: null });
        try {
          const res = await fetch("/api/cart");
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data: CartData = await res.json();
          set({ cart: data, loading: false });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Error desconocido";
          set({ error: message, loading: false });
        }
      },

      setCart: (cart: CartData) => {
        set({ cart });
      },

      addItem: async (item: AddCartItemRequest) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch("/api/cart/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(
              (body as { error?: string }).error ?? `HTTP ${res.status}`
            );
          }
          const data: CartData = await res.json();
          set({ cart: data, loading: false });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Error desconocido";
          set({ error: message, loading: false });
          // Re-sync with server to ensure consistency
          await get().fetchCart();
        }
      },

      updateQuantity: async (itemId: string, quantity: number) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`/api/cart/items/${itemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity }),
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(
              (body as { error?: string }).error ?? `HTTP ${res.status}`
            );
          }
          const data: CartData = await res.json();
          set({ cart: data, loading: false });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Error desconocido";
          set({ error: message, loading: false });
          await get().fetchCart();
        }
      },

      removeItem: async (itemId: string) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`/api/cart/items/${itemId}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(
              (body as { error?: string }).error ?? `HTTP ${res.status}`
            );
          }
          const data: CartData = await res.json();
          set({ cart: data, loading: false });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Error desconocido";
          set({ error: message, loading: false });
          await get().fetchCart();
        }
      },

      clearCart: () => {
        set({ cart: null, error: null });
      },
    }),
    {
      name: "picaflor-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : memoryStorage()
      ),
      // Only persist the cart data, not loading/error state
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

// ─── SSR-safe memory storage fallback ────────────────────────────────────────

function memoryStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    key: (index) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

// ─── Computed selectors ───────────────────────────────────────────────────────

/** Returns the total number of items in the cart (sum of quantities) */
export function selectCartItemCount(state: CartState): number {
  return (
    state.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  );
}

/** Returns true if the cart has no items */
export function selectIsCartEmpty(state: CartState): boolean {
  return !state.cart || state.cart.items.length === 0;
}
