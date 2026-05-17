/**
 * Pure validation functions for customer PNG uploads.
 *
 * Validation is intentionally side-effect-free so it can be called both
 * client-side (for immediate UX feedback) and server-side (for security).
 *
 * Requirements: 3.4, 3.5, 3.6
 */

import { UPLOAD_MAX_SIZE_BYTES, UPLOAD_ACCEPTED_MIME } from "@/lib/constants";

// ─── Error message constants ──────────────────────────────────────────────────

export const UPLOAD_ERROR_WRONG_TYPE =
  "Solo se aceptan archivos PNG. Por favor selecciona un archivo con extensión .png.";

export const UPLOAD_ERROR_WRONG_EXTENSION =
  "El archivo debe tener extensión .png.";

export const UPLOAD_ERROR_TOO_LARGE = `El archivo supera el límite de ${Math.round(UPLOAD_MAX_SIZE_BYTES / (1024 * 1024))} MB. Por favor usa un archivo más pequeño.`;

export const UPLOAD_ERROR_NO_FILE = "No se seleccionó ningún archivo.";

// ─── Validation result type ───────────────────────────────────────────────────

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

// ─── validatePngFile ──────────────────────────────────────────────────────────

/**
 * Validates that a File is an acceptable customer PNG upload.
 *
 * Checks (in order):
 * 1. MIME type must be "image/png" (Req 3.5)
 * 2. File extension must be ".png" (Req 3.5)
 * 3. File size must be ≤ UPLOAD_MAX_SIZE_BYTES (Req 3.6)
 *
 * Returns `{ valid: true }` on success, or `{ valid: false; error: string }`
 * with a descriptive Spanish-language error message on failure.
 */
export function validatePngFile(file: File): ValidationResult {
  // 1. MIME type check
  if (!UPLOAD_ACCEPTED_MIME.includes(file.type as "image/png")) {
    return { valid: false, error: UPLOAD_ERROR_WRONG_TYPE };
  }

  // 2. Extension check (defence-in-depth: some browsers may spoof MIME)
  const nameLower = file.name.toLowerCase();
  if (!nameLower.endsWith(".png")) {
    return { valid: false, error: UPLOAD_ERROR_WRONG_EXTENSION };
  }

  // 3. Size check
  if (file.size > UPLOAD_MAX_SIZE_BYTES) {
    return { valid: false, error: UPLOAD_ERROR_TOO_LARGE };
  }

  return { valid: true };
}
