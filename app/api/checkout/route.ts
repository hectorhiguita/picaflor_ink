import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOrCreateCart } from "@/server/queries/cart";
import {
  CheckoutError,
  createCheckoutOrder,
} from "@/server/queries/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getCurrentUser } from "@/server/auth";
import type { CheckoutRequest } from "@/lib/types/checkout";

const SESSION_COOKIE = "picaflor_session";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "No hay una sesión de carrito activa" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as Partial<CheckoutRequest>;

    if (!body.customer) {
      return NextResponse.json(
        { error: "Los datos del cliente son requeridos" },
        { status: 400 }
      );
    }

    const [cart, user] = await Promise.all([
      getOrCreateCart(sessionId),
      getCurrentUser(),
    ]);
    const checkout = await createCheckoutOrder(
      cart.id,
      body.customer,
      user?.id
    );

    await sendOrderConfirmationEmail({
      orderNumber: checkout.orderNumber,
      customerEmail: body.customer.email,
      customerName: body.customer.fullName,
      totalCop: checkout.cart.totalCop + (checkout.shipping.priceCop ?? 0),
    });

    return NextResponse.json(checkout, { status: 201 });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json(
        { error: error.message, fieldErrors: error.fieldErrors },
        { status: error.status }
      );
    }

    console.error("[POST /api/checkout]", error);
    return NextResponse.json(
      { error: "No pudimos iniciar el pago. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
