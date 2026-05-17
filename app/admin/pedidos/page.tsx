import { db } from "@/server/db";
import { formatCOP } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      status: true,
      totalCop: true,
    },
  });

  return (
    <section>
      <h1 className="text-3xl font-bold">Pedidos</h1>
      <div className="mt-6 grid gap-3">
        {orders.map((order) => (
          <div key={order.orderNumber} className="rounded-lg p-4" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <strong>{order.orderNumber}</strong>
            <span style={{ color: "var(--color-text-secondary)" }}> · {order.customerName} · {order.customerEmail} · {order.status.replaceAll("_", " ")} · {formatCOP(order.totalCop)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

