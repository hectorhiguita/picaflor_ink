"use client";

import { useState } from "react";
import Image from "next/image";
import type { DesignItem } from "@/lib/types/design";
import DesignCatalogPanel from "@/components/designs/DesignCatalogPanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface DesignSelectorProps {
  /** Called when the user confirms their design selection */
  onConfirm: (design: DesignItem) => void;
  /** Pre-select a design by ID on mount */
  initialDesignId?: string;
}

/**
 * Wrapper component that combines the DesignCatalogPanel with a
 * "selected design" preview area and a confirm button.
 * Integrates the design catalog into the customizer flow.
 * Meets Req 2.1, 2.3, 3.3.
 */
export default function DesignSelector({
  onConfirm,
  initialDesignId,
}: DesignSelectorProps) {
  const [selectedDesign, setSelectedDesign] = useState<DesignItem | null>(null);

  const handleDesignSelect = (design: DesignItem) => {
    setSelectedDesign(design);
  };

  const handleConfirm = () => {
    if (selectedDesign) {
      onConfirm(selectedDesign);
    }
  };

  // Resolve the effective selected ID: prefer local state, fall back to prop
  const selectedDesignId = selectedDesign?.id ?? initialDesignId;

  return (
    <div className="flex flex-col gap-6">
      {/* Selected design preview */}
      <div
        className="flex items-center gap-4 rounded-lg p-4"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          minHeight: "5rem",
        }}
      >
        {selectedDesign ? (
          <SelectedDesignPreview
            design={selectedDesign}
            onConfirm={handleConfirm}
          />
        ) : (
          <EmptySelection />
        )}
      </div>

      {/* Catalog panel */}
      <DesignCatalogPanel
        onDesignSelect={handleDesignSelect}
        selectedDesignId={selectedDesignId}
      />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SelectedDesignPreviewProps {
  design: DesignItem;
  onConfirm: () => void;
}

function SelectedDesignPreview({
  design,
  onConfirm,
}: SelectedDesignPreviewProps) {
  return (
    <>
      {/* Thumbnail */}
      <div
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md"
        style={{ backgroundColor: "var(--color-surface-elevated)" }}
      >
        {design.imageUrl ? (
          <Image
            src={design.imageUrl}
            alt={`Preview de ${design.name}`}
            fill
            sizes="64px"
            className="object-contain p-1"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            aria-hidden="true"
          >
            <PlaceholderIcon />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p
          className="truncate text-sm font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {design.name}
        </p>
        <Badge variant="cyan">{design.category}</Badge>
      </div>

      {/* Confirm button */}
      <Button
        variant="primary"
        size="sm"
        onClick={onConfirm}
        aria-label={`Usar el diseño ${design.name}`}
        className="shrink-0"
      >
        Usar este diseño
      </Button>
    </>
  );
}

function EmptySelection() {
  return (
    <p
      className="text-sm"
      style={{ color: "var(--color-text-secondary)" }}
      aria-live="polite"
    >
      Selecciona un diseño del catálogo para continuar.
    </p>
  );
}

function PlaceholderIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--color-border)" }}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
