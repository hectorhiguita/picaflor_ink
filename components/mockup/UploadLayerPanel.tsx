"use client";

/**
 * UploadLayerPanel — Panel for uploading a custom PNG and adding it as a layer.
 *
 * Responsibilities:
 * - Drag-and-drop zone + click-to-browse file input (accept=".png,image/png").
 * - Show file name and size preview before upload.
 * - Validate client-side first (MIME + size) and show descriptive errors
 *   immediately (Req 3.5, 3.6).
 * - Upload to /api/uploads/design on confirm.
 * - Show loading state during upload.
 * - On success, create an ImageLayer with source: "upload" and add it to layers
 *   (Req 3.4).
 * - Show upload errors descriptively (wrong type, too large, server error).
 *
 * Requirements: 3.4, 3.5, 3.6
 */

import { useState, useCallback, useRef, DragEvent, ChangeEvent } from "react";
import type { Layer, ImageLayer, PrintableAreaBounds } from "@/lib/types/mockup";
import { validatePngFile } from "@/lib/upload-validation";
import { UPLOAD_MAX_SIZE_BYTES } from "@/lib/constants";

// ─── Props ────────────────────────────────────────────────────────────────────

interface UploadLayerPanelProps {
  layers: Layer[];
  onLayersChange: (layers: Layer[]) => void;
  printableArea: PrintableAreaBounds;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UploadLayerPanel({
  layers,
  onLayersChange,
  printableArea,
}: UploadLayerPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File selection (shared by drag-drop and click-to-browse) ─────────────

  const handleFileSelected = useCallback((file: File) => {
    setServerError(null);
    setSelectedFile(null);

    const result = validatePngFile(file);
    if (!result.valid) {
      setClientError(result.error);
      return;
    }

    setClientError(null);
    setSelectedFile(file);
  }, []);

  // ── Drag-and-drop handlers ────────────────────────────────────────────────

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelected(file);
    },
    [handleFileSelected]
  );

  // ── Click-to-browse handler ───────────────────────────────────────────────

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelected(file);
      // Reset input so the same file can be re-selected after clearing
      e.target.value = "";
    },
    [handleFileSelected]
  );

  // ── Clear selection ───────────────────────────────────────────────────────

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setClientError(null);
    setServerError(null);
  }, []);

  // ── Upload and add layer ──────────────────────────────────────────────────

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setUploading(true);
    setServerError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/uploads/design", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { url?: string; assetId?: string; error?: string };

      if (!response.ok) {
        setServerError(
          data.error ?? "Error al subir el archivo. Por favor intenta de nuevo."
        );
        return;
      }

      if (!data.url || !data.assetId) {
        setServerError("Respuesta inesperada del servidor. Por favor intenta de nuevo.");
        return;
      }

      const newLayer: ImageLayer = {
        id: crypto.randomUUID(),
        type: "image",
        source: "upload",
        assetId: data.assetId,
        assetUrl: data.url,
        x: printableArea.x + printableArea.width / 2,
        y: printableArea.y + printableArea.height / 2,
        scale: 1,
        rotation: 0,
      };

      onLayersChange([...layers, newLayer]);

      // Reset panel after successful upload
      setSelectedFile(null);
    } catch {
      setServerError("Error de red al subir el archivo. Por favor intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }, [selectedFile, layers, onLayersChange, printableArea]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const uploadLayers = layers.filter(
    (l): l is ImageLayer => l.type === "image" && l.source === "upload"
  );

  const hasError = Boolean(clientError || serverError);
  const errorMessage = clientError ?? serverError;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section
      style={{
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-6)",
      }}
      aria-label="Subir diseño PNG personalizado"
    >
      {/* Section heading */}
      <h2
        style={{
          color: "var(--color-text-primary)",
          fontSize: "0.875rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "var(--space-4)",
          marginTop: 0,
        }}
      >
        Tu diseño PNG
      </h2>

      {/* Drag-and-drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Zona de carga: arrastra un archivo PNG o haz clic para seleccionar"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        style={{
          border: `2px dashed ${
            isDragOver
              ? "var(--color-magenta)"
              : hasError
              ? "var(--color-error, #FF4500)"
              : "var(--color-cyan)"
          }`,
          borderRadius: "var(--radius-md)",
          padding: "var(--space-6)",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: isDragOver
            ? "rgba(255, 0, 144, 0.06)"
            : "transparent",
          transition: "all var(--transition-fast)",
          outline: "none",
        }}
      >
        <UploadIcon
          aria-hidden="true"
          style={{
            color: isDragOver ? "var(--color-magenta)" : "var(--color-cyan)",
            marginBottom: "var(--space-3)",
          }}
        />
        <p
          style={{
            color: "var(--color-text-primary)",
            fontSize: "0.875rem",
            fontWeight: 600,
            margin: "0 0 var(--space-1)",
          }}
        >
          Arrastra tu PNG aquí
        </p>
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "0.75rem",
            margin: 0,
          }}
        >
          o haz clic para seleccionar · Solo PNG · Máx.{" "}
          {formatBytes(UPLOAD_MAX_SIZE_BYTES)}
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,image/png"
        aria-label="Seleccionar archivo PNG"
        onChange={handleInputChange}
        style={{ display: "none" }}
      />

      {/* Error message */}
      {errorMessage && (
        <p
          role="alert"
          aria-live="assertive"
          style={{
            marginTop: "var(--space-3)",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(255, 77, 77, 0.1)",
            border: "1px solid rgba(255, 77, 77, 0.3)",
            color: "var(--color-error, #FF4500)",
            fontSize: "0.8125rem",
            lineHeight: 1.5,
            margin: "var(--space-3) 0 0",
          }}
        >
          {errorMessage}
        </p>
      )}

      {/* File preview (after valid selection, before upload) */}
      {selectedFile && !clientError && (
        <div
          style={{
            marginTop: "var(--space-4)",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <FileIcon aria-hidden="true" style={{ color: "var(--color-cyan)", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                color: "var(--color-text-primary)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={selectedFile.name}
            >
              {selectedFile.name}
            </p>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.75rem",
                margin: "var(--space-1) 0 0",
              }}
            >
              {formatBytes(selectedFile.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            aria-label="Quitar archivo seleccionado"
            style={{
              flexShrink: 0,
              width: 28,
              height: 28,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              backgroundColor: "transparent",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Upload button */}
      {selectedFile && !clientError && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          aria-busy={uploading}
          style={{
            marginTop: "var(--space-4)",
            width: "100%",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            border: "none",
            backgroundColor: uploading
              ? "rgba(0, 207, 255, 0.4)"
              : "var(--color-cyan)",
            color: uploading ? "rgba(255,255,255,0.6)" : "#000000",
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: uploading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-2)",
            transition: "all var(--transition-fast)",
          }}
        >
          {uploading ? (
            <>
              <SpinnerIcon aria-hidden="true" />
              Subiendo…
            </>
          ) : (
            "Agregar al diseño"
          )}
        </button>
      )}

      {/* List of uploaded layers */}
      {uploadLayers.length > 0 && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "var(--space-2)",
            }}
          >
            Imágenes subidas ({uploadLayers.length})
          </p>
          <ul
            role="list"
            aria-label="Capas de imagen subidas"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            {uploadLayers.map((layer) => (
              <UploadedLayerItem
                key={layer.assetId}
                layer={layer}
                onDelete={(assetId) => {
                  onLayersChange(
                    layers.filter(
                      (l) =>
                        !(
                          l.type === "image" &&
                          (l as ImageLayer).source === "upload" &&
                          (l as ImageLayer).assetId === assetId
                        )
                    )
                  );
                }}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// ─── UploadedLayerItem ────────────────────────────────────────────────────────

interface UploadedLayerItemProps {
  layer: ImageLayer;
  onDelete: (assetId: string) => void;
}

function UploadedLayerItem({ layer, onDelete }: UploadedLayerItemProps) {
  return (
    <li
      style={{
        backgroundColor: "var(--color-surface-elevated)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-2) var(--space-3)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
      }}
    >
      <FileIcon aria-hidden="true" style={{ color: "var(--color-magenta)", flexShrink: 0 }} />
      <span
        style={{
          flex: 1,
          fontSize: "0.8125rem",
          color: "var(--color-text-secondary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        Imagen subida
      </span>
      <button
        type="button"
        onClick={() => onDelete(layer.assetId)}
        aria-label="Eliminar imagen subida"
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border)",
          backgroundColor: "transparent",
          color: "var(--color-error, #FF4500)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TrashIcon aria-hidden="true" />
      </button>
    </li>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", margin: "0 auto", ...props.style }}
      {...props}
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function SpinnerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: "spin 1s linear infinite", ...props.style }}
      {...props}
    >
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}
