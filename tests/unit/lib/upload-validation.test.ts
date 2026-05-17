/**
 * Unit tests for lib/upload-validation.ts
 *
 * Tests validatePngFile with:
 * - A valid PNG file
 * - Wrong MIME type
 * - Wrong file extension
 * - File too large
 *
 * Requirements: 3.5, 3.6
 */

import {
  validatePngFile,
  UPLOAD_ERROR_WRONG_TYPE,
  UPLOAD_ERROR_WRONG_EXTENSION,
  UPLOAD_ERROR_TOO_LARGE,
} from "@/lib/upload-validation";
import { UPLOAD_MAX_SIZE_BYTES } from "@/lib/constants";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates a mock File object with the given properties.
 * The File constructor is available in jsdom (jest-environment-jsdom).
 */
function makeFile(
  name: string,
  type: string,
  sizeBytes: number
): File {
  // Create a Blob of the desired size filled with zeros, then wrap in File.
  const content = new Uint8Array(sizeBytes);
  return new File([content], name, { type });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("validatePngFile", () => {
  describe("valid PNG file", () => {
    it("returns { valid: true } for a valid PNG under the size limit", () => {
      const file = makeFile("design.png", "image/png", 1024); // 1 KB
      expect(validatePngFile(file)).toEqual({ valid: true });
    });

    it("returns { valid: true } for a PNG exactly at the size limit", () => {
      const file = makeFile("design.png", "image/png", UPLOAD_MAX_SIZE_BYTES);
      expect(validatePngFile(file)).toEqual({ valid: true });
    });
  });

  describe("wrong MIME type", () => {
    it("rejects a JPEG file (image/jpeg)", () => {
      const file = makeFile("photo.png", "image/jpeg", 1024);
      const result = validatePngFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(UPLOAD_ERROR_WRONG_TYPE);
      }
    });

    it("rejects a GIF file (image/gif)", () => {
      const file = makeFile("anim.png", "image/gif", 1024);
      const result = validatePngFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(UPLOAD_ERROR_WRONG_TYPE);
      }
    });

    it("rejects a file with empty MIME type", () => {
      const file = makeFile("design.png", "", 1024);
      const result = validatePngFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(UPLOAD_ERROR_WRONG_TYPE);
      }
    });
  });

  describe("wrong file extension", () => {
    it("rejects a file with .jpg extension even if MIME is image/png", () => {
      const file = makeFile("design.jpg", "image/png", 1024);
      const result = validatePngFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(UPLOAD_ERROR_WRONG_EXTENSION);
      }
    });

    it("rejects a file with no extension even if MIME is image/png", () => {
      const file = makeFile("design", "image/png", 1024);
      const result = validatePngFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(UPLOAD_ERROR_WRONG_EXTENSION);
      }
    });

    it("accepts a file with uppercase .PNG extension", () => {
      // Extension check is case-insensitive (lowercased before comparison)
      const file = makeFile("DESIGN.PNG", "image/png", 1024);
      expect(validatePngFile(file)).toEqual({ valid: true });
    });
  });

  describe("file too large", () => {
    it("rejects a file 1 byte over the limit", () => {
      const file = makeFile("big.png", "image/png", UPLOAD_MAX_SIZE_BYTES + 1);
      const result = validatePngFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(UPLOAD_ERROR_TOO_LARGE);
      }
    });

    it("rejects a file significantly over the limit (20 MB)", () => {
      const file = makeFile("huge.png", "image/png", 20 * 1024 * 1024);
      const result = validatePngFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe(UPLOAD_ERROR_TOO_LARGE);
      }
    });
  });

  describe("error message content", () => {
    it("UPLOAD_ERROR_WRONG_TYPE mentions PNG", () => {
      expect(UPLOAD_ERROR_WRONG_TYPE.toLowerCase()).toContain("png");
    });

    it("UPLOAD_ERROR_TOO_LARGE mentions the size limit in MB", () => {
      expect(UPLOAD_ERROR_TOO_LARGE).toContain("10");
      expect(UPLOAD_ERROR_TOO_LARGE.toLowerCase()).toContain("mb");
    });
  });
});
