"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE_NAME } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/productos", label: "Productos" },
  { href: "/productos", label: "Personalizar" },
  { href: "/carrito", label: "Carrito" },
] as const;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{ backgroundColor: "var(--color-ink)", borderBottom: "1px solid var(--color-border)" }}
      className="sticky top-0 z-40 w-full"
    >
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
          aria-label={`${SITE_NAME} — Ir al inicio`}
        >
          <PicaflorLogo />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={`${href}-${label}`}
              href={href}
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="flex md:hidden items-center justify-center w-10 h-10 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          style={{ color: "var(--color-text-primary)" }}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Menú móvil"
          style={{ backgroundColor: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}
          className="md:hidden"
        >
          <ul className="flex flex-col px-4 py-3 gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={`${href}-${label}`}>
                <Link
                  href={href}
                  className="block py-2 text-sm font-medium rounded px-2 transition-colors duration-150"
                  style={{ color: "var(--color-text-secondary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

/** Picaflor INK logotype following the approved white-on-black direction. */
function PicaflorLogo() {
  return (
    <span className="flex select-none items-center gap-3" aria-hidden="true">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--color-cyan)" }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--color-green)" }} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="brand-lockup text-2xl" style={{ color: "var(--color-text-primary)" }}>
          Picaflor
        </span>
        <span className="brand-ink mt-1 text-[0.62rem] font-bold" style={{ color: "var(--color-text-primary)" }}>
          INK
        </span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--color-yellow)" }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--color-magenta)" }} />
      </span>
    </span>
  );
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" focusable="false">
      <line x1="2" y1="5" x2="20" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="11" x2="20" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" focusable="false">
      <line x1="3" y1="3" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="3" x2="3" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
