import crypto from "node:crypto";
import { SITE_URL } from "@/lib/constants";

interface WompiPaymentInput {
  orderNumber: string;
  amountInCents: number;
  customerEmail: string;
}

export interface WompiPaymentSession {
  reference: string;
  paymentUrl: string;
  simulated: boolean;
}

export function createPaymentReference(orderNumber: string): string {
  return `PIC-${orderNumber}`;
}

export function createWompiPaymentSession(
  input: WompiPaymentInput
): WompiPaymentSession {
  const reference = createPaymentReference(input.orderNumber);
  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const redirectUrl = `${SITE_URL}/checkout/confirmacion/${input.orderNumber}`;

  if (!publicKey) {
    return {
      reference,
      paymentUrl: redirectUrl,
      simulated: true,
    };
  }

  const params = new URLSearchParams({
    "public-key": publicKey,
    "currency": "COP",
    "amount-in-cents": String(input.amountInCents),
    reference,
    "customer-data:email": input.customerEmail,
    "redirect-url": redirectUrl,
  });

  return {
    reference,
    paymentUrl: `https://checkout.wompi.co/p/?${params.toString()}`,
    simulated: false,
  };
}

export function verifyWompiEventSignature(payload: string, signature: string) {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );
}

