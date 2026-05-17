import { db } from "@/server/db";
import { calculateShipping } from "@/server/queries/shipping";
import { getCartWithItems } from "@/server/queries/cart";
import {
  normalizeCheckoutForm,
  validateCheckoutForm,
  hasCheckoutErrors,
} from "@/lib/checkout-validation";
import { createWompiPaymentSession } from "@/lib/wompi";
import type { CheckoutFormData } from "@/lib/types/checkout";
import type { CartData } from "@/lib/types/cart";
import type { ShippingCalculationResult } from "@/lib/types/shipping";

export interface CreatedCheckoutOrder {
  orderNumber: string;
  paymentReference: string;
  paymentUrl: string;
  cart: CartData;
  shipping: ShippingCalculationResult;
}

export interface OrderEmailData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  totalCop: number;
}

export class CheckoutError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
    public readonly fieldErrors?: Record<string, string>
  ) {
    super(message);
  }
}

export async function createCheckoutOrder(
  cartId: string,
  customerData: CheckoutFormData,
  userId?: string
): Promise<CreatedCheckoutOrder> {
  const customer = normalizeCheckoutForm(customerData);
  const fieldErrors = validateCheckoutForm(customer);

  if (hasCheckoutErrors(fieldErrors)) {
    throw new CheckoutError("Datos de checkout inválidos", 422, fieldErrors);
  }

  const [cart, shipping] = await Promise.all([
    getCartWithItems(cartId),
    calculateShipping(customer.zone),
  ]);

  if (!cart || cart.items.length === 0) {
    throw new CheckoutError("El carrito está vacío", 400);
  }

  const shippingCop = shipping.priceCop;
  const totalCop = cart.totalCop + (shippingCop ?? 0);
  const orderNumber = await createOrderNumber();
  const payment = createWompiPaymentSession({
    orderNumber,
    amountInCents: totalCop * 100,
    customerEmail: customer.email,
  });

  await db.order.create({
    data: {
      orderNumber,
      userId: userId ?? null,
      customerEmail: customer.email,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      shippingAddressJson: {
        line1: customer.addressLine1,
        line2: customer.addressLine2 || null,
        city: customer.city,
        zone: customer.zone,
        notes: customer.notes || null,
        shippingPendingConfirmation: shipping.isPendingConfirmation,
      },
      subtotalCop: cart.subtotalCop,
      discountCop: cart.discountCop,
      shippingCop,
      totalCop,
      paymentReference: payment.reference,
      items: {
        create: cart.items.map((item) => ({
          productName: item.productName,
          variantLabel: item.variantLabel,
          quantity: item.quantity,
          unitPriceCop: item.unitPriceCop,
          customizationJson: item.customizationJson
            ? (item.customizationJson as object)
            : undefined,
        })),
      },
    },
  });

  return {
    orderNumber,
    paymentReference: payment.reference,
    paymentUrl: payment.paymentUrl,
    cart,
    shipping,
  };
}

export async function getOrderByNumber(orderNumber: string) {
  return db.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      orderNumber: true,
      customerEmail: true,
      customerName: true,
      customerPhone: true,
      shippingAddressJson: true,
      status: true,
      subtotalCop: true,
      discountCop: true,
      shippingCop: true,
      totalCop: true,
      paymentReference: true,
      paidAt: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          productName: true,
          variantLabel: true,
          quantity: true,
          unitPriceCop: true,
          previewAsset: { select: { url: true } },
        },
      },
    },
  });
}

export async function confirmOrderPayment(paymentReference: string) {
  const existing = await db.order.findFirst({
    where: { paymentReference },
    select: { id: true },
  });

  if (!existing) {
    throw new CheckoutError("Orden no encontrada", 404);
  }

  const order = await db.order.update({
    where: { id: existing.id },
    data: {
      status: "CONFIRMED",
      paidAt: new Date(),
    },
    select: {
      orderNumber: true,
      customerEmail: true,
      customerName: true,
      totalCop: true,
    },
  });

  return order;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const order = await db.order.update({
    where: { id: orderId },
    data: { status: status as never },
    select: {
      orderNumber: true,
      customerEmail: true,
      customerName: true,
      totalCop: true,
    },
  });

  return order;
}

export async function clearCartItems(cartId: string): Promise<void> {
  await db.cartItem.deleteMany({ where: { cartId } });
  await db.cart.update({
    where: { id: cartId },
    data: { couponId: null },
  });
}

async function createOrderNumber(): Promise<string> {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const count = await db.order.count({
    where: {
      createdAt: {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      },
    },
  });

  return `${datePart}-${String(count + 1).padStart(4, "0")}`;
}
