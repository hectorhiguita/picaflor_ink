import type { CSSProperties, ReactNode } from "react";

type BadgeVariant = "default" | "magenta" | "cyan" | "green" | "yellow" | "error";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, CSSProperties> = {
  default: {
    backgroundColor: "var(--color-surface-elevated)",
    color: "var(--color-text-secondary)",
    border: "1px solid var(--color-border)",
  },
  magenta: {
    backgroundColor: "rgba(255,20,147,0.15)",
    color: "var(--color-magenta)",
    border: "1px solid rgba(255,20,147,0.35)",
  },
  cyan: {
    backgroundColor: "rgba(0,200,255,0.12)",
    color: "var(--color-cyan)",
    border: "1px solid rgba(0,200,255,0.3)",
  },
  green: {
    backgroundColor: "rgba(100,220,20,0.12)",
    color: "var(--color-green)",
    border: "1px solid rgba(100,220,20,0.3)",
  },
  yellow: {
    backgroundColor: "rgba(255,179,0,0.12)",
    color: "var(--color-yellow)",
    border: "1px solid rgba(255,179,0,0.3)",
  },
  error: {
    backgroundColor: "rgba(255,69,0,0.12)",
    color: "var(--color-error)",
    border: "1px solid rgba(255,69,0,0.3)",
  },
};

/**
 * Small label component for categories, statuses, and tags.
 * Uses brand color variants.
 */
export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}
