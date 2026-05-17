/**
 * @jest-environment node
 */

import type { NextRequest } from "next/server";
import { POST } from "@/app/api/payments/wompi/webhook/route";
import { confirmOrderPayment } from "@/server/queries/orders";
import { verifyWompiEventSignature } from "@/lib/wompi";
import { sendOrderConfirmationEmail } from "@/lib/email";

jest.mock("@/server/queries/orders", () => ({
  confirmOrderPayment: jest.fn(),
}));

jest.mock("@/lib/wompi", () => ({
  verifyWompiEventSignature: jest.fn(),
}));

jest.mock("@/lib/email", () => ({
  sendOrderConfirmationEmail: jest.fn(),
}));

const mockConfirmOrderPayment = confirmOrderPayment as jest.MockedFunction<
  typeof confirmOrderPayment
>;
const mockVerifyWompiEventSignature =
  verifyWompiEventSignature as jest.MockedFunction<
    typeof verifyWompiEventSignature
  >;
const mockSendOrderConfirmationEmail =
  sendOrderConfirmationEmail as jest.MockedFunction<
    typeof sendOrderConfirmationEmail
  >;

describe("POST /api/payments/wompi/webhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyWompiEventSignature.mockReturnValue(true);
    mockConfirmOrderPayment.mockResolvedValue({
      orderNumber: "20260513-0001",
      customerEmail: "ana@example.com",
      customerName: "Ana Perez",
      totalCop: 40000,
    });
    mockSendOrderConfirmationEmail.mockResolvedValue();
  });

  it("confirms approved Wompi transactions", async () => {
    const payload = {
      event: "transaction.updated",
      data: {
        transaction: {
          status: "APPROVED",
          reference: "PIC-20260513-0001",
        },
      },
    };
    const request = new Request("http://localhost/api/payments/wompi/webhook", {
      method: "POST",
      headers: { "x-wompi-signature": "valid" },
      body: JSON.stringify(payload),
    }) as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockConfirmOrderPayment).toHaveBeenCalledWith(
      "PIC-20260513-0001"
    );
    expect(mockSendOrderConfirmationEmail).toHaveBeenCalled();
  });

  it("rejects invalid webhook signatures", async () => {
    mockVerifyWompiEventSignature.mockReturnValue(false);

    const request = new Request("http://localhost/api/payments/wompi/webhook", {
      method: "POST",
      headers: { "x-wompi-signature": "invalid" },
      body: "{}",
    }) as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(mockConfirmOrderPayment).not.toHaveBeenCalled();
  });
});
