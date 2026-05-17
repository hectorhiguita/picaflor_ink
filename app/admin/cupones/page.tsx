import { db } from "@/server/db";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { code: "asc" },
    select: {
      code: true,
      type: true,
      value: true,
      active: true,
      expiresAt: true,
      usageLimit: true,
      usageCount: true,
    },
  });

  return (
    <section>
      <h1 className="text-3xl font-bold">Cupones</h1>
      <div className="mt-6 grid gap-3">
        {coupons.map((coupon) => (
          <div key={coupon.code} className="rounded-lg p-4" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <strong>{coupon.code}</strong>
            <span style={{ color: "var(--color-text-secondary)" }}> · {coupon.type} · {coupon.value} · {coupon.active ? "Activo" : "Inactivo"} · usos {coupon.usageCount}/{coupon.usageLimit ?? "∞"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

