import { db } from "@/server/db";

export default async function AdminDesignsPage() {
  const designs = await db.designCatalogItem.findMany({
    orderBy: { createdAt: "desc" },
    select: { name: true, category: true, active: true },
  });

  return (
    <section>
      <h1 className="text-3xl font-bold">Diseños</h1>
      <div className="mt-6 grid gap-3">
        {designs.map((design) => (
          <div key={design.name} className="rounded-lg p-4" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <strong>{design.name}</strong>
            <span style={{ color: "var(--color-text-secondary)" }}> · {design.category} · {design.active ? "Activo" : "Inactivo"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

