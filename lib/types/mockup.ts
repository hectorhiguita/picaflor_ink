/**
 * TypeScript types for the Mockup Generator customization layer model.
 * Matches the customizationJson schema stored in CartItem and OrderItem.
 */

// ─── Layers ───────────────────────────────────────────────────────────────────

export interface ImageLayer {
  /** Stable ID used to track this layer across renders without re-creating canvas objects. */
  id: string;
  type: "image";
  /** Whether the image comes from the design catalog or a customer upload */
  source: "catalog" | "upload";
  /** ID of the MediaAsset or DesignCatalogItem */
  assetId: string;
  /** Resolved URL for rendering (not persisted — derived at render time) */
  assetUrl: string;
  x: number;
  y: number;
  /**
   * Scale multiplier relative to the "fitted" size (1.0 = image fitted to the
   * printable area when first added). Stored as a fraction, e.g. 0.5 = 50%.
   */
  scale: number;
  rotation: number;
}

export interface TextLayer {
  /** Stable ID used to track this layer across renders. */
  id: string;
  type: "text";
  text: string;
  fontFamily: string;
  color: string;
  x: number;
  y: number;
  scale: number;
  fontSize: number;
}

export type Layer = ImageLayer | TextLayer;

// ─── Customization JSON ───────────────────────────────────────────────────────

/**
 * Serialized representation of a product customization.
 * Stored in CartItem.customizationJson and OrderItem.customizationJson.
 */
export interface CustomizationJson {
  productId: string;
  variantId: string;
  /** Print position, e.g. FRONT_CHEST | BACK | SLEEVE | MUG_FRONT */
  position: string;
  layers: Layer[];
}

// ─── Printable Area ───────────────────────────────────────────────────────────

/**
 * Bounds of the printable area on the canvas, in canvas-pixel coordinates.
 * Mirrors the PrintableArea DB model fields used by the editor.
 */
export interface PrintableAreaBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}
