import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { db } from "@/server/db";
import { formatCOP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta");

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true,
      status: true,
      totalCop: true,
      createdAt: true,
    },
  });

  return (
    <section className="mx-auto max-w-screen-lg px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Mis pedidos</h1>
      <div className="mt-6 grid gap-3">
        {orders.length === 0 ? (
          <p style={{ color: "var(--color-text-secondary)" }}>
            Aún no tienes pedidos asociados a esta cuenta.
          </p>
        ) : (
          orders.map((order) => (
            <Link
              key={order.orderNumber}
              href={`/checkout/confirmacion/${order.orderNumber}`}
              className="rounded-lg p-4"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span className="font-bold">{order.orderNumber}</span>
              <span style={{ color: "var(--color-text-secondary)" }}>
                {" "}
                · {order.status.replaceAll("_", " ")} ·{" "}
                {formatCOP(order.totalCop)}
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
