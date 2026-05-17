/**
 * Utilities for serializing and validating a product customization.
 *
 * These are pure functions with no side-effects so they can be used both
 * client-side (MockupCustomizer) and server-side (API routes / tests).
 *
 * Requirements: 3.14, 4.1
 */

import type { CustomizationJson, Layer, ImageLayer, TextLayer } from "@/lib/types/mockup";

// ─── Serialization ────────────────────────────────────────────────────────────

/**
 * Build a `CustomizationJson` object from the editor state.
 *
 * This is intentionally a plain factory — it does not mutate anything and
 * does not call any external service.
 */
export function serializeCustomization(params: {
  productId: string;
  variantId: string;
  position: string;
  layers: Layer[];
}): CustomizationJson {
  return {
    productId: params.productId,
    variantId: params.variantId,
    position: params.position,
    layers: [...params.layers],
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

/**
 * Validate a `CustomizationJson` object.
 *
 * Returns `{ valid: true }` when the object is well-formed, or
 * `{ valid: false; errors: string[] }` listing every problem found.
 */
export function validateCustomization(json: CustomizationJson): ValidationResult {
  const errors: string[] = [];

  // ── Top-level required strings ────────────────────────────────────────────

  if (!json.productId || typeof json.productId !== "string" || json.productId.trim() === "") {
    errors.push("productId is required and must be a non-empty string");
  }

  if (!json.variantId || typeof json.variantId !== "string" || json.variantId.trim() === "") {
    errors.push("variantId is required and must be a non-empty string");
  }

  if (!json.position || typeof json.position !== "string" || json.position.trim() === "") {
    errors.push("position is required and must be a non-empty string");
  }

  // ── Layers array ──────────────────────────────────────────────────────────

  if (!Array.isArray(json.layers)) {
    errors.push("layers must be an array");
    // Cannot validate individual layers without the array.
    return { valid: false, errors };
  }

  json.layers.forEach((layer, index) => {
    const prefix = `layers[${index}]`;

    if (!layer || typeof layer !== "object") {
      errors.push(`${prefix} must be an object`);
      return;
    }

    if (layer.type !== "image" && layer.type !== "text") {
      errors.push(`${prefix}.type must be "image" or "text"`);
      return;
    }

    // Common numeric fields present on every layer type.
    for (const field of ["x", "y", "scale"] as const) {
      if (typeof layer[field] !== "number") {
        errors.push(`${prefix}.${field} must be a number`);
      }
    }

    if (layer.type === "image") {
      validateImageLayer(layer as ImageLayer, prefix, errors);
    } else {
      validateTextLayer(layer as TextLayer, prefix, errors);
    }
  });

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function validateImageLayer(
  layer: ImageLayer,
  prefix: string,
  errors: string[]
): void {
  if (layer.source !== "catalog" && layer.source !== "upload") {
    errors.push(`${prefix}.source must be "catalog" or "upload"`);
  }

  if (!layer.assetId || typeof layer.assetId !== "string" || layer.assetId.trim() === "") {
    errors.push(`${prefix}.assetId is required and must be a non-empty string`);
  }

  if (typeof layer.assetUrl !== "string") {
    errors.push(`${prefix}.assetUrl must be a string`);
  }

  if (typeof layer.rotation !== "number") {
    errors.push(`${prefix}.rotation must be a number`);
  }
}

function validateTextLayer(
  layer: TextLayer,
  prefix: string,
  errors: string[]
): void {
  if (!layer.text || typeof layer.text !== "string" || layer.text.trim() === "") {
    errors.push(`${prefix}.text is required and must be a non-empty string`);
  }

  if (!layer.fontFamily || typeof layer.fontFamily !== "string" || layer.fontFamily.trim() === "") {
    errors.push(`${prefix}.fontFamily is required and must be a non-empty string`);
  }

  if (!layer.color || typeof layer.color !== "string" || layer.color.trim() === "") {
    errors.push(`${prefix}.color is required and must be a non-empty string`);
  }

  if (typeof layer.fontSize !== "number") {
    errors.push(`${prefix}.fontSize must be a number`);
  }
}
