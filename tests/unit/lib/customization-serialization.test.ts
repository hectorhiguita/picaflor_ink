/**
 * Unit tests for lib/customization-serialization.ts
 *
 * Tests:
 * - serializeCustomization with image and text layers
 * - validateCustomization with valid and invalid inputs
 *
 * Requirements: 3.14, 4.1
 */

import {
  serializeCustomization,
  validateCustomization,
} from "@/lib/customization-serialization";
import type { CustomizationJson, ImageLayer, TextLayer } from "@/lib/types/mockup";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const imageLayer: ImageLayer = {
  type: "image",
  source: "catalog",
  assetId: "asset-001",
  assetUrl: "https://cdn.example.com/designs/asset-001.png",
  x: 120,
  y: 90,
  scale: 1,
  rotation: 0,
};

const uploadImageLayer: ImageLayer = {
  type: "image",
  source: "upload",
  assetId: "upload-abc",
  assetUrl: "https://cdn.example.com/uploads/upload-abc.png",
  x: 50,
  y: 60,
  scale: 0.8,
  rotation: 15,
};

const textLayer: TextLayer = {
  type: "text",
  text: "Mi texto",
  fontFamily: "Montserrat",
  color: "#FFB300",
  x: 140,
  y: 220,
  scale: 1,
  fontSize: 24,
};

const validCustomization: CustomizationJson = {
  productId: "product-001",
  variantId: "variant-red-m",
  position: "FRONT_CHEST",
  layers: [imageLayer, textLayer],
};

// ─── serializeCustomization ───────────────────────────────────────────────────

describe("serializeCustomization", () => {
  it("returns a CustomizationJson with the provided productId, variantId and position", () => {
    const result = serializeCustomization({
      productId: "product-001",
      variantId: "variant-red-m",
      position: "FRONT_CHEST",
      layers: [],
    });

    expect(result.productId).toBe("product-001");
    expect(result.variantId).toBe("variant-red-m");
    expect(result.position).toBe("FRONT_CHEST");
  });

  it("includes an empty layers array when no layers are provided", () => {
    const result = serializeCustomization({
      productId: "p1",
      variantId: "v1",
      position: "BACK",
      layers: [],
    });

    expect(result.layers).toEqual([]);
  });

  it("serializes a single image layer (catalog source)", () => {
    const result = serializeCustomization({
      productId: "p1",
      variantId: "v1",
      position: "FRONT_CHEST",
      layers: [imageLayer],
    });

    expect(result.layers).toHaveLength(1);
    expect(result.layers[0]).toEqual(imageLayer);
  });

  it("serializes a single image layer (upload source)", () => {
    const result = serializeCustomization({
      productId: "p1",
      variantId: "v1",
      position: "FRONT_CHEST",
      layers: [uploadImageLayer],
    });

    expect(result.layers[0]).toEqual(uploadImageLayer);
  });

  it("serializes a single text layer", () => {
    const result = serializeCustomization({
      productId: "p1",
      variantId: "v1",
      position: "FRONT_CHEST",
      layers: [textLayer],
    });

    expect(result.layers).toHaveLength(1);
    expect(result.layers[0]).toEqual(textLayer);
  });

  it("serializes mixed image and text layers preserving order", () => {
    const result = serializeCustomization({
      productId: "p1",
      variantId: "v1",
      position: "FRONT_CHEST",
      layers: [imageLayer, textLayer],
    });

    expect(result.layers).toHaveLength(2);
    expect(result.layers[0]).toEqual(imageLayer);
    expect(result.layers[1]).toEqual(textLayer);
  });

  it("does not mutate the input layers array", () => {
    const layers: import("@/lib/types/mockup").Layer[] = [imageLayer];
    const result = serializeCustomization({
      productId: "p1",
      variantId: "v1",
      position: "FRONT_CHEST",
      layers,
    });

    // The returned layers array is a shallow copy — pushing to the original
    // should not affect the result.
    layers.push(textLayer);
    expect(result.layers).toHaveLength(1);
  });
});

// ─── validateCustomization — valid inputs ─────────────────────────────────────

describe("validateCustomization — valid inputs", () => {
  it("returns { valid: true } for a well-formed customization with image + text layers", () => {
    expect(validateCustomization(validCustomization)).toEqual({ valid: true });
  });

  it("returns { valid: true } for a customization with no layers", () => {
    const json: CustomizationJson = {
      productId: "p1",
      variantId: "v1",
      position: "BACK",
      layers: [],
    };
    expect(validateCustomization(json)).toEqual({ valid: true });
  });

  it("returns { valid: true } for a customization with only an image layer", () => {
    const json: CustomizationJson = {
      productId: "p1",
      variantId: "v1",
      position: "SLEEVE",
      layers: [imageLayer],
    };
    expect(validateCustomization(json)).toEqual({ valid: true });
  });

  it("returns { valid: true } for a customization with only a text layer", () => {
    const json: CustomizationJson = {
      productId: "p1",
      variantId: "v1",
      position: "MUG_FRONT",
      layers: [textLayer],
    };
    expect(validateCustomization(json)).toEqual({ valid: true });
  });

  it("returns { valid: true } for an upload image layer", () => {
    const json: CustomizationJson = {
      productId: "p1",
      variantId: "v1",
      position: "FRONT_CHEST",
      layers: [uploadImageLayer],
    };
    expect(validateCustomization(json)).toEqual({ valid: true });
  });
});

// ─── validateCustomization — invalid top-level fields ────────────────────────

describe("validateCustomization — invalid top-level fields", () => {
  it("returns errors when productId is empty", () => {
    const json: CustomizationJson = { ...validCustomization, productId: "" };
    const result = validateCustomization(json);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes("productId"))).toBe(true);
    }
  });

  it("returns errors when variantId is empty", () => {
    const json: CustomizationJson = { ...validCustomization, variantId: "" };
    const result = validateCustomization(json);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes("variantId"))).toBe(true);
    }
  });

  it("returns errors when position is empty", () => {
    const json: CustomizationJson = { ...validCustomization, position: "" };
    const result = validateCustomization(json);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes("position"))).toBe(true);
    }
  });

  it("returns errors when layers is not an array", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = { ...validCustomization, layers: "not-an-array" } as any;
    const result = validateCustomization(json);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes("layers"))).toBe(true);
    }
  });

  it("collects multiple top-level errors at once", () => {
    const json: CustomizationJson = {
      productId: "",
      variantId: "",
      position: "",
      layers: [],
    };
    const result = validateCustomization(json);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    }
  });
});

// ─── validateCustomization — invalid image layer ──────────────────────────────

describe("validateCustomization — invalid image layer", () => {
  it("returns errors when image layer source is invalid", () => {
    const badLayer = { ...imageLayer, source: "unknown" as "catalog" };
    const json: CustomizationJson = { ...validCustomization, layers: [badLayer] };
    const result = validateCustomization(json);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes("source"))).toBe(true);
    }
  });

  it("returns errors when image layer assetId is empty", () => {
    const badLayer: ImageLayer = { ...imageLayer, assetId: "" };
    const json: CustomizationJson = { ...validCustomization, layers: [badLayer] };
    const result = validateCustomization(json);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes("assetId"))).toBe(true);
    }
  });

  it("returns errors when image layer x is not a number", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const badLayer = { ...imageLayer, x: "not-a-number" } as any;
    const json: CustomizationJson = { ...validCustomization, layers: [badLayer] };
    const result = validateCustomization(json);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes(".x"))).toBe(true);
    }
  });
});

// ─── validateCustomization — invalid text layer ───────────────────────────────

describe("validateCustomization — invalid text layer", () => {
  it("returns errors when text layer text is empty", () => {
    const badLayer: TextLayer = { ...textLayer, text: "" };
    const json: CustomizationJson = { ...validCustomization, layers: [badLayer] };
    const result = validateCustomization(json);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes(".text"))).toBe(true);
    }
  });

  it("returns errors when text layer fontFamily is empty", () => {
    const badLayer: TextLayer = { ...textLayer, fontFamily: "" };
    const json: CustomizationJson = { ...validCustomization, layers: [badLayer] };
    const result = validateCustomization(json);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes("fontFamily"))).toBe(true);
    }
  });

  it("returns errors when text layer color is empty", () => {
    const badLayer: TextLayer = { ...textLayer, color: "" };
    const json: CustomizationJson = { ...validCustomization, layers: [badLayer] };
    const result = validateCustomization(json);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes("color"))).toBe(true);
    }
  });

  it("returns errors when text layer fontSize is not a number", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const badLayer = { ...textLayer, fontSize: "big" } as any;
    const json: CustomizationJson = { ...validCustomization, layers: [badLayer] };
    const result = validateCustomization(json);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes("fontSize"))).toBe(true);
    }
  });

  it("returns errors when layer type is unknown", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const badLayer = { ...textLayer, type: "video" } as any;
    const json: CustomizationJson = { ...validCustomization, layers: [badLayer] };
    const result = validateCustomization(json);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes("type"))).toBe(true);
    }
  });
});
