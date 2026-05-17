import { db } from "@/server/db";
import { formatCOP } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [sales, orderCounts, topProducts] = await Promise.all([
    db.order.aggregate({
      where: { status: { not: "CANCELED" } },
      _sum: { totalCop: true },
      _count: true,
    }),
    db.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    db.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  return (
    <section>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="Ventas" value={formatCOP(sales._sum.totalCop ?? 0)} />
        <Metric label="Órdenes" value={String(sales._count)} />
        <Metric label="Productos top" value={String(topProducts.length)} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Órdenes por estado">
          {orderCounts.map((item) => (
            <Row
              key={item.status}
              label={item.status.replaceAll("_", " ")}
              value={String(item._count.status)}
            />
          ))}
        </Panel>
        <Panel title="Productos más vendidos">
          {topProducts.map((item) => (
            <Row
              key={item.productName}
              label={item.productName}
              value={String(item._sum.quantity ?? 0)}
            />
          ))}
        </Panel>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl p-5" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <h2 className="font-bold">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

