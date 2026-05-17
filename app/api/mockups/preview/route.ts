/**
 * POST /api/mockups/preview
 *
 * Accepts a canvas data URL and a customizationJson, validates the
 * customization, and returns a preview URL + asset ID.
 *
 * In production this endpoint would upload the data URL to S3 and return a
 * CDN URL. For now it echoes the data URL back so the rest of the cart flow
 * can be wired up without requiring cloud storage.
 *
 * Requirements: 3.14, 4.1
 */

import { NextRequest, NextResponse } from "next/server";
import { validateCustomization } from "@/lib/customization-serialization";
import type { CustomizationJson } from "@/lib/types/mockup";

// ─── Request body shape ───────────────────────────────────────────────────────

interface PreviewRequestBody {
  previewDataUrl: string;
  customizationJson: CustomizationJson;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: PreviewRequestBody;

  try {
    body = (await request.json()) as PreviewRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { previewDataUrl, customizationJson } = body;

  // ── Validate previewDataUrl ───────────────────────────────────────────────

  if (!previewDataUrl || typeof previewDataUrl !== "string") {
    return NextResponse.json(
      { error: "previewDataUrl is required and must be a string" },
      { status: 400 }
    );
  }

  // ── Validate customizationJson ────────────────────────────────────────────

  if (!customizationJson || typeof customizationJson !== "object") {
    return NextResponse.json(
      { error: "customizationJson is required" },
      { status: 400 }
    );
  }

  const validation = validateCustomization(customizationJson);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Invalid customizationJson", details: validation.errors },
      { status: 422 }
    );
  }

  // ── Generate a deterministic asset ID from the customization ─────────────
  // In production: upload previewDataUrl to S3 and return the CDN URL.
  // For now: echo the data URL back and generate a pseudo-unique asset ID.

  const assetId = [
    customizationJson.productId,
    customizationJson.variantId,
    customizationJson.position,
    Date.now().toString(36),
  ].join("-");

  return NextResponse.json(
    {
      previewUrl: previewDataUrl,
      assetId,
    },
    { status: 200 }
  );
}
