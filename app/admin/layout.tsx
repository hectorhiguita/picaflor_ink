import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";

const ADMIN_LINKS = [
  ["/admin", "Dashboard"],
  ["/admin/productos", "Productos"],
  ["/admin/disenos", "Diseños"],
  ["/admin/pedidos", "Pedidos"],
  ["/admin/clientes", "Clientes"],
  ["/admin/cupones", "Cupones"],
  ["/admin/envios", "Envíos"],
  ["/admin/configuracion", "Configuración"],
] as const;

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-dvh" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <header
        className="border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-lg font-black">
              Picaflor INK Admin
            </Link>
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {user.email}
            </span>
          </div>
          <nav className="flex gap-2 overflow-x-auto" aria-label="Admin">
            {ADMIN_LINKS.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold"
                style={{ borderColor: "var(--color-border)" }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
