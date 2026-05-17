import type { CSSProperties } from "react";

type SplashColor = "magenta" | "cyan" | "green" | "yellow" | "orange" | "violet" | "turquoise";
type SplashSize = "sm" | "md" | "lg";

interface SplashAccentProps {
  /** Brand color for the splash */
  color?: SplashColor;
  /** Size of the splash element */
  size?: SplashSize;
  /** Additional CSS classes */
  className?: string;
  /** Inline style overrides */
  style?: CSSProperties;
  /** Rotation in degrees */
  rotation?: number;
  /** Opacity (0–1) */
  opacity?: number;
}

const colorMap: Record<SplashColor, string> = {
  magenta: "var(--color-magenta)",
  cyan: "var(--color-cyan)",
  green: "var(--color-green)",
  yellow: "var(--color-yellow)",
  orange: "var(--color-orange)",
  violet: "var(--color-violet)",
  turquoise: "var(--color-turquoise)",
};

const sizeMap: Record<SplashSize, { width: number; height: number }> = {
  sm: { width: 80, height: 80 },
  md: { width: 160, height: 160 },
  lg: { width: 280, height: 280 },
};

/**
 * Decorative paint splash SVG component for hero sections and category headers.
 * Used as a controlled brand accent — position with absolute/relative CSS.
 * Meets Req 9.3: paint splash visual elements in hero and category headers.
 */
export default function SplashAccent({
  color = "magenta",
  size = "md",
  className = "",
  style,
  rotation = 0,
  opacity = 0.6,
}: SplashAccentProps) {
  const fill = colorMap[color];
  const { width, height } = sizeMap[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none select-none ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        opacity,
        ...style,
      }}
    >
      {/* Paint splash blob — organic irregular shape */}
      <path
        d="M100 10
           C130 5, 165 20, 175 50
           C185 75, 195 90, 185 115
           C178 135, 165 155, 145 168
           C125 182, 100 190, 75 182
           C50 174, 25 158, 15 135
           C5 112, 8 85, 20 62
           C32 38, 55 18, 80 12
           C87 10, 93 10, 100 10Z"
        fill={fill}
      />
      {/* Drip 1 */}
      <path
        d="M155 165 C158 175, 155 188, 148 192 C142 196, 138 190, 140 180 C142 170, 150 162, 155 165Z"
        fill={fill}
      />
      {/* Drip 2 */}
      <path
        d="M45 155 C40 165, 38 180, 44 186 C50 192, 56 186, 54 175 C52 164, 48 152, 45 155Z"
        fill={fill}
      />
      {/* Splatter dot 1 */}
      <circle cx="175" cy="80" r="8" fill={fill} />
      {/* Splatter dot 2 */}
      <circle cx="30" cy="60" r="5" fill={fill} />
      {/* Splatter dot 3 */}
      <circle cx="170" cy="140" r="4" fill={fill} />
      {/* Splatter dot 4 */}
      <circle cx="20" cy="130" r="6" fill={fill} />
    </svg>
  );
}
