/**
 * POST /api/cart/items
 *
 * Adds an item to the current session cart. Returns the updated CartData.
 *
 * Satisfies Req 4.1 (add item with variant, preview and price).
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getOrCreateCart,
  addCartItem,
  getCartWithItems,
} from "@/server/queries/cart";
import type { AddCartItemRequest } from "@/lib/types/cart";

const SESSION_COOKIE = "picaflor_session";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    let sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    const isNewSession = !sessionId;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Cuerpo de la solicitud inválido" },
        { status: 400 }
      );
    }

    const data = body as Partial<AddCartItemRequest>;

    if (!data.productId || typeof data.productId !== "string") {
      return NextResponse.json(
        { error: "productId es requerido" },
        { status: 400 }
      );
    }
    if (!data.variantId || typeof data.variantId !== "string") {
      return NextResponse.json(
        { error: "variantId es requerido" },
        { status: 400 }
      );
    }
    if (
      typeof data.quantity !== "number" ||
      !Number.isInteger(data.quantity) ||
      data.quantity < 1
    ) {
      return NextResponse.json(
        { error: "quantity debe ser un entero mayor a 0" },
        { status: 400 }
      );
    }
    if (typeof data.unitPriceCop !== "number" || data.unitPriceCop < 0) {
      return NextResponse.json(
        { error: "unitPriceCop es requerido y debe ser un número positivo" },
        { status: 400 }
      );
    }

    const cart = await getOrCreateCart(sessionId);
    await addCartItem(cart.id, data as AddCartItemRequest);
    const cartData = await getCartWithItems(cart.id);

    const response = NextResponse.json(cartData, { status: 201 });

    if (isNewSession) {
      response.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error("[POST /api/cart/items]", error);
    return NextResponse.json(
      { error: "Error al agregar el ítem al carrito" },
      { status: 500 }
    );
  }
}
