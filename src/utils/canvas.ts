import type { ExportConfig, ImageFile, SplitConfig } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DrawOptions {
  images: Partial<Record<ImageFile["id"], ImageFile>>;
  splitConfig: SplitConfig;
  exportConfig: ExportConfig;
  /** Target canvas element. If omitted, a new OffscreenCanvas is created. */
  canvas?: HTMLCanvasElement;
}

export interface DrawResult {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  width: number;
  height: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Load an HTMLImageElement from a URL (or return cached if already loaded).
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Compute the output canvas dimensions.
 * Strategy: use the largest common bounding box (max width, max height).
 */
function computeCanvasDimensions(
  light: HTMLImageElement,
  dark: HTMLImageElement
): { width: number; height: number } {
  return {
    width: Math.max(light.naturalWidth, dark.naturalWidth),
    height: Math.max(light.naturalHeight, dark.naturalHeight),
  };
}

/**
 * Build the diagonal clip path for a given canvas size.
 *
 * direction "diagonal-lr": clip goes ↘ (top-left triangle = image A, bottom-right = image B)
 * direction "diagonal-rl": clip goes ↙ (top-right triangle = image A, bottom-left = image B)
 *
 * offset: 0–1 — where the diagonal line's midpoint sits (0 = full left/right, 1 = full right/left)
 */
function buildDiagonalPath(
  _ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  direction: SplitConfig["direction"],
  offset: number
): Path2D {
  const path = new Path2D();

  if (direction === "diagonal-lr") {
    // Top-left → bottom-right diagonal
    // The "center" of the diagonal shifts horizontally by offset
    // At offset=0.5, the diagonal passes through the center of the canvas
    const shift = (offset - 0.5) * w;

    // Top-right edge starts at (w/2 + shift, 0) and bottom-left at (w/2 + shift - w, h)
    const x1 = w / 2 + shift;
    // The line goes from (x1, 0) to (x1 + w, h) — a true diagonal spanning the canvas
    // Left polygon: top-left, (x1, 0), (x1+w, h), bottom-left, top-left
    path.moveTo(0, 0);
    path.lineTo(x1, 0);
    path.lineTo(x1 + w, h);
    path.lineTo(0, h);
    path.closePath();
  } else {
    // diagonal-rl: top-right → bottom-left
    const shift = (offset - 0.5) * w;
    const x1 = w / 2 + shift; // point on top edge

    // Line goes from (x1, 0) to (x1 - w, h)
    // Right polygon: (x1, 0), top-right, bottom-right, (x1-w, h), (x1, 0)
    path.moveTo(x1, 0);
    path.lineTo(w, 0);
    path.lineTo(w, h);
    path.lineTo(x1 - w, h);
    path.closePath();
  }

  return path;
}

/**
 * Draw one image onto the canvas, centered and scaled to cover the canvas
 * (same behaviour as CSS `object-fit: cover`).
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number
): void {
  const scale = Math.max(canvasW / img.naturalWidth, canvasH / img.naturalHeight);
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;
  const offsetX = (canvasW - drawW) / 2;
  const offsetY = (canvasH - drawH) / 2;
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

/**
 * Draw a feathered edge along the diagonal using a linear gradient mask.
 *
 * We composite the second image with a gradient alpha so the boundary fades
 * instead of being a hard cut.
 */
/**
 * Draw the divider line along the diagonal split.
 */
function drawDivider(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  splitConfig: SplitConfig
): void {
  const { direction, offset, dividerColor, dividerWidth } = splitConfig;
  const shift = (offset - 0.5) * w;
  const x1 = w / 2 + shift;

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = dividerColor;
  ctx.lineWidth = dividerWidth;
  ctx.lineCap = "round";

  if (direction === "diagonal-lr") {
    ctx.moveTo(x1, 0);
    ctx.lineTo(x1 + w, h);
  } else {
    ctx.moveTo(x1, 0);
    ctx.lineTo(x1 - w, h);
  }

  ctx.stroke();
  ctx.restore();
}

// ─── Main Draw Function ───────────────────────────────────────────────────────

/**
 * Core render function.
 *
 * Draws two images split diagonally on a canvas.
 * - light image goes on the LEFT/TOP half
 * - dark image goes on the RIGHT/BOTTOM half
 *
 * Returns the canvas and its pixel dimensions.
 */
export async function drawSplitImage(options: DrawOptions): Promise<DrawResult | null> {
  const { images, splitConfig, exportConfig } = options;

  const lightFile = images.light;
  const darkFile = images.dark;

  if (!lightFile || !darkFile) return null;

  // Load both images in parallel
  const [lightImg, darkImg] = await Promise.all([
    loadImage(lightFile.url),
    loadImage(darkFile.url),
  ]);

  const { width, height } = computeCanvasDimensions(lightImg, darkImg);
  const scale = exportConfig.scale;
  const outputW = width * scale;
  const outputH = height * scale;

  // Use provided canvas or create offscreen
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  if (options.canvas) {
    canvas = options.canvas;
    canvas.width = outputW;
    canvas.height = outputH;
    const c = canvas.getContext("2d");
    if (!c) return null;
    ctx = c;
  } else {
    canvas = new OffscreenCanvas(outputW, outputH);
    const c = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    if (!c) return null;
    ctx = c;
  }

  // Scale context for export resolution
  ctx.scale(scale, scale);

  // ── Layer 1: Light image (LEFT / TOP polygon) ────────────────────────────
  const lightPath = buildDiagonalPath(ctx, width, height, splitConfig.direction, splitConfig.offset);

  ctx.save();
  ctx.clip(lightPath);

  if (splitConfig.feather > 0) {
    drawImageCover(ctx, lightImg, width, height);
  } else {
    drawImageCover(ctx, lightImg, width, height);
  }
  ctx.restore();

  // ── Layer 2: Dark image (RIGHT / BOTTOM polygon) ─────────────────────────
  // Build the inverse path: full canvas minus the light path
  // Build the complement path (the region NOT covered by lightPath)
  const complementPath = new Path2D();

  if (splitConfig.direction === "diagonal-lr") {
    const shift = (splitConfig.offset - 0.5) * width;
    const x1 = width / 2 + shift;
    // Dark = bottom-right region
    // Light path line goes from (x1, 0) to (x1 + width, height)
    // Dark region: (x1,0) → top-right → bottom-right → (x1+width, height) → back
    complementPath.moveTo(x1, 0);
    complementPath.lineTo(width, 0);
    complementPath.lineTo(width, height);
    complementPath.lineTo(x1 + width, height); // extends off-canvas, canvas clips it
    complementPath.closePath();
  } else {
    const shift = (splitConfig.offset - 0.5) * width;
    const x1 = width / 2 + shift;
    // Dark = bottom-left triangle
    complementPath.moveTo(0, 0);
    complementPath.lineTo(x1, 0);
    complementPath.lineTo(x1 - width, height);
    complementPath.lineTo(0, height);
    complementPath.closePath();
  }

  ctx.save();
  ctx.clip(complementPath);

  if (splitConfig.feather > 0) {
    // For feathered edge on dark image, draw in a temporary layer
    const tempCanvas = new OffscreenCanvas(outputW, outputH);
    const tempCtx = tempCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    if (tempCtx) {
      tempCtx.scale(scale, scale);
      drawImageCover(tempCtx, darkImg, width, height);

      // Apply feather gradient mask on the edge
      const { direction, offset, feather } = splitConfig;
      const shift = (offset - 0.5) * width;
      const lineX1 = width / 2 + shift;

      const len = Math.sqrt(width * width + height * height);
      const ndx = direction === "diagonal-lr" ? height / len : -height / len;
      const ndy = -width / len;

      const halfFeather = feather / 2;
      const midX = lineX1 + (direction === "diagonal-lr" ? width / 2 : -width / 2);
      const midY = height / 2;

      const gx1 = midX - ndx * halfFeather * scale;
      const gy1 = midY - ndy * halfFeather * scale;
      const gx2 = midX + ndx * halfFeather * scale;
      const gy2 = midY + ndy * halfFeather * scale;

      const grad = tempCtx.createLinearGradient(gx1, gy1, gx2, gy2);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,1)");

      const maskCanvas = new OffscreenCanvas(outputW, outputH);
      const maskCtx = maskCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
      if (maskCtx) {
        maskCtx.fillStyle = grad;
        maskCtx.fillRect(0, 0, outputW, outputH);
        tempCtx.globalCompositeOperation = "destination-out";
        tempCtx.drawImage(maskCanvas, 0, 0);
      }

      ctx.drawImage(tempCanvas, 0, 0, outputW, outputH, 0, 0, width, height);
    }
  } else {
    drawImageCover(ctx, darkImg, width, height);
  }

  ctx.restore();

  // ── Layer 3: Optional divider line ───────────────────────────────────────
  if (splitConfig.showDivider) {
    drawDivider(ctx, width, height, splitConfig);
  }

  return { canvas, width: outputW, height: outputH };
}

// ─── Export to Blob / Data URL ────────────────────────────────────────────────

export async function exportToBlob(
  result: DrawResult,
  exportConfig: ExportConfig
): Promise<Blob | null> {
  const { format, quality } = exportConfig;
  const mimeType = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";

  if (result.canvas instanceof HTMLCanvasElement) {
    return new Promise((resolve) => {
      (result.canvas as HTMLCanvasElement).toBlob(
        (blob) => resolve(blob),
        mimeType,
        format === "png" ? undefined : quality
      );
    });
  }

  // OffscreenCanvas
  return (result.canvas as OffscreenCanvas).convertToBlob({
    type: mimeType,
    quality: format === "png" ? undefined : quality,
  });
}

export function downloadBlob(blob: Blob, filename: string, format: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportAndDownload(
  result: DrawResult,
  exportConfig: ExportConfig
): Promise<void> {
  const blob = await exportToBlob(result, exportConfig);
  if (!blob) return;
  downloadBlob(blob, exportConfig.filename, exportConfig.format);
}
