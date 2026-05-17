import { db } from "@/server/db";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: {
      email: true,
      name: true,
      phone: true,
      orders: { select: { id: true } },
    },
  });

  return (
    <section>
      <h1 className="text-3xl font-bold">Clientes</h1>
      <div className="mt-6 grid gap-3">
        {customers.map((customer) => (
          <div key={customer.email} className="rounded-lg p-4" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <strong>{customer.name ?? customer.email}</strong>
            <span style={{ color: "var(--color-text-secondary)" }}> · {customer.email} · {customer.phone ?? "Sin teléfono"} · {customer.orders.length} pedidos</span>
          </div>
        ))}
      </div>
    </section>
  );
}

