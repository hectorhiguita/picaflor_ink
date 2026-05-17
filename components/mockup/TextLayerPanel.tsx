"use client";

/**
 * TextLayerPanel — Panel for adding and managing text layers in the mockup.
 *
 * Responsibilities:
 * - Text input field for the text content (Req 3.10).
 * - Font family selector with 8 fonts loaded via Google Fonts CSS import (Req 3.11).
 * - Color picker for text color (Req 3.12).
 * - Font size slider (12–120px, step 2).
 * - Scale slider (10%–200%, step 5%) — same range as image layers (Req 3.13).
 * - "Agregar texto" button that creates a TextLayer centered in the printable area.
 * - List of current text layers with preview, font name, color swatch, edit and delete.
 *
 * Requirements: 3.10, 3.11, 3.12, 3.13
 */

import { useState, useCallback, useId } from "react";
import type { Layer, TextLayer, PrintableAreaBounds } from "@/lib/types/mockup";
import { LAYER_SCALE_MIN, LAYER_SCALE_MAX } from "@/lib/constants";

// ─── Google Fonts (8 fonts, loaded via CSS @import) ───────────────────────────

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Roboto:wght@400;700&family=Playfair+Display:wght@400;700&family=Pacifico&family=Oswald:wght@400;700&family=Raleway:wght@400;700&family=Dancing+Script:wght@400;700&family=Bebas+Neue&display=swap";

// ─── Available fonts ──────────────────────────────────────────────────────────

const AVAILABLE_FONTS: { label: string; value: string }[] = [
  { label: "Montserrat", value: "Montserrat" },
  { label: "Roboto", value: "Roboto" },
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "Pacifico", value: "Pacifico" },
  { label: "Oswald", value: "Oswald" },
  { label: "Raleway", value: "Raleway" },
  { label: "Dancing Script", value: "Dancing Script" },
  { label: "Bebas Neue", value: "Bebas Neue" },
];

// ─── Default values ───────────────────────────────────────────────────────────

const DEFAULT_FONT = "Montserrat";
const DEFAULT_COLOR = "#FFB300";
const DEFAULT_FONT_SIZE = 24;
const DEFAULT_SCALE = 1;

// ─── Props ────────────────────────────────────────────────────────────────────

interface TextLayerPanelProps {
  layers: Layer[];
  onLayersChange: (layers: Layer[]) => void;
  printableArea: PrintableAreaBounds;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TextLayerPanel({
  layers,
  onLayersChange,
  printableArea,
}: TextLayerPanelProps) {
  const uid = useId();

  // ── Form state ────────────────────────────────────────────────────────────
  const [text, setText] = useState("");
  const [fontFamily, setFontFamily] = useState(DEFAULT_FONT);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [scale, setScale] = useState(DEFAULT_SCALE);

  // ── Edit state (null = not editing) ──────────────────────────────────────
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // ── Derived ───────────────────────────────────────────────────────────────
  const textLayers = layers
    .map((l, i) => ({ layer: l, index: i }))
    .filter((item): item is { layer: TextLayer; index: number } => item.layer.type === "text");

  // ── Add text layer ────────────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newLayer: TextLayer = {
      id: crypto.randomUUID(),
      type: "text",
      text: trimmed,
      fontFamily,
      color,
      fontSize,
      scale,
      x: printableArea.x + printableArea.width / 2,
      y: printableArea.y + printableArea.height / 2,
    };

    onLayersChange([...layers, newLayer]);
    setText("");
  }, [text, fontFamily, color, fontSize, scale, layers, onLayersChange, printableArea]);

  // ── Delete text layer ─────────────────────────────────────────────────────
  const handleDelete = useCallback(
    (index: number) => {
      onLayersChange(layers.filter((_, i) => i !== index));
      if (editingIndex === index) setEditingIndex(null);
    },
    [layers, onLayersChange, editingIndex]
  );

  // ── Start editing ─────────────────────────────────────────────────────────
  const handleStartEdit = useCallback(
    (index: number) => {
      const layer = layers[index] as TextLayer;
      setEditingIndex(index);
      setEditText(layer.text);
    },
    [layers]
  );

  // ── Confirm edit ──────────────────────────────────────────────────────────
  const handleConfirmEdit = useCallback(() => {
    if (editingIndex === null) return;
    const trimmed = editText.trim();
    if (!trimmed) return;

    const updated = layers.map((l, i) => {
      if (i !== editingIndex) return l;
      return { ...(l as TextLayer), text: trimmed } satisfies TextLayer;
    });

    onLayersChange(updated);
    setEditingIndex(null);
    setEditText("");
  }, [editingIndex, editText, layers, onLayersChange]);

  // ── Cancel edit ───────────────────────────────────────────────────────────
  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
    setEditText("");
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section
      style={{
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-6)",
      }}
      aria-label="Agregar texto personalizado"
    >
      {/* Load Google Fonts */}
      <style>{`@import url('${GOOGLE_FONTS_URL}');`}</style>

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
        Texto personalizado
      </h2>

      {/* ── Text input ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          htmlFor={`${uid}-text`}
          style={{
            display: "block",
            color: "var(--color-text-secondary)",
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "var(--space-2)",
          }}
        >
          Texto
        </label>
        <input
          id={`${uid}-text`}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe tu texto aquí…"
          maxLength={200}
          style={{
            width: "100%",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface-elevated)",
            color: "var(--color-text-primary)",
            fontSize: "0.875rem",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: fontFamily,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
      </div>

      {/* ── Font family selector ────────────────────────────────────────── */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          htmlFor={`${uid}-font`}
          style={{
            display: "block",
            color: "var(--color-text-secondary)",
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "var(--space-2)",
          }}
        >
          Fuente
        </label>
        <select
          id={`${uid}-font`}
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          style={{
            width: "100%",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface-elevated)",
            color: "var(--color-text-primary)",
            fontSize: "0.875rem",
            cursor: "pointer",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: fontFamily,
          }}
        >
          {AVAILABLE_FONTS.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Color + Font size row ───────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-4)",
          marginBottom: "var(--space-4)",
        }}
      >
        {/* Color picker */}
        <div>
          <label
            htmlFor={`${uid}-color`}
            style={{
              display: "block",
              color: "var(--color-text-secondary)",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "var(--space-2)",
            }}
          >
            Color
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface-elevated)",
            }}
          >
            <input
              id={`${uid}-color`}
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label="Selector de color del texto"
              style={{
                width: 28,
                height: 28,
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                padding: 0,
                backgroundColor: "transparent",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.75rem",
                fontFamily: "monospace",
              }}
            >
              {color.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Font size */}
        <div>
          <label
            htmlFor={`${uid}-fontsize`}
            style={{
              display: "block",
              color: "var(--color-text-secondary)",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "var(--space-2)",
            }}
          >
            Tamaño: {fontSize}px
          </label>
          <input
            id={`${uid}-fontsize`}
            type="range"
            min={12}
            max={120}
            step={2}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            aria-label={`Tamaño de fuente: ${fontSize} píxeles`}
            style={{ width: "100%", cursor: "pointer", accentColor: "var(--color-cyan)" }}
          />
        </div>
      </div>

      {/* ── Scale slider ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <label
          htmlFor={`${uid}-scale`}
          style={{
            display: "block",
            color: "var(--color-text-secondary)",
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "var(--space-2)",
          }}
        >
          Escala: {Math.round(scale * 100)}%
        </label>
        <input
          id={`${uid}-scale`}
          type="range"
          min={LAYER_SCALE_MIN}
          max={LAYER_SCALE_MAX}
          step={0.05}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          aria-label={`Escala del texto: ${Math.round(scale * 100)} por ciento`}
          style={{ width: "100%", cursor: "pointer", accentColor: "var(--color-magenta)" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "var(--color-text-secondary)",
            fontSize: "0.6875rem",
            marginTop: "var(--space-1)",
          }}
        >
          <span>{Math.round(LAYER_SCALE_MIN * 100)}%</span>
          <span>{Math.round(LAYER_SCALE_MAX * 100)}%</span>
        </div>
      </div>

      {/* ── Font preview ────────────────────────────────────────────────── */}
      {text.trim() && (
        <div
          aria-label="Vista previa del texto"
          style={{
            marginBottom: "var(--space-4)",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface-elevated)",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontFamily: fontFamily,
              fontSize: Math.min(fontSize, 36),
              color: color,
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </span>
        </div>
      )}

      {/* ── Add button ──────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!text.trim()}
        aria-disabled={!text.trim()}
        style={{
          width: "100%",
          padding: "var(--space-3) var(--space-4)",
          borderRadius: "var(--radius-md)",
          border: "none",
          backgroundColor: text.trim() ? "var(--color-yellow)" : "rgba(255, 214, 0, 0.3)",
          color: text.trim() ? "#000000" : "rgba(0,0,0,0.4)",
          fontSize: "0.875rem",
          fontWeight: 700,
          cursor: text.trim() ? "pointer" : "not-allowed",
          transition: "all var(--transition-fast)",
          letterSpacing: "0.04em",
        }}
      >
        Agregar texto
      </button>

      {/* ── Text layers list ─────────────────────────────────────────────── */}
      {textLayers.length > 0 && (
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
            Textos agregados ({textLayers.length})
          </p>
          <ul
            role="list"
            aria-label="Capas de texto"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            {textLayers.map(({ layer, index }) => (
              <TextLayerItem
                key={index}
                layer={layer}
                index={index}
                isEditing={editingIndex === index}
                editText={editText}
                onEditTextChange={setEditText}
                onStartEdit={handleStartEdit}
                onConfirmEdit={handleConfirmEdit}
                onCancelEdit={handleCancelEdit}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// ─── TextLayerItem ────────────────────────────────────────────────────────────

interface TextLayerItemProps {
  layer: TextLayer;
  index: number;
  isEditing: boolean;
  editText: string;
  onEditTextChange: (value: string) => void;
  onStartEdit: (index: number) => void;
  onConfirmEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (index: number) => void;
}

function TextLayerItem({
  layer,
  index,
  isEditing,
  editText,
  onEditTextChange,
  onStartEdit,
  onConfirmEdit,
  onCancelEdit,
  onDelete,
}: TextLayerItemProps) {
  const truncated =
    layer.text.length > 28 ? layer.text.slice(0, 28) + "…" : layer.text;

  return (
    <li
      style={{
        backgroundColor: "var(--color-surface-elevated)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      {isEditing ? (
        /* ── Edit mode ─────────────────────────────────────────────────── */
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <input
            type="text"
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            autoFocus
            maxLength={200}
            aria-label="Editar texto de la capa"
            style={{
              width: "100%",
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-cyan)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              fontSize: "0.875rem",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: layer.fontFamily,
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onConfirmEdit();
              if (e.key === "Escape") onCancelEdit();
            }}
          />
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              type="button"
              onClick={onConfirmEdit}
              disabled={!editText.trim()}
              style={{
                flex: 1,
                padding: "var(--space-2)",
                borderRadius: "var(--radius-sm)",
                border: "none",
                backgroundColor: editText.trim()
                  ? "var(--color-cyan)"
                  : "rgba(0, 207, 255, 0.3)",
                color: editText.trim() ? "#000000" : "rgba(0,0,0,0.4)",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: editText.trim() ? "pointer" : "not-allowed",
              }}
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              style={{
                flex: 1,
                padding: "var(--space-2)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                backgroundColor: "transparent",
                color: "var(--color-text-secondary)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        /* ── View mode ─────────────────────────────────────────────────── */
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          {/* Color swatch */}
          <span
            aria-label={`Color: ${layer.color}`}
            style={{
              flexShrink: 0,
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: layer.color,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />

          {/* Text preview + font name */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                color: "var(--color-text-primary)",
                fontSize: "0.875rem",
                fontFamily: layer.fontFamily,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={layer.text}
            >
              {truncated}
            </p>
            <p
              style={{
                margin: "2px 0 0",
                color: "var(--color-text-secondary)",
                fontSize: "0.6875rem",
              }}
            >
              {layer.fontFamily} · {layer.fontSize}px
            </p>
          </div>

          {/* Edit button */}
          <button
            type="button"
            onClick={() => onStartEdit(index)}
            aria-label={`Editar texto: ${layer.text}`}
            style={{
              flexShrink: 0,
              width: 28,
              height: 28,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              backgroundColor: "transparent",
              color: "var(--color-cyan)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PencilIcon aria-hidden="true" />
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => onDelete(index)}
            aria-label={`Eliminar texto: ${layer.text}`}
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
        </div>
      )}
    </li>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
