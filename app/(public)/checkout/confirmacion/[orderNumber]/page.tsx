import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/server/queries/orders";
import { formatCOP } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
};

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) notFound();

  return (
    <section className="mx-auto max-w-screen-md px-4 py-12 sm:px-6 lg:px-8">
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <p className="text-sm font-bold" style={{ color: "var(--color-green)" }}>
          Pedido recibido
        </p>
        <h1 className="mt-2 text-3xl font-bold">Orden {order.orderNumber}</h1>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Te enviaremos la confirmación y las novedades del pedido al correo{" "}
          <strong>{order.customerEmail}</strong>.
        </p>

        <dl className="mt-6 grid gap-3 text-sm">
          <SummaryRow label="Estado" value={order.status.replaceAll("_", " ")} />
          <SummaryRow label="Subtotal" value={formatCOP(order.subtotalCop)} />
          <SummaryRow label="Descuento" value={`-${formatCOP(order.discountCop)}`} />
          <SummaryRow
            label="Envío"
            value={
              order.shippingCop === null
                ? "Por confirmar"
                : formatCOP(order.shippingCop)
            }
          />
          <SummaryRow label="Total" value={formatCOP(order.totalCop)} strong />
        </dl>

        <h2 className="mt-8 text-lg font-bold">Productos</h2>
        <ul className="mt-3 grid gap-3">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg p-3 text-sm"
              style={{ border: "1px solid var(--color-border)" }}
            >
              <span className="font-semibold">{item.productName}</span>
              <span style={{ color: "var(--color-text-secondary)" }}>
                {" "}
                · {item.variantLabel} · {item.quantity} unidad(es)
              </span>
            </li>
          ))}
        </ul>

        <Link
          href="/productos"
          className="mt-8 inline-flex rounded-lg px-5 py-3 text-sm font-bold"
          style={{ backgroundColor: "var(--color-magenta)", color: "#fff" }}
        >
          Seguir comprando
        </Link>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt style={{ color: "var(--color-text-secondary)" }}>{label}</dt>
      <dd className={strong ? "text-lg font-bold" : "font-semibold"}>
        {value}
      </dd>
    </div>
  );
}
