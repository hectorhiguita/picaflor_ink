/**
 * @jest-environment node
 */

import type { NextRequest } from "next/server";
import { POST } from "@/app/api/checkout/route";
import { cookies } from "next/headers";
import { getOrCreateCart } from "@/server/queries/cart";
import { createCheckoutOrder } from "@/server/queries/orders";
import { getCurrentUser } from "@/server/auth";
import { sendOrderConfirmationEmail } from "@/lib/email";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@/server/queries/cart", () => ({
  getOrCreateCart: jest.fn(),
}));

jest.mock("@/server/queries/orders", () => ({
  CheckoutError: class CheckoutError extends Error {
    constructor(
      message: string,
      public readonly status = 400,
      public readonly fieldErrors?: Record<string, string>
    ) {
      super(message);
    }
  },
  createCheckoutOrder: jest.fn(),
}));

jest.mock("@/server/auth", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/email", () => ({
  sendOrderConfirmationEmail: jest.fn(),
}));

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockGetOrCreateCart = getOrCreateCart as jest.MockedFunction<
  typeof getOrCreateCart
>;
const mockCreateCheckoutOrder = createCheckoutOrder as jest.MockedFunction<
  typeof createCheckoutOrder
>;
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;
const mockSendOrderConfirmationEmail =
  sendOrderConfirmationEmail as jest.MockedFunction<
    typeof sendOrderConfirmationEmail
  >;

const validCustomer = {
  fullName: "Ana Perez",
  email: "ana@example.com",
  phone: "3223684981",
  addressLine1: "Calle 10 # 20-30",
  addressLine2: "",
  city: "Medellin",
  zone: "Medellin",
  notes: "",
};

describe("POST /api/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.mockResolvedValue({
      get: jest.fn(() => ({ value: "session-1" })),
    } as never);
    mockGetOrCreateCart.mockResolvedValue({
      id: "cart-1",
      sessionId: "session-1",
      userId: null,
    });
    mockGetCurrentUser.mockResolvedValue(null);
    mockSendOrderConfirmationEmail.mockResolvedValue();
    mockCreateCheckoutOrder.mockResolvedValue({
      orderNumber: "20260513-0001",
      paymentReference: "PIC-20260513-0001",
      paymentUrl: "http://localhost:3000/checkout/confirmacion/20260513-0001",
      shipping: {
        rate: null,
        priceCop: null,
        isPendingConfirmation: true,
      },
      cart: {
        id: "cart-1",
        sessionId: "session-1",
        items: [],
        subtotalCop: 40000,
        couponCode: null,
        discountCop: 0,
        totalCop: 40000,
      },
    });
  });

  it("creates a checkout order for the current cart session", async () => {
    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ customer: validCustomer }),
    }) as NextRequest;

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.orderNumber).toBe("20260513-0001");
    expect(mockGetOrCreateCart).toHaveBeenCalledWith("session-1");
    expect(mockCreateCheckoutOrder).toHaveBeenCalledWith(
      "cart-1",
      validCustomer,
      undefined
    );
    expect(mockSendOrderConfirmationEmail).toHaveBeenCalled();
  });

  it("returns 400 when there is no cart session", async () => {
    mockCookies.mockResolvedValue({
      get: jest.fn(() => undefined),
    } as never);

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ customer: validCustomer }),
    }) as NextRequest;

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("sesión");
    expect(mockCreateCheckoutOrder).not.toHaveBeenCalled();
  });
});
