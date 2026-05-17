import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SocialFeed from "@/components/social/SocialFeed";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Bienvenido a Picaflor INK. Color, creatividad e identidad en camisetas, mugs y piezas personalizadas con impresión DTF.",
};

export default function HomePage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Picaflor INK",
    url: SITE_URL,
    sameAs: [
      "https://www.instagram.com/picaflor.ink",
      "https://www.facebook.com/picaflorink",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <section className="relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 hidden w-20 grid-cols-6 sm:grid" aria-hidden="true">
          {[
            "var(--color-magenta)",
            "var(--color-cyan)",
            "var(--color-turquoise)",
            "var(--color-green)",
            "var(--color-yellow)",
            "var(--color-orange)",
          ].map((color) => (
            <span key={color} style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 sm:pl-28 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)] lg:px-8">
          <div className="min-w-0 self-center">
            <p className="mb-4 text-sm font-bold uppercase" style={{ color: "var(--color-cyan)" }}>
              Color · Creatividad · Identidad
            </p>
            <h1 className="brand-lockup break-words text-5xl sm:text-7xl">
              Picaflor
              <span className="brand-ink mt-4 block text-2xl not-italic sm:text-4xl" style={{ color: "var(--color-cyan)" }}>
                INK
              </span>
          </h1>
          <p
            className="mt-6 max-w-[36rem] break-words text-base leading-7 sm:text-lg"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Llevamos identidad, energía y creatividad a cada proyecto: camisetas,
            mugs y piezas impresas con acabados cuidados, diseños de catálogo o
            tu propio PNG sin fondo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/productos"
              className="rounded-lg px-5 py-3 text-sm font-bold"
              style={{ backgroundColor: "var(--color-cyan)", color: "var(--color-ink)" }}
            >
              Ver productos
            </Link>
            <Link
              href="/carrito"
              className="rounded-lg border px-5 py-3 text-sm font-bold"
              style={{ borderColor: "var(--color-border)" }}
            >
              Ir al carrito
            </Link>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 text-sm">
            {[
              ["Arte", "Obras únicas"],
              ["Libertad", "Colibrí libre"],
              ["Calidad", "Detalle visible"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {label}
                </dt>
                <dd className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
          <div className="relative min-h-72 overflow-hidden rounded-lg" style={{ border: "1px solid var(--color-border)" }}>
            <Image
              src="/images/brand/picaflor-ink-logo-lockup.png"
              alt="Logo oficial de Picaflor INK con colibrí multicolor"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 54vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
      <SocialFeed />
    </>
  );
}
