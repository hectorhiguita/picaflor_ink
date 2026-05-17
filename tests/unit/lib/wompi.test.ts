import {
  createPaymentReference,
  createWompiPaymentSession,
} from "@/lib/wompi";

describe("wompi helpers", () => {
  it("creates Picaflor payment references", () => {
    expect(createPaymentReference("20260513-0001")).toBe(
      "PIC-20260513-0001"
    );
  });

  it("returns a local confirmation URL when public key is not configured", () => {
    const previousKey = process.env.WOMPI_PUBLIC_KEY;
    delete process.env.WOMPI_PUBLIC_KEY;

    const session = createWompiPaymentSession({
      orderNumber: "20260513-0001",
      amountInCents: 4000000,
      customerEmail: "cliente@example.com",
    });

    expect(session.simulated).toBe(true);
    expect(session.paymentUrl).toContain(
      "/checkout/confirmacion/20260513-0001"
    );

    process.env.WOMPI_PUBLIC_KEY = previousKey;
  });
});

