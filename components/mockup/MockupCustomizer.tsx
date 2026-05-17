"use client";

/**
 * MockupCustomizer — Main interactive customizer UI.
 *
 * Responsibilities:
 * - Show product name and category.
 * - Render VariantSelector for color/size selection (Req 3.1, 3.2).
 * - Render position selector tabs for available print positions (Req 3.9).
 * - Render MockupEditorLoader with the selected variant's mockup image and
 *   the selected position's printable area bounds.
 * - Variant changes update the mockup image via React state — no network call,
 *   so the update is well under 500ms (Req 3.2).
 * - Maintain a layers array (empty initially; populated in Tasks 12–14).
 * - "Agregar al carrito" is enabled when there is at least one layer (Task 15).
 * - On confirm: capture canvas PNG, serialize customization, POST to
 *   /api/mockups/preview, then call onAddToCart (Req 3.14, 4.1).
 */

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ProductDetail, VariantSummary, PrintableAreaItem } from "@/lib/types/product";
import type { Layer, PrintableAreaBounds, CustomizationJson } from "@/lib/types/mockup";
import type { MockupEditorHandle } from "@/components/mockup/MockupEditorLoader";
import { serializeCustomization } from "@/lib/customization-serialization";
import { useCartStore } from "@/lib/cart-store";
import VariantSelector from "@/components/product/VariantSelector";
import MockupEditorLoader from "@/components/mockup/MockupEditorLoader";
import DesignLayerPanel from "@/components/mockup/DesignLayerPanel";
import UploadLayerPanel from "@/components/mockup/UploadLayerPanel";
import TextLayerPanel from "@/components/mockup/TextLayerPanel";
import LayerStackPanel from "@/components/mockup/LayerStackPanel";

// ─── Print position labels ────────────────────────────────────────────────────

const POSITION_LABELS: Record<string, string> = {
  FRONT_CHEST: "Pecho frontal",
  BACK: "Espalda",
  SLEEVE: "Manga",
  MUG_FRONT: "Frente del mug",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface MockupCustomizerProps {
  product: ProductDetail;
  /** Optional variant ID to pre-select (from ?variant= search param). */
  initialVariantId?: string;
  /**
   * Called after the preview has been generated and is ready to be added to
   * the cart. Receives the variant ID, the preview URL returned by the API,
   * and the full customizationJson (Req 3.14, 4.1).
   */
  onAddToCart?: (data: {
    variantId: string;
    previewUrl: string;
    customizationJson: CustomizationJson;
  }) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the first available (non-UNAVAILABLE) variant, or the very first
 * variant if all are unavailable.
 */
function resolveInitialVariant(
  variants: VariantSummary[],
  initialVariantId?: string
): VariantSummary | null {
  if (!variants.length) return null;

  if (initialVariantId) {
    const found = variants.find((v) => v.id === initialVariantId);
    if (found) return found;
  }

  return (
    variants.find((v) => v.stockStatus !== "UNAVAILABLE") ?? variants[0]
  );
}

/**
 * Converts a PrintableAreaItem to the PrintableAreaBounds shape expected by
 * MockupEditor.
 */
function toPrintableAreaBounds(area: PrintableAreaItem): PrintableAreaBounds {
  return {
    x: area.x,
    y: area.y,
    width: area.width,
    height: area.height,
    rotation: area.rotation,
  };
}

/**
 * Fallback printable area when no areas are defined for the product.
 * Centered 300×300 region on a 600×600 canvas.
 */
const FALLBACK_PRINTABLE_AREA: PrintableAreaBounds = {
  x: 150,
  y: 150,
  width: 300,
  height: 300,
  rotation: 0,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MockupCustomizer({
  product,
  initialVariantId,
  onAddToCart,
}: MockupCustomizerProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  // ── Variant state ─────────────────────────────────────────────────────────
  const [selectedVariant, setSelectedVariant] = useState<VariantSummary | null>(
    () => resolveInitialVariant(product.variants, initialVariantId)
  );

  // ── Position state ────────────────────────────────────────────────────────
  const [selectedPosition, setSelectedPosition] = useState<string>(
    () => product.printableAreas[0]?.position ?? "FRONT_CHEST"
  );

  // ── Layers state (empty until Tasks 12–14) ────────────────────────────────
  const [layers, setLayers] = useState<Layer[]>([]);

  // ── Active layer selection (for LayerStackPanel highlight) ───────────────
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);

  // ── Loading state for preview generation ─────────────────────────────────
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);

  // ── Ref to the editor so we can call getPreviewDataUrl() ─────────────────
  const editorRef = useRef<MockupEditorHandle>(null);

  // ── Derived values ────────────────────────────────────────────────────────

  // The mockup image URL comes directly from the selected variant — pure state
  // read, no network call, so variant changes are always < 500ms (Req 3.2).
  const mockupImageUrl = selectedVariant?.mockupImageUrl ?? null;

  // Only show positions that exist in the product's printable areas.
  const availablePositions = product.printableAreas.map((a) => a.position);

  // Resolve the printable area bounds for the currently selected position.
  const printableArea: PrintableAreaBounds = (() => {
    const area = product.printableAreas.find(
      (a) => a.position === selectedPosition
    );
    return area ? toPrintableAreaBounds(area) : FALLBACK_PRINTABLE_AREA;
  })();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleVariantChange = useCallback((variant: VariantSummary) => {
    setSelectedVariant(variant);
  }, []);

  const handlePositionChange = useCallback((position: string) => {
    setSelectedPosition(position);
  }, []);

  const handleLayersChange = useCallback((updatedLayers: Layer[]) => {
    setLayers(updatedLayers);
  }, []);

  const handleLayerSelect = useCallback((id: string | null) => {
    setActiveLayerId(id);
  }, []);

  // ── Add to cart handler ───────────────────────────────────────────────────

  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant || layers.length === 0 || isAddingToCart) return;

    setIsAddingToCart(true);
    setAddToCartError(null);

    try {
      // 1. Capture the canvas as a PNG data URL.
      const previewDataUrl = editorRef.current?.getPreviewDataUrl() ?? "";

      // 2. Serialize the customization.
      const customizationJson = serializeCustomization({
        productId: product.id,
        variantId: selectedVariant.id,
        position: selectedPosition,
        layers,
      });

      // 3. POST to the preview API to get a stable preview URL + asset ID.
      const response = await fetch("/api/mockups/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previewDataUrl, customizationJson }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errorData.error ?? "Error al generar la previsualización");
      }

      const { previewUrl } = (await response.json()) as { previewUrl: string; assetId: string };

      if (onAddToCart) {
        onAddToCart({
          variantId: selectedVariant.id,
          previewUrl,
          customizationJson,
        });
      } else {
        await addItem({
          productId: product.id,
          variantId: selectedVariant.id,
          quantity: 1,
          unitPriceCop: selectedVariant.effectivePriceCop,
          previewUrl,
          customizationJson,
        });
        router.push("/carrito");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error inesperado al agregar al carrito";
      setAddToCartError(message);
    } finally {
      setIsAddingToCart(false);
    }
  }, [
    selectedVariant,
    layers,
    isAddingToCart,
    product.id,
    addItem,
    router,
    selectedPosition,
    onAddToCart,
  ]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 var(--space-4)",
      }}
    >
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <header style={{ marginBottom: "var(--space-8)" }}>
        <p
          style={{
            color: "var(--color-cyan)",
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "var(--space-2)",
          }}
        >
          {product.category.name}
        </p>
        <h1
          style={{
            color: "var(--color-text-primary)",
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
            fontWeight: 700,
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          Personalizar {product.name}
        </h1>
      </header>

      {/* ── Two-column layout: canvas left, controls right ────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 420px)",
          gap: "var(--space-8)",
          alignItems: "start",
        }}
        className="customizer-grid"
      >
        {/* ── Canvas column ──────────────────────────────────────────────── */}
        <section aria-label="Vista previa del producto">
          {/* Position selector tabs */}
          {availablePositions.length > 1 && (
            <div
              role="tablist"
              aria-label="Posición de impresión"
              style={{
                display: "flex",
                gap: "var(--space-2)",
                marginBottom: "var(--space-4)",
                flexWrap: "wrap",
              }}
            >
              {availablePositions.map((position) => {
                const isActive = position === selectedPosition;
                return (
                  <button
                    key={position}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => handlePositionChange(position)}
                    style={{
                      padding: "var(--space-2) var(--space-4)",
                      borderRadius: "var(--radius-md)",
                      border: isActive
                        ? "1px solid var(--color-cyan)"
                        : "1px solid var(--color-border)",
                      backgroundColor: isActive
                        ? "rgba(0, 207, 255, 0.12)"
                        : "var(--color-surface-elevated)",
                      color: isActive
                        ? "var(--color-cyan)"
                        : "var(--color-text-secondary)",
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 600 : 400,
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    {POSITION_LABELS[position] ?? position}
                  </button>
                );
              })}
            </div>
          )}

          {/* Single position label (no tabs needed) */}
          {availablePositions.length === 1 && (
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "var(--space-3)",
              }}
            >
              Posición:{" "}
              <span style={{ color: "var(--color-cyan)" }}>
                {POSITION_LABELS[selectedPosition] ?? selectedPosition}
              </span>
            </p>
          )}

          {/* Mockup editor canvas */}
          <div
            style={{
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <MockupEditorLoader
              ref={editorRef}
              mockupImageUrl={mockupImageUrl}
              printableArea={printableArea}
              layers={layers}
              onLayersChange={handleLayersChange}
              onLayerSelect={handleLayerSelect}
            />
          </div>

          {/* Printable area hint */}
          <p
            style={{
              marginTop: "var(--space-3)",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                border: "2px dashed var(--color-cyan)",
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            El área punteada indica la zona imprimible.
          </p>
        </section>

        {/* ── Controls column ────────────────────────────────────────────── */}
        <aside
          aria-label="Opciones de personalización"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-6)",
          }}
        >
          {/* Variant selector */}
          <section
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              padding: "var(--space-6)",
            }}
          >
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
              Color y talla
            </h2>

            {product.variants.length > 0 ? (
              <VariantSelector
                variants={product.variants}
                selectedVariantId={selectedVariant?.id ?? null}
                onVariantChange={handleVariantChange}
              />
            ) : (
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.875rem",
                }}
              >
                Este producto no tiene variantes disponibles.
              </p>
            )}
          </section>

          {/* Layer stack — shows all layers, allows reorder + delete */}
          <LayerStackPanel
            layers={layers}
            onLayersChange={handleLayersChange}
            activeLayers={activeLayerId}
            onSelectLayer={(id) => {
              setActiveLayerId(id);
              editorRef.current?.selectLayer(id);
            }}
          />

          {/* Design layer panel — catalog designs (Task 12) */}
          <DesignLayerPanel
            layers={layers}
            onLayersChange={handleLayersChange}
            printableArea={printableArea}
          />

          {/* Upload layer panel — custom PNG upload (Task 13) */}
          <UploadLayerPanel
            layers={layers}
            onLayersChange={handleLayersChange}
            printableArea={printableArea}
          />

          {/* Text layer panel — custom text (Task 14) */}
          <TextLayerPanel
            layers={layers}
            onLayersChange={handleLayersChange}
            printableArea={printableArea}
          />

          {/* Selected variant price */}
          {selectedVariant && (
            <div
              style={{
                backgroundColor: "var(--color-surface-elevated)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                padding: "var(--space-4) var(--space-6)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.875rem",
                }}
              >
                Precio
              </span>
              <span
                style={{
                  color: "var(--color-text-primary)",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                }}
              >
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                }).format(selectedVariant.effectivePriceCop)}
              </span>
            </div>
          )}

          {/* Add to cart button — enabled when at least one layer exists (Req 3.14, 4.1) */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={layers.length === 0 || isAddingToCart || !selectedVariant}
            aria-disabled={layers.length === 0 || isAddingToCart || !selectedVariant}
            aria-label={
              layers.length === 0
                ? "Agregar al carrito (agrega un diseño primero)"
                : isAddingToCart
                ? "Generando previsualización…"
                : "Agregar al carrito"
            }
            style={{
              width: "100%",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-md)",
              border: "none",
              backgroundColor: "var(--color-magenta)",
              color: "#ffffff",
              fontSize: "1rem",
              fontWeight: 700,
              cursor:
                layers.length === 0 || isAddingToCart || !selectedVariant
                  ? "not-allowed"
                  : "pointer",
              opacity:
                layers.length === 0 || isAddingToCart || !selectedVariant
                  ? 0.45
                  : 1,
              transition: "opacity var(--transition-fast)",
              letterSpacing: "0.04em",
            }}
          >
            {isAddingToCart ? "Generando previsualización…" : "Agregar al carrito"}
          </button>

          {/* Error message when add-to-cart fails */}
          {addToCartError && (
            <p
              role="alert"
              style={{
                color: "var(--color-error, #FF4500)",
                fontSize: "0.875rem",
                marginTop: "calc(var(--space-2) * -1)",
              }}
            >
              {addToCartError}
            </p>
          )}

          {/* Product info */}
          <section
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              padding: "var(--space-6)",
            }}
          >
            <h2
              style={{
                color: "var(--color-text-primary)",
                fontSize: "0.875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "var(--space-3)",
                marginTop: 0,
              }}
            >
              Detalles del producto
            </h2>

            {product.description && (
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  marginBottom: "var(--space-3)",
                  marginTop: 0,
                }}
              >
                {product.description}
              </p>
            )}

            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "var(--space-2) var(--space-4)",
                fontSize: "0.8125rem",
                margin: 0,
              }}
            >
              <dt style={{ color: "var(--color-text-secondary)" }}>Técnica</dt>
              <dd style={{ color: "var(--color-text-primary)", margin: 0 }}>
                {product.printTechnique}
              </dd>

              <dt style={{ color: "var(--color-text-secondary)" }}>Categoría</dt>
              <dd style={{ color: "var(--color-text-primary)", margin: 0 }}>
                {product.category.name}
              </dd>
            </dl>
          </section>
        </aside>
      </div>

      {/* ── Responsive styles ─────────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .customizer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
