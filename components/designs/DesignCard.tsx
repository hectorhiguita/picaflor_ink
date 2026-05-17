import Image from "next/image";
import type { DesignItem } from "@/lib/types/design";
import Badge from "@/components/ui/Badge";

interface DesignCardProps {
  design: DesignItem;
  isSelected: boolean;
  onSelect: (design: DesignItem) => void;
}

/**
 * Card for a single design in the catalog.
 * Shows preview image, name, and category badge.
 * Highlights with the official magenta accent when selected.
 * Accessible: aria-pressed, keyboard navigation.
 * Meets Req 2.2, 2.3, 10.5 (lazy loading).
 */
export default function DesignCard({
  design,
  isSelected,
  onSelect,
}: DesignCardProps) {
  const { name, category, imageUrl } = design;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(design);
    }
  };

  return (
    <button
      type="button"
      role="button"
      aria-pressed={isSelected}
      aria-label={`Seleccionar diseño: ${name}, categoría ${category}`}
      onClick={() => onSelect(design)}
      onKeyDown={handleKeyDown}
      className="group relative flex w-full flex-col overflow-hidden rounded-lg text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer"
      style={{
        backgroundColor: "var(--color-surface)",
        border: isSelected
          ? "2px solid var(--color-magenta)"
          : "2px solid var(--color-border)",
        outlineColor: "var(--color-cyan)",
        boxShadow: isSelected
          ? "0 0 0 2px rgba(255,20,147,0.35)"
          : "none",
      }}
    >
      {/* Selected indicator */}
      {isSelected && (
        <span
          className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--color-magenta)" }}
          aria-hidden="true"
        >
          <CheckIcon />
        </span>
      )}

      {/* Design preview image */}
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{ backgroundColor: "var(--color-surface-elevated)" }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Preview del diseño ${name}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-2 transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <PlaceholderImage name={name} />
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-1.5 p-3">
        {/* Design name */}
        <p
          className="line-clamp-2 text-sm font-semibold leading-snug"
          style={{ color: "var(--color-text-primary)" }}
        >
          {name}
        </p>

        {/* Category badge */}
        <Badge variant="cyan">{category}</Badge>
      </div>
    </button>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlaceholderImage({ name }: { name: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      aria-hidden="true"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "var(--color-border)" }}
        aria-label={`Sin imagen para ${name}`}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ffffff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
