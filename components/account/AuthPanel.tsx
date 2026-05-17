"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

type Mode = "login" | "register";

export default function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      }),
    });
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    setSubmitting(false);

    if (!response.ok) {
      setError(body.error ?? "No pudimos completar la solicitud.");
      return;
    }

    router.push("/cuenta/pedidos");
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="mb-6 grid grid-cols-2 rounded-lg border p-1" style={{ borderColor: "var(--color-border)" }}>
          <button
            type="button"
            className="rounded-md px-3 py-2 text-sm font-bold"
            style={{
              backgroundColor:
                mode === "login" ? "var(--color-magenta)" : "transparent",
            }}
            onClick={() => setMode("login")}
          >
            Entrar
          </button>
          <button
            type="button"
            className="rounded-md px-3 py-2 text-sm font-bold"
            style={{
              backgroundColor:
                mode === "register" ? "var(--color-magenta)" : "transparent",
            }}
            onClick={() => setMode("register")}
          >
            Crear cuenta
          </button>
        </div>

        <form className="grid gap-4" onSubmit={submit}>
          {mode === "register" && (
            <Input name="name" label="Nombre" autoComplete="name" />
          )}
          <Input
            name="email"
            label="Correo"
            type="email"
            autoComplete="email"
          />
          <Input
            name="password"
            label="Contraseña"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
          {error && (
            <p className="text-sm text-red-300" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={submitting} fullWidth>
            {submitting
              ? "Procesando..."
              : mode === "login"
                ? "Entrar"
                : "Crear cuenta"}
          </Button>
        </form>

        <a
          href="/api/auth/google"
          className="mt-4 flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-bold"
          style={{ borderColor: "var(--color-border)" }}
        >
          Continuar con Google
        </a>
      </div>
    </section>
  );
}

function Input({
  name,
  label,
  type = "text",
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="min-h-11 rounded-lg border bg-transparent px-3 text-sm"
        style={{ borderColor: "var(--color-border)" }}
        required
      />
    </label>
  );
}

