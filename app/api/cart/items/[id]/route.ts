/**
 * PATCH /api/cart/items/[id]  — Update item quantity (remove if quantity = 0)
 * DELETE /api/cart/items/[id] — Remove item from cart
 *
 * Both handlers return the updated CartData.
 *
 * Satisfies Req 4.2 (modify quantity) and Req 4.3 (remove when quantity = 0).
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getOrCreateCart,
  updateCartItemQuantity,
  removeCartItem,
  getCartWithItems,
} from "@/server/queries/cart";
import type { UpdateCartItemRequest } from "@/lib/types/cart";

const SESSION_COOKIE = "picaflor_session";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id: itemId } = await context.params;
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

    const data = body as Partial<UpdateCartItemRequest>;

    if (
      typeof data.quantity !== "number" ||
      !Number.isInteger(data.quantity) ||
      data.quantity < 0
    ) {
      return NextResponse.json(
        { error: "quantity debe ser un entero mayor o igual a 0" },
        { status: 400 }
      );
    }

    const cart = await getOrCreateCart(sessionId);
    await updateCartItemQuantity(cart.id, itemId, data.quantity);
    const cartData = await getCartWithItems(cart.id);

    return NextResponse.json(cartData);
  } catch (error) {
    console.error("[PATCH /api/cart/items/[id]]", error);
    return NextResponse.json(
      { error: "Error al actualizar el ítem del carrito" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id: itemId } = await context.params;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Sesión no encontrada" },
        { status: 400 }
      );
    }

    const cart = await getOrCreateCart(sessionId);
    const removed = await removeCartItem(cart.id, itemId);

    if (!removed) {
      return NextResponse.json(
        { error: "Ítem no encontrado en el carrito" },
        { status: 404 }
      );
    }

    const cartData = await getCartWithItems(cart.id);
    return NextResponse.json(cartData);
  } catch (error) {
    console.error("[DELETE /api/cart/items/[id]]", error);
    return NextResponse.json(
      { error: "Error al eliminar el ítem del carrito" },
      { status: 500 }
    );
  }
}
