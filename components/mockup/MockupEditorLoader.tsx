"use client";

/**
 * MockupEditorLoader — Lazy-loaded wrapper for MockupEditor.
 *
 * Uses next/dynamic with { ssr: false } so Fabric.js is never included in
 * the server bundle or in pages that don't render the editor.
 *
 * Pages should import this component, NOT MockupEditor directly.
 *
 * The component forwards refs so callers can access MockupEditorHandle
 * (e.g. getPreviewDataUrl()) even through the dynamic import boundary.
 */

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { MockupEditorHandle, MockupEditorProps } from "./MockupEditor";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function EditorSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando editor de personalización…"
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        maxWidth: 600,
        background: "#111111",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.14)",
      }}
    >
      {/* Animated shimmer bar */}
      <div
        style={{
          width: "60%",
          height: 4,
          borderRadius: 2,
          background:
            "linear-gradient(90deg, #181818 25%, #00C8FF44 50%, #181818 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
        }}
      />
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Dynamic import (Fabric.js excluded from SSR / non-editor pages) ──────────

// next/dynamic does not natively support forwardRef, so we cast the result.
// The underlying MockupEditor already uses forwardRef + useImperativeHandle,
// so the ref will be wired correctly at runtime.
const MockupEditorDynamic = dynamic<MockupEditorProps>(() => import("./MockupEditor"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
}) as React.ForwardRefExoticComponent<
  MockupEditorProps & React.RefAttributes<MockupEditorHandle>
>;

// ─── Re-export the handle type so consumers can type their refs ───────────────

export type { MockupEditorHandle };

// ─── Loader component (ref-forwarding) ───────────────────────────────────────

import React from "react";

const MockupEditorLoader = forwardRef<MockupEditorHandle, MockupEditorProps>(
  function MockupEditorLoader(props, ref) {
    return <MockupEditorDynamic {...props} ref={ref} />;
  }
);

MockupEditorLoader.displayName = "MockupEditorLoader";

export default MockupEditorLoader;
