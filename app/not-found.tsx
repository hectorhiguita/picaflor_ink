import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        gap: "1rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "4rem", fontWeight: 700, color: "var(--color-magenta)" }}>404</h1>
      <p style={{ color: "var(--color-text-secondary)" }}>Esta página no existe o fue movida.</p>
      <Link
        href="/"
        style={{
          color: "var(--color-cyan)",
          textDecoration: "underline",
        }}
      >
        Volver al inicio
      </Link>
    </main>
  );
}
