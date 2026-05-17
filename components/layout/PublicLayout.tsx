import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * PublicLayout wraps all public-facing pages with the site Header and Footer.
 * The WhatsApp CTA is rendered globally in the root layout.
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <Header />
      <main className="flex-1" id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
