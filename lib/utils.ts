/**
 * Shared utility functions for Picaflor INK.
 *
 * This module contains pure helper functions used across the application:
 * price formatting, slug generation, validation helpers, etc.
 */

/**
 * Format a number as Colombian Peso (COP) currency string.
 * e.g. 40000 → "$40.000"
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convert a string to a URL-safe slug.
 * e.g. "Camiseta Algodón" → "camiseta-algodon"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Clamp a number between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
