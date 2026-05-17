"use client";

/**
 * MockupEditor — Fabric.js canvas editor for product customization.
 *
 * Architecture:
 * - The product mockup SVG is rendered as a Fabric.js FabricImage at z-index 0
 *   (locked, non-selectable). User layers sit on top. The printable-area dashed
 *   rect is always kept at the very top.
 *
 * - Layer sync is INCREMENTAL: when the `layers` prop changes, the effect only
 *   adds new objects, removes deleted objects, or updates scale/text on existing
 *   objects — it never wipes and recreates the full canvas.
 *
 * - Each Layer has a stable `id` field. A `layerObjectsRef` Map<id, FabricObject>
 *   tracks which Fabric objects correspond to which layers.
 *
 * - Only `object:modified` (fires on mouse-up / touch-end) reports positions back
 *   to the parent. Listening to `object:moving` / `object:scaling` created a
 *   tight feedback loop that caused objects to jump during drag.
 *
 * - Responsive sizing is handled by `canvas.setDimensions({cssOnly: true})` so
 *   Fabric.js correctly scales pointer-event coordinates instead of the old
 *   CSS-transform approach that broke hit detection.
 *
 * - Export hides the printable-area overlay before rendering the PNG, so the
 *   dashed rectangle never appears in the final image.
 *
 * Import via MockupEditorLoader (next/dynamic, ssr:false).
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useCallback,
  useState,
} from "react";
import type { Canvas as FabricCanvas, FabricObject } from "fabric";
import type { Layer, ImageLayer, TextLayer, PrintableAreaBounds } from "@/lib/types/mockup";

// ─── Public API exposed via ref ───────────────────────────────────────────────

export interface MockupEditorHandle {
  /** Export the current canvas (mockup + user layers) as a PNG data URL. */
  getPreviewDataUrl: () => string;
  /** Programmatically select a layer on the canvas by its layer id. */
  selectLayer: (id: string) => void;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MockupEditorProps {
  mockupImageUrl: string | null;
  printableArea: PrintableAreaBounds;
  layers: Layer[];
  onLayersChange: (layers: Layer[]) => void;
  /** Called when the user clicks a canvas object; provides the layer id or null. */
  onLayerSelect?: (id: string | null) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CANVAS_SIZE = 600;
const PRINTABLE_AREA_COLOR = "#00C8FF";
const PRINTABLE_AREA_DASH = [8, 6];
const PRINTABLE_AREA_WIDTH = 2;

// ─── Canvas object metadata (stored in WeakMap to avoid extending Fabric types) ─

type ObjectMeta =
  | { kind: "mockup" }
  | { kind: "printableArea" }
  | { kind: "layer"; layerId: string; layerType: "text" }
  | { kind: "layer"; layerId: string; layerType: "image"; fitScale: number };

const objectMeta = new WeakMap<FabricObject, ObjectMeta>();

// ─── Component ────────────────────────────────────────────────────────────────

const MockupEditor = forwardRef<MockupEditorHandle, MockupEditorProps>(
  function MockupEditor(
    { mockupImageUrl, printableArea, layers, onLayersChange, onLayerSelect },
    ref,
  ) {
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<FabricCanvas | null>(null);

    // Fires once Fabric is initialized; increments on re-init.
    const [canvasReadyToken, setCanvasReadyToken] = useState(0);

    // Keep up-to-date refs for callbacks used inside async effects.
    const onLayersChangeRef = useRef(onLayersChange);
    onLayersChangeRef.current = onLayersChange;
    const onLayerSelectRef = useRef(onLayerSelect);
    onLayerSelectRef.current = onLayerSelect;
    const layersRef = useRef<Layer[]>(layers);
    layersRef.current = layers;
    const printableAreaRef = useRef(printableArea);
    printableAreaRef.current = printableArea;

    // Tracks which Fabric objects correspond to which layer ids.
    const layerObjectsRef = useRef<Map<string, FabricObject>>(new Map());

    // ── Serialize canvas → Layer model ────────────────────────────────────────

    const serializeLayers = useCallback((): Layer[] => {
      const canvas = fabricRef.current;
      if (!canvas) return [];
      const result: Layer[] = [];

      for (const obj of canvas.getObjects()) {
        const meta = objectMeta.get(obj);
        if (!meta || meta.kind !== "layer") continue;

        const source = layersRef.current.find((l) => l.id === meta.layerId);
        if (!source) continue;

        const x = obj.left ?? source.x;
        const y = obj.top ?? source.y;

        if (meta.layerType === "image") {
          // Normalize scale back to "fit-relative" units so the slider stays intuitive.
          const rawScale = obj.scaleX ?? 1;
          const scale = meta.fitScale > 0 ? rawScale / meta.fitScale : rawScale;
          result.push({
            ...(source as ImageLayer),
            x,
            y,
            scale,
            rotation: obj.angle ?? (source as ImageLayer).rotation,
          });
        } else {
          result.push({
            ...(source as TextLayer),
            x,
            y,
            scale: obj.scaleX ?? source.scale,
          });
        }
      }

      return result;
    }, []);

    // ── Ref-exposed API ───────────────────────────────────────────────────────

    useImperativeHandle(ref, () => ({
      getPreviewDataUrl() {
        const canvas = fabricRef.current;
        if (!canvas) return "";

        // Temporarily hide the printable-area rect so it doesn't bleed into the export.
        const overlay = canvas
          .getObjects()
          .find((o) => objectMeta.get(o)?.kind === "printableArea");
        if (overlay) {
          overlay.visible = false;
          canvas.renderAll();
        }

        const dataUrl = canvas.toDataURL({ format: "png", multiplier: 1 });

        if (overlay) {
          overlay.visible = true;
          canvas.renderAll();
        }

        return dataUrl;
      },
      selectLayer(id: string) {
        const canvas = fabricRef.current;
        const obj = layerObjectsRef.current.get(id);
        if (canvas && obj) {
          canvas.setActiveObject(obj);
          canvas.renderAll();
        }
      },
    }));

    // ── Initialize Fabric canvas ──────────────────────────────────────────────

    useEffect(() => {
      if (!canvasElRef.current) return;
      let cancelled = false;
      let dispose: (() => void) | null = null;

      (async () => {
        const { Canvas } = await import("fabric");
        if (cancelled || !canvasElRef.current) return;

        const canvas = new Canvas(canvasElRef.current, {
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          selection: true,
          backgroundColor: "#111111",
        });

        fabricRef.current = canvas;

        const handleModified = () => {
          onLayersChangeRef.current(serializeLayers());
        };
        const handleSelectionCreated = () => {
          const active = canvas.getActiveObject();
          if (!active) return;
          const meta = objectMeta.get(active);
          if (meta?.kind === "layer") {
            onLayerSelectRef.current?.(meta.layerId);
          }
        };
        const handleSelectionCleared = () => {
          onLayerSelectRef.current?.(null);
        };

        canvas.on("object:modified", handleModified);
        canvas.on("selection:created", handleSelectionCreated);
        canvas.on("selection:updated", handleSelectionCreated);
        canvas.on("selection:cleared", handleSelectionCleared);

        dispose = () => {
          canvas.off("object:modified", handleModified);
          canvas.off("selection:created", handleSelectionCreated);
          canvas.off("selection:updated", handleSelectionCreated);
          canvas.off("selection:cleared", handleSelectionCleared);
          canvas.dispose();
          fabricRef.current = null;
          layerObjectsRef.current.clear();
        };

        setCanvasReadyToken((v) => v + 1);
      })().catch(console.error);

      return () => {
        cancelled = true;
        dispose ? dispose() : fabricRef.current?.dispose();
        fabricRef.current = null;
        layerObjectsRef.current.clear();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Sync mockup image ─────────────────────────────────────────────────────

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      (async () => {
        const { FabricImage } = await import("fabric");
        if (!fabricRef.current) return;

        // Remove previous mockup object.
        const existing = canvas
          .getObjects()
          .find((o) => objectMeta.get(o)?.kind === "mockup");
        if (existing) canvas.remove(existing);

        if (!mockupImageUrl) {
          canvas.renderAll();
          return;
        }

        try {
          const img = await FabricImage.fromURL(mockupImageUrl, {
            crossOrigin: "anonymous",
          });

          const scaleX = CANVAS_SIZE / (img.width || CANVAS_SIZE);
          const scaleY = CANVAS_SIZE / (img.height || CANVAS_SIZE);

          img.set({
            left: 0,
            top: 0,
            originX: "left",
            originY: "top",
            scaleX,
            scaleY,
            selectable: false,
            evented: false,
          });

          objectMeta.set(img, { kind: "mockup" });
          canvas.add(img);
          canvas.sendObjectToBack(img);
          canvas.renderAll();
        } catch {
          // Mockup failed to load — canvas shows dark background only.
          canvas.renderAll();
        }
      })().catch(console.error);
    }, [mockupImageUrl, canvasReadyToken]);

    // ── Draw printable area overlay ───────────────────────────────────────────

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      (async () => {
        const { Rect } = await import("fabric");
        if (!fabricRef.current) return;

        const existing = canvas
          .getObjects()
          .find((o) => objectMeta.get(o)?.kind === "printableArea");
        if (existing) canvas.remove(existing);

        const { x, y, width, height, rotation } = printableAreaRef.current;
        const rect = new Rect({
          left: x,
          top: y,
          width,
          height,
          angle: rotation,
          fill: "transparent",
          stroke: PRINTABLE_AREA_COLOR,
          strokeWidth: PRINTABLE_AREA_WIDTH,
          strokeDashArray: PRINTABLE_AREA_DASH,
          selectable: false,
          evented: false,
        });

        objectMeta.set(rect, { kind: "printableArea" });
        canvas.add(rect);
        canvas.bringObjectToFront(rect);
        canvas.renderAll();
      })().catch(console.error);
    }, [printableArea, canvasReadyToken]);

    // ── Incremental layer sync ────────────────────────────────────────────────

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const map = layerObjectsRef.current;
      const currentIds = new Set(layers.map((l) => l.id));

      // Remove objects whose layers were deleted.
      for (const [id, obj] of [...map.entries()]) {
        if (!currentIds.has(id)) {
          canvas.remove(obj);
          map.delete(id);
        }
      }

      (async () => {
        const { FabricImage, IText } = await import("fabric");
        if (!fabricRef.current) return;

        for (const layer of layers) {
          const existing = map.get(layer.id);

          if (!existing) {
            // ── ADD new layer ──────────────────────────────────────────────
            if (layer.type === "image" && layer.assetUrl) {
              try {
                const img = await FabricImage.fromURL(layer.assetUrl, {
                  crossOrigin: "anonymous",
                });

                // Compute a "fit" scale so the image fills the printable area
                // but never exceeds it. scale=1 in Layer = this fit scale.
                const pa = printableAreaRef.current;
                const naturalW = img.width || pa.width;
                const naturalH = img.height || pa.height;
                const fitScale = Math.min(
                  pa.width / naturalW,
                  pa.height / naturalH,
                  1,
                );
                const canvasScale = fitScale * layer.scale;

                img.set({
                  left: layer.x,
                  top: layer.y,
                  originX: "center",
                  originY: "center",
                  scaleX: canvasScale,
                  scaleY: canvasScale,
                  angle: layer.rotation ?? 0,
                });

                objectMeta.set(img, {
                  kind: "layer",
                  layerId: layer.id,
                  layerType: "image",
                  fitScale,
                });
                map.set(layer.id, img);

                if (fabricRef.current) {
                  fabricRef.current.add(img);
                  fabricRef.current.setActiveObject(img);
                }
              } catch {
                // Image URL unreachable — skip this layer silently.
              }
            } else if (layer.type === "text") {
              const text = new IText(layer.text, {
                left: layer.x,
                top: layer.y,
                originX: "center",
                originY: "center",
                scaleX: layer.scale,
                scaleY: layer.scale,
                fontFamily: layer.fontFamily,
                fill: layer.color,
                fontSize: layer.fontSize,
                editable: true,
              });

              objectMeta.set(text, {
                kind: "layer",
                layerId: layer.id,
                layerType: "text",
              });
              map.set(layer.id, text);

              if (fabricRef.current) {
                fabricRef.current.add(text);
                fabricRef.current.setActiveObject(text);
              }
            }
          } else {
            // ── UPDATE existing layer (scale / text properties only) ───────
            const meta = objectMeta.get(existing);
            if (!meta || meta.kind !== "layer") continue;
            let dirty = false;

            if (layer.type === "image" && meta.layerType === "image") {
              const expectedScale = meta.fitScale * layer.scale;
              if (Math.abs((existing.scaleX ?? 1) - expectedScale) > 0.001) {
                existing.set({ scaleX: expectedScale, scaleY: expectedScale });
                dirty = true;
              }
            } else if (layer.type === "text" && meta.layerType === "text") {
              const t = existing as InstanceType<typeof IText>;
              if (t.text !== layer.text) {
                t.set("text", layer.text);
                dirty = true;
              }
              if (t.fill !== layer.color) {
                t.set("fill", layer.color);
                dirty = true;
              }
              if (t.fontFamily !== layer.fontFamily) {
                t.set("fontFamily", layer.fontFamily);
                dirty = true;
              }
              if (t.fontSize !== layer.fontSize) {
                t.set("fontSize", layer.fontSize);
                dirty = true;
              }
              if (Math.abs((t.scaleX ?? 1) - layer.scale) > 0.001) {
                t.set({ scaleX: layer.scale, scaleY: layer.scale });
                dirty = true;
              }
            }

            if (dirty) existing.setCoords?.();
          }
        }

        // Keep printable area on top after any adds.
        const overlay = fabricRef.current
          ?.getObjects()
          .find((o) => objectMeta.get(o)?.kind === "printableArea");
        if (overlay && fabricRef.current) fabricRef.current.bringObjectToFront(overlay);

        fabricRef.current?.requestRenderAll();
      })().catch(console.error);
    }, [layers, canvasReadyToken]);

    // ── Responsive resize ─────────────────────────────────────────────────────

    useEffect(() => {
      const resize = () => {
        const canvas = fabricRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const w = container.clientWidth;
        if (w <= 0) return;

        // setDimensions with cssOnly:true changes only the CSS size, not the
        // internal coordinate space — Fabric.js automatically corrects pointer
        // event coordinates based on the CSS/logical size ratio.
        const size = Math.min(w, CANVAS_SIZE);
        canvas.setDimensions({ width: size, height: size }, { cssOnly: true });
      };

      const ro = typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(resize)
        : null;
      if (ro && containerRef.current) ro.observe(containerRef.current);
      window.addEventListener("resize", resize);
      resize();

      return () => {
        ro?.disconnect();
        window.removeEventListener("resize", resize);
      };
    }, [canvasReadyToken]);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
      <div
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: CANVAS_SIZE,
          aspectRatio: "1 / 1",
          position: "relative",
        }}
        aria-label="Editor de personalización de producto"
      >
        <canvas
          ref={canvasElRef}
          aria-label="Lienzo de personalización"
          role="img"
        />
      </div>
    );
  },
);

MockupEditor.displayName = "MockupEditor";

export default MockupEditor;
