import type { OrderEmailData } from "@/server/queries/orders";

export async function sendOrderConfirmationEmail(
  order: OrderEmailData
): Promise<void> {
  if (!process.env.EMAIL_PROVIDER_API_KEY) {
    console.info(
      `[email] Confirmación omitida en local para ${order.customerEmail} (${order.orderNumber})`
    );
    return;
  }

  console.info(
    `[email] Enviar confirmación a ${order.customerEmail} para ${order.orderNumber}`
  );
}

export async function sendOrderStatusEmail(
  order: OrderEmailData,
  statusLabel: string
): Promise<void> {
  if (!process.env.EMAIL_PROVIDER_API_KEY) {
    console.info(
      `[email] Estado omitido en local para ${order.customerEmail}: ${statusLabel}`
    );
    return;
  }

  console.info(
    `[email] Enviar estado ${statusLabel} a ${order.customerEmail} para ${order.orderNumber}`
  );
}

