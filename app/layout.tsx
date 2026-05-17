import type { Metadata } from "next";
import "@/styles/globals.css";
import WhatsAppCTA from "@/components/ui/WhatsAppCTA";

export const metadata: Metadata = {
  title: {
    default: "Picaflor INK — Color, Creatividad e Identidad",
    template: "%s | Picaflor INK",
  },
  description:
    "Productos personalizados con impresión DTF: color, creatividad e identidad para camisetas, mugs y piezas únicas. Envíos en Medellín y Área Metropolitana.",
  metadataBase: new URL("https://picaflorink.shop"),
  openGraph: {
    siteName: "Picaflor INK",
    locale: "es_CO",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body>
        {children}
        <WhatsAppCTA />
      </body>
    </html>
  );
}
