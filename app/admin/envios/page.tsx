import { db } from "@/server/db";
import { formatCOP } from "@/lib/utils";

export default async function AdminShippingPage() {
  const rates = await db.shippingRate.findMany({
    orderBy: { sortOrder: "asc" },
    select: { name: true, zone: true, priceCop: true, active: true },
  });

  return (
    <section>
      <h1 className="text-3xl font-bold">Envíos</h1>
      <div className="mt-6 grid gap-3">
        {rates.map((rate) => (
          <div key={rate.zone} className="rounded-lg p-4" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <strong>{rate.name}</strong>
            <span style={{ color: "var(--color-text-secondary)" }}> · {rate.zone} · {rate.priceCop === null ? "Por confirmar" : formatCOP(rate.priceCop)} · {rate.active ? "Activo" : "Inactivo"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

