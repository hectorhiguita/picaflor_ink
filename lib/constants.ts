/**
 * Application-wide constants for Picaflor INK.
 */

export const SITE_NAME = "Picaflor INK";
export const SITE_URL = "https://picaflorink.shop";
export const SITE_DESCRIPTION =
  "Color, creatividad e identidad en productos personalizados con impresión DTF.";

/** WhatsApp contact number (without country code prefix for wa.me links) */
export const WHATSAPP_NUMBER = "573223684981";
export const WHATSAPP_DEFAULT_MESSAGE = "Hola Picaflor INK, tengo una consulta sobre un producto.";

/** Social media */
export const INSTAGRAM_HANDLE = "@picaflor.ink";
export const INSTAGRAM_URL = "https://www.instagram.com/picaflor.ink";
export const FACEBOOK_PAGE = "Picaflor INK";
export const FACEBOOK_URL = "https://www.facebook.com/picaflorink";

/** Brand color palette */
export const BRAND_COLORS = {
  bgPrimary: "#111111",
  surface: "#181818",
  surfaceElevated: "#222222",
  textPrimary: "#ffffff",
  textSecondary: "#c9c9c9",
  ink: "#111111",
  cyan: "#00C8FF",
  green: "#64DC14",
  magenta: "#FF1493",
  yellow: "#FFB300",
  orange: "#FF4500",
  violet: "#9400D3",
  turquoise: "#00C896",
  error: "#FF4500",
  border: "rgba(255,255,255,0.14)",
} as const;

/** Upload constraints */
export const UPLOAD_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const UPLOAD_ACCEPTED_MIME = ["image/png"] as const;

/** Mockup generator layer scale limits */
export const LAYER_SCALE_MIN = 0.1; // 10%
export const LAYER_SCALE_MAX = 2.0; // 200%

/** Currency */
export const CURRENCY = "COP";
