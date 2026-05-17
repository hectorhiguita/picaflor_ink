/**
 * GET /api/cart
 *
 * Returns the current cart for the session. Creates a new cart if none exists.
 * The session ID is stored in the `picaflor_session` cookie.
 *
 * Satisfies Req 4.5 (session persistence).
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOrCreateCart, getCartWithItems } from "@/server/queries/cart";

const SESSION_COOKIE = "picaflor_session";

export async function GET() {
  try {
    const cookieStore = await cookies();

    // Read or generate a session ID
    let sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    const isNewSession = !sessionId;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    const cart = await getOrCreateCart(sessionId);
    const cartData = await getCartWithItems(cart.id);

    const response = NextResponse.json(cartData);

    // Set the session cookie if it was just created
    if (isNewSession) {
      response.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // 30-day session
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error("[GET /api/cart]", error);
    return NextResponse.json(
      { error: "Error al obtener el carrito" },
      { status: 500 }
    );
  }
}
