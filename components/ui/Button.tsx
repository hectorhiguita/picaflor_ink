import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  /** Render as a full-width block */
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: "var(--color-cyan)",
    color: "var(--color-ink)",
    border: "2px solid transparent",
  },
  secondary: {
    backgroundColor: "transparent",
    color: "var(--color-magenta)",
    border: "2px solid var(--color-magenta)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--color-text-secondary)",
    border: "2px solid var(--color-border)",
  },
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

/**
 * Reusable button component with brand variants.
 * Supports primary (cyan fill), secondary (magenta outline), and ghost (subtle outline).
 */
export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded font-semibold tracking-wide transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      {...props}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${widthClass} ${className}`}
      style={{
        ...variantStyles[variant],
        ...(props.style ?? {}),
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === "primary") {
            e.currentTarget.style.filter = "brightness(1.15)";
          } else if (variant === "secondary") {
            e.currentTarget.style.backgroundColor = "rgba(255,20,147,0.12)";
          } else {
            e.currentTarget.style.color = "var(--color-text-primary)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
          }
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          if (variant === "primary") {
            e.currentTarget.style.filter = "";
          } else if (variant === "secondary") {
            e.currentTarget.style.backgroundColor = "transparent";
          } else {
            e.currentTarget.style.color = "var(--color-text-secondary)";
            e.currentTarget.style.borderColor = "var(--color-border)";
          }
        }
        props.onMouseLeave?.(e);
      }}
    >
      {children}
    </button>
  );
}
