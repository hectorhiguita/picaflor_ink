"use client";

/**
 * LayerStackPanel — Shows all canvas layers (images + text) as a stacked list.
 *
 * Allows the user to:
 * - See all layers and their types.
 * - Click a layer entry to select it on the canvas.
 * - Move a layer up or down in z-order.
 * - Delete a layer.
 *
 * The "mockup" base layer (the product image) is shown as a locked bottom entry
 * so the user understands the layer model.
 */

import type { Layer } from "@/lib/types/mockup";

interface LayerStackPanelProps {
  layers: Layer[];
  onLayersChange: (layers: Layer[]) => void;
  onSelectLayer: (id: string) => void;
  activeLayers?: string | null;
}

export default function LayerStackPanel({
  layers,
  onLayersChange,
  onSelectLayer,
  activeLayers: activeLayerId,
}: LayerStackPanelProps) {
  // Reverse so the topmost layer is shown first (z-order convention).
  const reversed = [...layers].reverse();

  const handleMoveUp = (id: string) => {
    const idx = layers.findIndex((l) => l.id === id);
    if (idx >= layers.length - 1) return;
    const next = [...layers];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onLayersChange(next);
  };

  const handleMoveDown = (id: string) => {
    const idx = layers.findIndex((l) => l.id === id);
    if (idx <= 0) return;
    const next = [...layers];
    [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
    onLayersChange(next);
  };

  const handleDelete = (id: string) => {
    onLayersChange(layers.filter((l) => l.id !== id));
  };

  if (layers.length === 0) {
    return (
      <section
        style={{
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
          padding: "var(--space-6)",
        }}
      >
        <SectionHeading>Capas</SectionHeading>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem", margin: 0 }}>
          Agrega un diseño, imagen o texto para comenzar.
        </p>
      </section>
    );
  }

  return (
    <section
      style={{
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-6)",
      }}
      aria-label="Capas del diseño"
    >
      <SectionHeading>Capas ({layers.length})</SectionHeading>

      <ol
        role="list"
        style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}
      >
        {reversed.map((layer, revIdx) => {
          const origIdx = layers.length - 1 - revIdx;
          const isActive = activeLayerId === layer.id;
          const isTop = origIdx === layers.length - 1;
          const isBottom = origIdx === 0;

          return (
            <li
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-md)",
                border: isActive
                  ? "1px solid var(--color-cyan)"
                  : "1px solid var(--color-border)",
                backgroundColor: isActive
                  ? "rgba(0, 200, 255, 0.08)"
                  : "var(--color-surface-elevated)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                userSelect: "none",
              }}
            >
              {/* Type icon */}
              <span
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: layer.type === "image"
                    ? "rgba(100, 220, 20, 0.12)"
                    : "rgba(255, 179, 0, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: layer.type === "image"
                    ? "var(--color-green)"
                    : "var(--color-yellow)",
                }}
              >
                {layer.type === "image" ? <ImageIcon /> : <TextIcon />}
              </span>

              {/* Label */}
              <span
                style={{
                  flex: 1,
                  fontSize: "0.8125rem",
                  color: "var(--color-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {layer.type === "image"
                  ? (layer.source === "catalog" ? "Diseño del catálogo" : "Imagen subida")
                  : layer.text}
              </span>

              {/* Controls */}
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <IconButton
                  label="Subir capa"
                  disabled={isTop}
                  onClick={(e) => { e.stopPropagation(); handleMoveUp(layer.id); }}
                >
                  <ArrowUpIcon />
                </IconButton>
                <IconButton
                  label="Bajar capa"
                  disabled={isBottom}
                  onClick={(e) => { e.stopPropagation(); handleMoveDown(layer.id); }}
                >
                  <ArrowDownIcon />
                </IconButton>
                <IconButton
                  label="Eliminar capa"
                  danger
                  onClick={(e) => { e.stopPropagation(); handleDelete(layer.id); }}
                >
                  <TrashIcon />
                </IconButton>
              </div>
            </li>
          );
        })}

        {/* Mockup — locked base layer */}
        <li
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            padding: "var(--space-2) var(--space-3)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            opacity: 0.6,
          }}
        >
          <span
            style={{
              flexShrink: 0,
              width: 28,
              height: 28,
              borderRadius: "var(--radius-sm)",
              backgroundColor: "rgba(0, 200, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-cyan)",
            }}
          >
            <ProductIcon />
          </span>
          <span style={{ flex: 1, fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
            Producto (base)
          </span>
          <span style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>
            Bloqueado
          </span>
        </li>
      </ol>
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </h2>
  );
}

interface IconButtonProps {
  label: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

function IconButton({ label, disabled, danger, onClick, children }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: 26,
        height: 26,
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--color-border)",
        backgroundColor: "transparent",
        color: disabled
          ? "var(--color-border)"
          : danger
          ? "var(--color-error, #FF4500)"
          : "var(--color-text-secondary)",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        transition: "color var(--transition-fast)",
      }}
    >
      {children}
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ImageIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}

function TextIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7"/>
      <line x1="9" y1="20" x2="15" y2="20"/>
      <line x1="12" y1="4" x2="12" y2="20"/>
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}
