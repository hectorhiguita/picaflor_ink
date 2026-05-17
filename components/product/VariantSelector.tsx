"use client";

import type { VariantSummary } from "@/lib/types/product";

interface VariantSelectorProps {
  variants: VariantSummary[];
  selectedVariantId: string | null;
  onVariantChange: (variant: VariantSummary) => void;
}

/**
 * Variant selector with color swatches and size buttons.
 * - Color row: clicking a color selects the first available variant of that color.
 * - Size row: clicking a size selects the variant matching current color + that size.
 * - UNAVAILABLE variants are disabled with strikethrough.
 * - LIMITED variants show "Últimas unidades" badge.
 * Meets Req 1.2, 3.1, 3.2.
 */
export default function VariantSelector({
  variants,
  selectedVariantId,
  onVariantChange,
}: VariantSelectorProps) {
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;
  const selectedColor = selectedVariant?.colorName ?? null;
  const selectedSize = selectedVariant?.size ?? null;

  // Derive unique colors (preserving first-seen order)
  const uniqueColors = Array.from(
    new Map(variants.map((v) => [v.colorName, v])).values()
  );

  // Derive unique sizes for the currently selected color
  const sizesForColor = selectedColor
    ? variants.filter((v) => v.colorName === selectedColor)
    : variants;

  const uniqueSizes = Array.from(new Set(sizesForColor.map((v) => v.size)));

  function handleColorClick(colorName: string) {
    // Pick the first available (non-UNAVAILABLE) variant of that color,
    // keeping the current size if possible.
    const sameColorVariants = variants.filter((v) => v.colorName === colorName);
    const keepSize = sameColorVariants.find(
      (v) => v.size === selectedSize && v.stockStatus !== "UNAVAILABLE"
    );
    const firstAvailable = sameColorVariants.find(
      (v) => v.stockStatus !== "UNAVAILABLE"
    );
    const target = keepSize ?? firstAvailable ?? sameColorVariants[0];
    if (target) onVariantChange(target);
  }

  function handleSizeClick(size: string) {
    const target = variants.find(
      (v) => v.colorName === selectedColor && v.size === size
    );
    if (target) onVariantChange(target);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Color swatches ─────────────────────────────────────────────── */}
      <fieldset>
        <legend
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Color
          {selectedColor && (
            <span
              className="ml-2 font-normal normal-case tracking-normal"
              style={{ color: "var(--color-text-primary)" }}
            >
              — {selectedColor}
            </span>
          )}
        </legend>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Seleccionar color">
          {uniqueColors.map((colorVariant) => {
            const isSelected = colorVariant.colorName === selectedColor;
            const allUnavailable = variants
              .filter((v) => v.colorName === colorVariant.colorName)
              .every((v) => v.stockStatus === "UNAVAILABLE");

            return (
              <button
                key={colorVariant.colorName}
                type="button"
                onClick={() => handleColorClick(colorVariant.colorName)}
                disabled={allUnavailable}
                aria-pressed={isSelected}
                aria-label={`Color ${colorVariant.colorName}${allUnavailable ? " — agotado" : ""}`}
                title={colorVariant.colorName}
                className="relative h-8 w-8 rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  backgroundColor: colorVariant.colorHex,
                  outline: isSelected
                    ? "2px solid var(--color-cyan)"
                    : "1px solid var(--color-border)",
                  outlineOffset: isSelected ? "3px" : "1px",
                  // @ts-expect-error CSS custom property
                  "--tw-ring-color": "var(--color-cyan)",
                }}
              >
                {allUnavailable && (
                  <span
                    className="absolute inset-0 flex items-center justify-center rounded-full"
                    aria-hidden="true"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="rgba(255,255,255,0.7)"
                      strokeWidth="1.5"
                    >
                      <line x1="4" y1="4" x2="16" y2="16" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ── Size buttons ───────────────────────────────────────────────── */}
      <fieldset>
        <legend
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Talla
          {selectedSize && (
            <span
              className="ml-2 font-normal normal-case tracking-normal"
              style={{ color: "var(--color-text-primary)" }}
            >
              — {selectedSize}
            </span>
          )}
        </legend>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Seleccionar talla">
          {uniqueSizes.map((size) => {
            const variantForSize = variants.find(
              (v) => v.colorName === selectedColor && v.size === size
            );
            const isSelected = size === selectedSize;
            const isUnavailable = variantForSize?.stockStatus === "UNAVAILABLE";
            const isLimited = variantForSize?.stockStatus === "LIMITED";

            return (
              <div key={size} className="relative">
                <button
                  type="button"
                  onClick={() => handleSizeClick(size)}
                  disabled={isUnavailable}
                  aria-pressed={isSelected}
                  aria-label={`Talla ${size}${isUnavailable ? " — agotado" : isLimited ? " — últimas unidades" : ""}`}
                  className="relative min-w-[3rem] rounded px-3 py-1.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: isSelected
                      ? "var(--color-magenta)"
                      : "var(--color-surface-elevated)",
                    color: isSelected
                      ? "#ffffff"
                      : isUnavailable
                        ? "var(--color-text-secondary)"
                        : "var(--color-text-primary)",
                    border: isSelected
                      ? "1px solid var(--color-magenta)"
                      : "1px solid var(--color-border)",
                    opacity: isUnavailable ? 0.45 : 1,
                    textDecoration: isUnavailable ? "line-through" : "none",
                    // @ts-expect-error CSS custom property
                    "--tw-ring-color": "var(--color-cyan)",
                  }}
                >
                  {size}
                </button>

                {/* "Últimas unidades" badge */}
                {isLimited && !isUnavailable && (
                  <span
                    className="absolute -right-1 -top-1 rounded-full px-1 py-0.5 text-[9px] font-bold leading-none"
                    style={{
                      backgroundColor: "var(--color-yellow)",
                      color: "#000000",
                    }}
                    aria-hidden="true"
                  >
                    ¡Últimas!
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Agotado label for unavailable sizes */}
        {uniqueSizes.some((size) => {
          const v = variants.find(
            (vv) => vv.colorName === selectedColor && vv.size === size
          );
          return v?.stockStatus === "UNAVAILABLE";
        }) && (
          <p
            className="mt-2 text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Las tallas tachadas están{" "}
            <span style={{ color: "var(--color-error)" }}>agotadas</span>.
          </p>
        )}
      </fieldset>
    </div>
  );
}
