"use client";

/**
 * DesignLayerPanel — Panel for adding and managing catalog design layers.
 *
 * Responsibilities:
 * - Show a "Diseños del catálogo" section with a button to open DesignSelector.
 * - When a design is confirmed, create an ImageLayer centered in the printable
 *   area and add it to the layers array (Req 2.3, 3.3).
 * - List current catalog image layers with thumbnail, name, scale slider and
 *   delete button (Req 3.7, 3.8).
 */

import { useState, useCallback } from "react";
import Image from "next/image";
import type { Layer, ImageLayer, PrintableAreaBounds } from "@/lib/types/mockup";
import type { DesignItem } from "@/lib/types/design";
import DesignSelector from "@/components/designs/DesignSelector";
import { LAYER_SCALE_MIN, LAYER_SCALE_MAX } from "@/lib/constants";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DesignLayerPanelProps {
  layers: Layer[];
  onLayersChange: (layers: Layer[]) => void;
  printableArea: PrintableAreaBounds;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns only the catalog image layers from the full layers array. */
function getCatalogImageLayers(layers: Layer[]): ImageLayer[] {
  return layers.filter(
    (l): l is ImageLayer => l.type === "image" && l.source === "catalog"
  );
}

/** Returns the index of a layer in the full layers array by assetId. */
function findLayerIndex(layers: Layer[], assetId: string): number {
  return layers.findIndex(
    (l): l is ImageLayer =>
      l.type === "image" &&
      (l as ImageLayer).source === "catalog" &&
      (l as ImageLayer).assetId === assetId
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DesignLayerPanel({
  layers,
  onLayersChange,
  printableArea,
}: DesignLayerPanelProps) {
  const [selectorOpen, setSelectorOpen] = useState(false);

  // ── Add a design as a new ImageLayer ─────────────────────────────────────

  const handleDesignConfirm = useCallback(
    (design: DesignItem) => {
      const newLayer: ImageLayer = {
        id: crypto.randomUUID(),
        type: "image",
        source: "catalog",
        assetId: design.id,
        assetUrl: design.imageUrl ?? "",
        // Center of the printable area — editor uses originX/Y "center"
        x: printableArea.x + printableArea.width / 2,
        y: printableArea.y + printableArea.height / 2,
        // scale=1 means "fit to printable area" (the editor resolves the real px scale)
        scale: 1,
        rotation: 0,
      };

      onLayersChange([...layers, newLayer]);
      setSelectorOpen(false);
    },
    [layers, onLayersChange, printableArea]
  );

  // ── Update scale of an existing catalog layer ─────────────────────────────

  const handleScaleChange = useCallback(
    (assetId: string, newScale: number) => {
      const idx = findLayerIndex(layers, assetId);
      if (idx === -1) return;

      const updated = layers.map((l, i) =>
        i === idx ? { ...(l as ImageLayer), scale: newScale } : l
      );
      onLayersChange(updated);
    },
    [layers, onLayersChange]
  );

  // ── Remove a catalog layer ────────────────────────────────────────────────

  const handleDelete = useCallback(
    (assetId: string) => {
      const idx = findLayerIndex(layers, assetId);
      if (idx === -1) return;

      const updated = layers.filter((_, i) => i !== idx);
      onLayersChange(updated);
    },
    [layers, onLayersChange]
  );

  // ── Derived ───────────────────────────────────────────────────────────────

  const catalogLayers = getCatalogImageLayers(layers);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section
      style={{
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-6)",
      }}
      aria-label="Diseños del catálogo"
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
        Diseños del catálogo
      </h2>

      {/* Open / close selector button */}
      <button
        type="button"
        onClick={() => setSelectorOpen((prev) => !prev)}
        aria-expanded={selectorOpen}
        aria-controls="design-selector-panel"
        style={{
          width: "100%",
          padding: "var(--space-3) var(--space-4)",
          borderRadius: "var(--radius-md)",
          border: "1px dashed var(--color-cyan)",
          backgroundColor: selectorOpen
            ? "rgba(0, 207, 255, 0.08)"
            : "transparent",
          color: "var(--color-cyan)",
          fontSize: "0.875rem",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-2)",
          transition: "background-color var(--transition-fast)",
        }}
      >
        <PlusIcon aria-hidden="true" />
        {selectorOpen ? "Cerrar catálogo" : "Agregar diseño del catálogo"}
      </button>

      {/* Inline design selector */}
      {selectorOpen && (
        <div
          id="design-selector-panel"
          style={{ marginTop: "var(--space-4)" }}
        >
          <DesignSelector onConfirm={handleDesignConfirm} />
        </div>
      )}

      {/* List of current catalog layers */}
      {catalogLayers.length > 0 && (
        <ul
          role="list"
          aria-label="Capas de diseño agregadas"
          style={{
            listStyle: "none",
            margin: "var(--space-4) 0 0",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          {catalogLayers.map((layer) => (
            <DesignLayerItem
              key={layer.assetId}
              layer={layer}
              onScaleChange={handleScaleChange}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── DesignLayerItem ──────────────────────────────────────────────────────────

interface DesignLayerItemProps {
  layer: ImageLayer;
  onScaleChange: (assetId: string, scale: number) => void;
  onDelete: (assetId: string) => void;
}

function DesignLayerItem({
  layer,
  onScaleChange,
  onDelete,
}: DesignLayerItemProps) {
  const scalePercent = Math.round(layer.scale * 100);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = Number(e.target.value);
    onScaleChange(layer.assetId, percent / 100);
  };

  return (
    <li
      style={{
        backgroundColor: "var(--color-surface-elevated)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-3)",
      }}
    >
      {/* Top row: thumbnail + name + delete */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          marginBottom: "var(--space-3)",
        }}
      >
        {/* Thumbnail */}
        <div
          style={{
            position: "relative",
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
            backgroundColor: "var(--color-surface)",
          }}
        >
          {layer.assetUrl ? (
            <Image
              src={layer.assetUrl}
              alt=""
              fill
              sizes="40px"
              style={{ objectFit: "contain", padding: 2 }}
            />
          ) : (
            <PlaceholderThumbnail />
          )}
        </div>

        {/* Layer name (assetId as fallback) */}
        <span
          style={{
            flex: 1,
            fontSize: "0.8125rem",
            color: "var(--color-text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={layer.assetId}
        >
          Diseño del catálogo
        </span>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => onDelete(layer.assetId)}
          aria-label="Eliminar capa de diseño"
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
            transition: "background-color var(--transition-fast)",
          }}
        >
          <TrashIcon aria-hidden="true" />
        </button>
      </div>

      {/* Scale slider row */}
      <div>
        <label
          htmlFor={`scale-${layer.assetId}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            marginBottom: "var(--space-2)",
          }}
        >
          <span>Escala</span>
          <span
            aria-live="polite"
            style={{ color: "var(--color-text-primary)", fontWeight: 600 }}
          >
            {scalePercent}%
          </span>
        </label>
        <input
          id={`scale-${layer.assetId}`}
          type="range"
          min={Math.round(LAYER_SCALE_MIN * 100)}
          max={Math.round(LAYER_SCALE_MAX * 100)}
          step={5}
          value={scalePercent}
          onChange={handleSliderChange}
          aria-label={`Escala del diseño: ${scalePercent}%`}
          aria-valuemin={Math.round(LAYER_SCALE_MIN * 100)}
          aria-valuemax={Math.round(LAYER_SCALE_MAX * 100)}
          aria-valuenow={scalePercent}
          style={{ width: "100%", accentColor: "var(--color-cyan)" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.6875rem",
            color: "var(--color-text-secondary)",
            marginTop: "var(--space-1)",
          }}
          aria-hidden="true"
        >
          <span>{Math.round(LAYER_SCALE_MIN * 100)}%</span>
          <span>{Math.round(LAYER_SCALE_MAX * 100)}%</span>
        </div>
      </div>
    </li>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
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
      {...props}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

function PlaceholderThumbnail() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-border)",
      }}
      aria-hidden="true"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}
