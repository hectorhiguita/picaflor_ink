import Link from "next/link";
import {
  SITE_NAME,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  FACEBOOK_PAGE,
  FACEBOOK_URL,
  WHATSAPP_NUMBER,
} from "@/lib/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        color: "var(--color-text-secondary)",
      }}
      className="w-full"
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand column */}
          <div className="flex flex-col gap-3">
            <p className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
              {SITE_NAME}
            </p>
            <p className="text-sm leading-relaxed">
              Productos personalizados con impresión DTF. Camisetas, mugs y más con tus diseños
              favoritos.
            </p>
            <p className="text-sm">
              Medellín y Área Metropolitana, Colombia.
            </p>
          </div>

          {/* Navigation column */}
          <nav aria-label="Navegación del pie de página">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-primary)" }}>
              Tienda
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href="/productos"
                  className="transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:underline"
                >
                  Productos
                </Link>
              </li>
              <li>
                <Link
                  href="/personalizar"
                  className="transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:underline"
                >
                  Personalizar
                </Link>
              </li>
              <li>
                <Link
                  href="/carrito"
                  className="transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:underline"
                >
                  Carrito
                </Link>
              </li>
              <li>
                <Link
                  href="/cuenta"
                  className="transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:underline"
                >
                  Mi cuenta
                </Link>
              </li>
            </ul>
          </nav>

          {/* Social & contact column */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-primary)" }}>
              Síguenos
            </p>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:underline"
                  aria-label={`Instagram de ${SITE_NAME} — ${INSTAGRAM_HANDLE}`}
                >
                  <IconInstagram />
                  <span>{INSTAGRAM_HANDLE}</span>
                </a>
              </li>
              <li>
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:underline"
                  aria-label={`Facebook de ${SITE_NAME} — ${FACEBOOK_PAGE}`}
                >
                  <IconFacebook />
                  <span>{FACEBOOK_PAGE}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:underline"
                  aria-label={`Contactar a ${SITE_NAME} por WhatsApp`}
                >
                  <IconWhatsApp />
                  <span>WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 flex flex-col items-center justify-between gap-2 border-t pt-6 text-xs sm:flex-row"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p>
            &copy; {currentYear} {SITE_NAME}. Todos los derechos reservados.
          </p>
          <p>
            Hecho con{" "}
            <span aria-label="amor" style={{ color: "var(--color-magenta)" }}>
              ♥
            </span>{" "}
            en Medellín
          </p>
        </div>
      </div>
    </footer>
  );
}

function IconInstagram() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}
