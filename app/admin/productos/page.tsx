import { db } from "@/server/db";
import { formatCOP } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      category: { select: { name: true } },
      basePriceCop: true,
      active: true,
      variants: { select: { id: true } },
    },
  });

  return (
    <section>
      <h1 className="text-3xl font-bold">Productos</h1>
      <AdminTable
        headers={["Nombre", "Categoría", "Precio", "Variantes", "Estado"]}
        rows={products.map((product) => [
          product.name,
          product.category.name,
          formatCOP(product.basePriceCop),
          String(product.variants.length),
          product.active ? "Activo" : "Inactivo",
        ])}
      />
    </section>
  );
}

function AdminTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl" style={{ border: "1px solid var(--color-border)" }}>
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead style={{ backgroundColor: "var(--color-surface)" }}>
          <tr>{headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} style={{ borderTop: "1px solid var(--color-border)" }}>
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

