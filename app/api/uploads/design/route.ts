/**
 * POST /api/uploads/design
 *
 * Accepts a multipart/form-data request with a `file` field containing a PNG
 * image uploaded by the customer.
 *
 * Server-side validation (never trust the client):
 * - MIME type must be "image/png"
 * - File size must be ≤ UPLOAD_MAX_SIZE_BYTES (10 MB)
 *
 * On success returns:
 *   { url: string; assetId: string }
 *
 * On validation failure returns HTTP 400:
 *   { error: string }
 *
 * On size exceeded returns HTTP 413:
 *   { error: string }
 *
 * Requirements: 3.4, 3.5, 3.6
 */

import { NextRequest, NextResponse } from "next/server";
import { validatePngFile, UPLOAD_ERROR_NO_FILE } from "@/lib/upload-validation";
import { UPLOAD_MAX_SIZE_BYTES } from "@/lib/constants";

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Parse multipart form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "La solicitud debe ser multipart/form-data." },
      { status: 400 }
    );
  }

  const fileEntry = formData.get("file");

  if (!fileEntry || !(fileEntry instanceof File)) {
    return NextResponse.json({ error: UPLOAD_ERROR_NO_FILE }, { status: 400 });
  }

  const file = fileEntry as File;

  // ── Server-side validation (Req 3.5, 3.6) ──────────────────────────────────
  // Size check first so we can return 413 specifically for oversized files.
  if (file.size > UPLOAD_MAX_SIZE_BYTES) {
    return NextResponse.json(
      {
        error: `El archivo supera el límite de ${Math.round(UPLOAD_MAX_SIZE_BYTES / (1024 * 1024))} MB. Por favor usa un archivo más pequeño.`,
      },
      { status: 413 }
    );
  }

  const validation = validatePngFile(file);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // ── Generate a non-guessable asset ID ──────────────────────────────────────
  const assetId = crypto.randomUUID();

  // ── Store the file ─────────────────────────────────────────────────────────
  //
  // PRODUCTION S3 INTEGRATION POINT:
  // Replace the base64 data URL below with an S3 upload:
  //
  //   import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
  //   const s3 = new S3Client({ region: process.env.AWS_REGION });
  //   const storageKey = `uploads/designs/${assetId}.png`;
  //   await s3.send(new PutObjectCommand({
  //     Bucket: process.env.S3_BUCKET_NAME,
  //     Key: storageKey,
  //     Body: Buffer.from(await file.arrayBuffer()),
  //     ContentType: "image/png",
  //     // Use a private ACL; serve via CloudFront signed URLs or presigned S3 URLs.
  //   }));
  //   const url = `https://${process.env.CLOUDFRONT_DOMAIN}/${storageKey}`;
  //
  // For development, we store the file as a base64 data URL so the editor can
  // render it immediately without requiring AWS credentials.

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const url = `data:image/png;base64,${base64}`;

  return NextResponse.json({ url, assetId }, { status: 200 });
}
