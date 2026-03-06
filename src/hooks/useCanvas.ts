import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BackgroundConfig,
  ExportConfig,
  ImageFile,
  MockupConfig,
  SplitConfig,
  WatermarkConfig,
} from "../types";
import { drawSplitImage } from "../utils/canvas";

interface UseCanvasOptions {
  images: Partial<Record<ImageFile["id"], ImageFile>>;
  splitConfig: SplitConfig;
  background: BackgroundConfig;
  mockup: MockupConfig;
  watermark: WatermarkConfig;
  exportConfig: ExportConfig;
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
  background,
  mockup,
  watermark,
  exportConfig,
  debounceMs = 80,
}: UseCanvasOptions): UseCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const renderIdRef = useRef(0);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const hasLight = !!images.light;
    const hasDark = !!images.dark;

    if (!hasLight || !hasDark) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasOutput(false);
      setError(null);
      return;
    }

    const currentId = ++renderIdRef.current;
    setIsRendering(true);
    setError(null);

    try {
      const result = await drawSplitImage({
        images,
        splitConfig,
        background,
        mockup,
        watermark,
        exportConfig: { ...exportConfig, scale: 1 },
        canvas,
      });

      if (currentId !== renderIdRef.current) return;
      setHasOutput(!!result);
    } catch (err) {
      if (currentId !== renderIdRef.current) return;
      setError(err instanceof Error ? err.message : "Render failed");
      setHasOutput(false);
    } finally {
      if (currentId === renderIdRef.current) setIsRendering(false);
    }
  }, [images, splitConfig, background, mockup, watermark, exportConfig]);

  useEffect(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(render, debounceMs);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [render, debounceMs]);

  const forceRender = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    render();
  }, [render]);

  return { canvasRef, isRendering, hasOutput, error, forceRender };
}
