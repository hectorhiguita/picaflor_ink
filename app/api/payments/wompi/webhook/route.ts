import { NextRequest, NextResponse } from "next/server";
import { confirmOrderPayment } from "@/server/queries/orders";
import { verifyWompiEventSignature } from "@/lib/wompi";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature =
    request.headers.get("x-wompi-signature") ??
    request.headers.get("x-event-checksum") ??
    "";

  if (!verifyWompiEventSignature(payload, signature)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  try {
    const event = JSON.parse(payload) as {
      event?: string;
      data?: {
        transaction?: {
          status?: string;
          reference?: string;
        };
      };
    };

    const transaction = event.data?.transaction;

    if (transaction?.status !== "APPROVED" || !transaction.reference) {
      return NextResponse.json({ received: true });
    }

    const order = await confirmOrderPayment(transaction.reference);
    await sendOrderConfirmationEmail(order);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[POST /api/payments/wompi/webhook]", error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}

