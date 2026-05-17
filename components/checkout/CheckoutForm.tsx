"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useCartStore, selectIsCartEmpty } from "@/lib/cart-store";
import {
  CHECKOUT_DRAFT_STORAGE_KEY,
  EMPTY_CHECKOUT_FORM,
  hasCheckoutErrors,
  normalizeCheckoutForm,
  validateCheckoutForm,
} from "@/lib/checkout-validation";
import { formatCOP } from "@/lib/utils";
import type {
  CheckoutErrors,
  CheckoutField,
  CheckoutFormData,
  CheckoutResponse,
} from "@/lib/types/checkout";
import type { ShippingRateData } from "@/lib/types/shipping";

const FIELD_LABELS: Record<CheckoutField, string> = {
  fullName: "Nombre completo",
  email: "Correo electrónico",
  phone: "Teléfono",
  addressLine1: "Dirección de entrega",
  addressLine2: "Apartamento, torre o referencia",
  city: "Ciudad o municipio",
  zone: "Zona de entrega",
  notes: "Notas",
};

export default function CheckoutForm() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const loading = useCartStore((s) => s.loading);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const isCartEmpty = useCartStore(selectIsCartEmpty);
  const [form, setForm] = useState<CheckoutFormData>(EMPTY_CHECKOUT_FORM);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [rates, setRates] = useState<ShippingRateData[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(CHECKOUT_DRAFT_STORAGE_KEY);
    if (stored) {
      setForm({ ...EMPTY_CHECKOUT_FORM, ...JSON.parse(stored) });
    }
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(
      CHECKOUT_DRAFT_STORAGE_KEY,
      JSON.stringify(form)
    );
  }, [form]);

  useEffect(() => {
    let alive = true;
    fetch("/api/shipping/rates")
      .then((res) => (res.ok ? res.json() : { rates: [] }))
      .then((data: { rates?: ShippingRateData[] }) => {
        if (alive) setRates(data.rates ?? []);
      })
      .catch(() => {
        if (alive) setRates([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  const selectedRate = useMemo(() => {
    if (!form.zone) return null;
    return rates.find(
      (rate) => rate.zone.toLowerCase() === form.zone.trim().toLowerCase()
    );
  }, [form.zone, rates]);

  const shippingCop = selectedRate?.priceCop ?? null;
  const finalTotal = (cart?.totalCop ?? 0) + (shippingCop ?? 0);

  function updateField(field: CheckoutField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeCheckoutForm(form);
    const validation = validateCheckoutForm(normalized);
    setErrors(validation);

    if (hasCheckoutErrors(validation)) return;

    setSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: normalized }),
      });
      const data = (await response.json()) as
        | CheckoutResponse
        | { error?: string; fieldErrors?: CheckoutErrors };

      if (!response.ok) {
        if ("fieldErrors" in data && data.fieldErrors) {
          setErrors(data.fieldErrors);
        }
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "No pudimos iniciar el pago."
        );
      }

      window.sessionStorage.removeItem(CHECKOUT_DRAFT_STORAGE_KEY);
      router.push((data as CheckoutResponse).paymentUrl);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "No pudimos iniciar el pago."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !cart) {
    return (
      <section className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
        <p style={{ color: "var(--color-text-secondary)" }}>
          Cargando checkout...
        </p>
      </section>
    );
  }

  if (!loading && isCartEmpty) {
    return (
      <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <div
          className="rounded-xl p-8"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Agrega un producto personalizado antes de continuar al pago.
          </p>
          <Link
            href="/productos"
            className="mt-6 inline-flex rounded-lg px-5 py-3 text-sm font-bold"
            style={{ backgroundColor: "var(--color-magenta)", color: "#fff" }}
          >
            Ver productos
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Checkout
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
          <div
            className="grid gap-4 rounded-xl p-5 sm:grid-cols-2"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <Field
              field="fullName"
              value={form.fullName}
              error={errors.fullName}
              onChange={updateField}
              autoComplete="name"
            />
            <Field
              field="email"
              value={form.email}
              error={errors.email}
              onChange={updateField}
              type="email"
              autoComplete="email"
            />
            <Field
              field="phone"
              value={form.phone}
              error={errors.phone}
              onChange={updateField}
              type="tel"
              autoComplete="tel"
            />
            <Field
              field="city"
              value={form.city}
              error={errors.city}
              onChange={updateField}
              autoComplete="address-level2"
            />
            <Field
              field="addressLine1"
              value={form.addressLine1}
              error={errors.addressLine1}
              onChange={updateField}
              autoComplete="street-address"
              className="sm:col-span-2"
            />
            <Field
              field="addressLine2"
              value={form.addressLine2}
              error={errors.addressLine2}
              onChange={updateField}
              className="sm:col-span-2"
            />
            <label className="grid gap-2">
              <span className="text-sm font-semibold">{FIELD_LABELS.zone}</span>
              <input
                list="shipping-zones"
                value={form.zone}
                onChange={(event) => updateField("zone", event.target.value)}
                className="min-h-11 rounded-lg border bg-transparent px-3 py-2 text-sm"
                style={{
                  borderColor: errors.zone
                    ? "var(--color-error)"
                    : "var(--color-border)",
                }}
                aria-invalid={Boolean(errors.zone)}
                aria-describedby={errors.zone ? "zone-error" : undefined}
              />
              <datalist id="shipping-zones">
                {rates.map((rate) => (
                  <option key={rate.id} value={rate.zone}>
                    {rate.name}
                  </option>
                ))}
              </datalist>
              {errors.zone && (
                <span id="zone-error" className="text-xs text-red-300">
                  {errors.zone}
                </span>
              )}
            </label>
            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-semibold">{FIELD_LABELS.notes}</span>
              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                rows={4}
                className="rounded-lg border bg-transparent px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-border)" }}
              />
            </label>
          </div>

          {serverError && (
            <p
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                color: "var(--color-error)",
                border: "1px solid rgba(255,77,77,0.35)",
                backgroundColor: "rgba(255,77,77,0.1)",
              }}
              role="alert"
            >
              {serverError}
            </p>
          )}

          <Button type="submit" size="lg" disabled={submitting} fullWidth>
            {submitting ? "Preparando pago..." : "Pagar con Wompi"}
          </Button>
        </form>

        <aside
          className="rounded-xl p-5 lg:sticky lg:top-24"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2 className="text-base font-bold uppercase tracking-wider">
            Resumen
          </h2>
          <dl className="mt-5 grid gap-3 text-sm">
            <SummaryLine label="Subtotal" value={formatCOP(cart?.subtotalCop ?? 0)} />
            <SummaryLine
              label="Descuento"
              value={`-${formatCOP(cart?.discountCop ?? 0)}`}
            />
            <SummaryLine
              label="Envío"
              value={shippingCop === null ? "Por confirmar" : formatCOP(shippingCop)}
            />
            <div
              className="mt-2 flex justify-between border-t pt-4 text-base font-bold"
              style={{ borderColor: "var(--color-border)" }}
            >
              <dt>Total</dt>
              <dd style={{ color: "var(--color-magenta)" }}>
                {formatCOP(finalTotal)}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}

function Field({
  field,
  value,
  error,
  onChange,
  type = "text",
  autoComplete,
  className = "",
}: {
  field: CheckoutField;
  value: string;
  error?: string;
  onChange: (field: CheckoutField, value: string) => void;
  type?: string;
  autoComplete?: string;
  className?: string;
}) {
  const id = `checkout-${field}`;
  return (
    <label className={`grid gap-2 ${className}`} htmlFor={id}>
      <span className="text-sm font-semibold">{FIELD_LABELS[field]}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(field, event.target.value)}
        autoComplete={autoComplete}
        className="min-h-11 rounded-lg border bg-transparent px-3 py-2 text-sm"
        style={{
          borderColor: error ? "var(--color-error)" : "var(--color-border)",
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <span id={`${id}-error`} className="text-xs text-red-300">
          {error}
        </span>
      )}
    </label>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt style={{ color: "var(--color-text-secondary)" }}>{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
