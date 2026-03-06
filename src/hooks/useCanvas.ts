import { useCallback, useEffect, useRef, useState } from "react";
import type { ExportConfig, ImageFile, SplitConfig } from "../types";
import { drawSplitImage } from "../utils/canvas";

interface UseCanvasOptions {
  images: Partial<Record<ImageFile["id"], ImageFile>>;
  splitConfig: SplitConfig;
  exportConfig: ExportConfig;
  /** Debounce delay in ms before re-rendering (default: 80ms) */
  debounceMs?: number;
}

interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isRendering: boolean;
  hasOutput: boolean;
  error: string | null;
  forceRender: () => void;
}

export function useCanvas({
  images,
  splitConfig,
  exportConfig,
  debounceMs = 80,
}: UseCanvasOptions): UseCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer ref
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Abort flag to cancel stale renders
  const renderIdRef = useRef(0);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const hasLight = !!images.light;
    const hasDark = !!images.dark;

    if (!hasLight || !hasDark) {
      // Clear canvas if one or both images are missing
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setHasOutput(false);
      setError(null);
      return;
    }

    // Bump render ID — any previous in-flight render will be ignored
    const currentId = ++renderIdRef.current;

    setIsRendering(true);
    setError(null);

    try {
      const result = await drawSplitImage({
        images,
        splitConfig,
        exportConfig: {
          ...exportConfig,
          // Preview always renders at scale 1 for performance
          scale: 1,
        },
        canvas,
      });

      // Discard stale renders
      if (currentId !== renderIdRef.current) return;

      if (result) {
        setHasOutput(true);
      } else {
        setHasOutput(false);
      }
    } catch (err) {
      if (currentId !== renderIdRef.current) return;
      setError(err instanceof Error ? err.message : "Render failed");
      setHasOutput(false);
    } finally {
      if (currentId === renderIdRef.current) {
        setIsRendering(false);
      }
    }
  }, [images, splitConfig, exportConfig]);

  // Debounced render whenever inputs change
  useEffect(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      render();
    }, debounceMs);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [render, debounceMs]);

  const forceRender = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    render();
  }, [render]);

  return { canvasRef, isRendering, hasOutput, error, forceRender };
}
