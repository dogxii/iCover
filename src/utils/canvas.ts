import type {
  BackgroundConfig,
  ExportConfig,
  GradientDir,
  ImageFile,
  MockupConfig,
  MockupStyle,
  SplitConfig,

  WatermarkConfig,
} from "../types";
import { GRADIENT_PRESETS } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DrawOptions {
  images: Partial<Record<ImageFile["id"], ImageFile>>;
  splitConfig: SplitConfig;
  background: BackgroundConfig;
  mockup: MockupConfig;
  watermark: WatermarkConfig;
  exportConfig: ExportConfig;
  canvas?: HTMLCanvasElement;
}

export interface DrawResult {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  width: number;
  height: number;
}

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

// ─── Image Loader ─────────────────────────────────────────────────────────────

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// ─── object-fit: cover ────────────────────────────────────────────────────────

function drawImageCover(
  ctx: Ctx,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;
  const ox = x + (w - drawW) / 2;
  const oy = y + (h - drawH) / 2;
  ctx.drawImage(img, ox, oy, drawW, drawH);
}

// ─── Split Path Builders ──────────────────────────────────────────────────────

/**
 * Returns [lightPath, darkPath] clip regions for the two images.
 * All coordinates are in logical (pre-scale) units.
 */
function buildSplitPaths(
  w: number,
  h: number,
  config: SplitConfig
): [Path2D, Path2D] {
  const { mode, offset, waveAmplitude, waveFrequency } = config;
  const lightPath = new Path2D();
  const darkPath = new Path2D();

  switch (mode) {
    case "horizontal": {
      const y = h * offset;
      lightPath.rect(0, 0, w, y);
      darkPath.rect(0, y, w, h - y);
      break;
    }

    case "vertical": {
      const x = w * offset;
      lightPath.rect(0, 0, x, h);
      darkPath.rect(x, 0, w - x, h);
      break;
    }

    case "diagonal-lr": {
      const shift = (offset - 0.5) * w;
      const x1 = w / 2 + shift;
      // Light = left polygon
      lightPath.moveTo(0, 0);
      lightPath.lineTo(x1, 0);
      lightPath.lineTo(x1 + w, h);
      lightPath.lineTo(0, h);
      lightPath.closePath();
      // Dark = right polygon
      darkPath.moveTo(x1, 0);
      darkPath.lineTo(w, 0);
      darkPath.lineTo(w, h);
      darkPath.lineTo(x1 + w, h);
      darkPath.closePath();
      break;
    }

    case "diagonal-rl": {
      const shift = (offset - 0.5) * w;
      const x1 = w / 2 + shift;
      // Light = right polygon
      lightPath.moveTo(x1, 0);
      lightPath.lineTo(w, 0);
      lightPath.lineTo(w, h);
      lightPath.lineTo(x1 - w, h);
      lightPath.closePath();
      // Dark = left polygon
      darkPath.moveTo(0, 0);
      darkPath.lineTo(x1, 0);
      darkPath.lineTo(x1 - w, h);
      darkPath.lineTo(0, h);
      darkPath.closePath();
      break;
    }

    case "arc": {
      // Smooth circular arc bulging toward the top
      const midY = h * offset;
      const amplitude = h * waveAmplitude;
      const cpX = w / 2;
      const cpY = midY - amplitude * 2.5;

      // Light = top region (above arc)
      lightPath.moveTo(0, 0);
      lightPath.lineTo(w, 0);
      lightPath.lineTo(w, midY);
      lightPath.quadraticCurveTo(cpX, cpY, 0, midY);
      lightPath.closePath();

      // Dark = bottom region (below arc)
      darkPath.moveTo(0, midY);
      darkPath.quadraticCurveTo(cpX, cpY, w, midY);
      darkPath.lineTo(w, h);
      darkPath.lineTo(0, h);
      darkPath.closePath();
      break;
    }

    case "wave": {
      // Sinusoidal wave running horizontally
      const midY = h * offset;
      const amplitude = h * waveAmplitude;
      const steps = Math.ceil(w / 2);
      const freq = waveFrequency;

      // Build wave top edge (left-to-right)
      const wavePoints: [number, number][] = [];
      for (let i = 0; i <= steps; i++) {
        const px = (i / steps) * w;
        const py = midY + Math.sin((i / steps) * Math.PI * 2 * freq) * amplitude;
        wavePoints.push([px, py]);
      }

      // Light path = top of wave
      lightPath.moveTo(0, 0);
      lightPath.lineTo(w, 0);
      lightPath.lineTo(w, wavePoints[wavePoints.length - 1][1]);
      for (let i = wavePoints.length - 2; i >= 0; i--) {
        const [px, py] = wavePoints[i];
        lightPath.lineTo(px, py);
      }
      lightPath.closePath();

      // Dark path = bottom of wave
      darkPath.moveTo(0, wavePoints[0][1]);
      for (const [px, py] of wavePoints) {
        darkPath.lineTo(px, py);
      }
      darkPath.lineTo(w, h);
      darkPath.lineTo(0, h);
      darkPath.closePath();
      break;
    }
  }

  return [lightPath, darkPath];
}

// ─── Divider Line ─────────────────────────────────────────────────────────────

function drawDividerLine(
  ctx: Ctx,
  w: number,
  h: number,
  config: SplitConfig
): void {
  const { mode, offset, dividerColor, dividerWidth, waveAmplitude, waveFrequency } = config;

  ctx.save();
  ctx.strokeStyle = dividerColor;
  ctx.lineWidth = dividerWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  switch (mode) {
    case "horizontal": {
      const y = h * offset;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      break;
    }
    case "vertical": {
      const x = w * offset;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      break;
    }
    case "diagonal-lr": {
      const shift = (offset - 0.5) * w;
      const x1 = w / 2 + shift;
      ctx.moveTo(x1, 0);
      ctx.lineTo(x1 + w, h);
      break;
    }
    case "diagonal-rl": {
      const shift = (offset - 0.5) * w;
      const x1 = w / 2 + shift;
      ctx.moveTo(x1, 0);
      ctx.lineTo(x1 - w, h);
      break;
    }
    case "arc": {
      const midY = h * offset;
      const amplitude = h * waveAmplitude;
      const cpX = w / 2;
      const cpY = midY - amplitude * 2.5;
      ctx.moveTo(0, midY);
      ctx.quadraticCurveTo(cpX, cpY, w, midY);
      break;
    }
    case "wave": {
      const midY = h * offset;
      const amplitude = h * waveAmplitude;
      const steps = Math.ceil(w / 2);
      const freq = waveFrequency;
      ctx.moveTo(0, midY + Math.sin(0) * amplitude);
      for (let i = 1; i <= steps; i++) {
        const px = (i / steps) * w;
        const py = midY + Math.sin((i / steps) * Math.PI * 2 * freq) * amplitude;
        ctx.lineTo(px, py);
      }
      break;
    }
  }

  ctx.stroke();
  ctx.restore();
}

// ─── Background Layer ─────────────────────────────────────────────────────────

function resolveGradientStops(bg: BackgroundConfig): [string, string] {
  if (bg.useCustomGradient) {
    return [bg.gradientCustomA, bg.gradientCustomB];
  }
  const preset = GRADIENT_PRESETS.find((p) => p.id === bg.gradientPreset);
  if (preset) return [preset.stops[0], preset.stops[1]];
  return ["#667eea", "#764ba2"];
}

function resolveGradientCoords(
  dir: GradientDir,
  w: number,
  h: number
): [number, number, number, number] {
  switch (dir) {
    case "to-r":  return [0, 0, w, 0];
    case "to-b":  return [0, 0, 0, h];
    case "to-tr": return [0, h, w, 0];
    case "to-br":
    default:      return [0, 0, w, h];
  }
}

function drawBackground(ctx: Ctx, totalW: number, totalH: number, bg: BackgroundConfig): void {
  if (bg.type === "none") return;

  ctx.save();

  if (bg.type === "solid") {
    ctx.fillStyle = bg.solidColor;
  } else if (bg.type === "gradient" || bg.type === "mesh") {
    const [stopA, stopB] = resolveGradientStops(bg);
    const [x1, y1, x2, y2] = resolveGradientCoords(bg.gradientDir, totalW, totalH);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, stopA);
    grad.addColorStop(1, stopB);

    if (bg.type === "mesh") {
      // Draw base gradient
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, totalW, totalH);

      // Overlay a radial "mesh" blob in the center for depth
      const radial = ctx.createRadialGradient(
        totalW * 0.35, totalH * 0.4, 0,
        totalW * 0.35, totalH * 0.4, totalW * 0.55
      );
      radial.addColorStop(0, `${stopB}55`);
      radial.addColorStop(1, "transparent");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, totalW, totalH);

      const radial2 = ctx.createRadialGradient(
        totalW * 0.7, totalH * 0.65, 0,
        totalW * 0.7, totalH * 0.65, totalW * 0.4
      );
      radial2.addColorStop(0, `${stopA}44`);
      radial2.addColorStop(1, "transparent");
      ctx.fillStyle = radial2;
      ctx.fillRect(0, 0, totalW, totalH);

      ctx.restore();
      return;
    }

    ctx.fillStyle = grad;
  } else {
    ctx.restore();
    return;
  }

  ctx.fillRect(0, 0, totalW, totalH);
  ctx.restore();
}

// ─── Mockup Frames ────────────────────────────────────────────────────────────

const MOCKUP_TITLEBAR_H = 36;

/**
 * Draw a browser chrome frame around (x, y, w, h).
 * Returns the content area inset — the region inside the chrome.
 */
function drawBrowserMockup(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  style: MockupStyle,
  config: MockupConfig,
  _scale: number
): { ix: number; iy: number; iw: number; ih: number } {
  const isDark = style === "browser-dark";
  const isMac = style === "window-macos";

  const barH = MOCKUP_TITLEBAR_H;
  const radius = 12;
  const totalH = h + barH;

  ctx.save();

  // ── Outer shell ────────────────────────────────────────────────────────────
  // Rounded rect for the entire mockup
  roundRect(ctx, x, y, w, totalH, radius);
  ctx.fillStyle = isDark || isMac ? "#1e1e1e" : "#e8e8e8";
  ctx.fill();

  // Optional gloss highlight on top
  if (config.gloss && !isMac) {
    const glossGrad = ctx.createLinearGradient(x, y, x, y + barH);
    glossGrad.addColorStop(0, "rgba(255,255,255,0.22)");
    glossGrad.addColorStop(1, "rgba(255,255,255,0.04)");
    roundRect(ctx, x, y, w, barH, [radius, radius, 0, 0]);
    ctx.fillStyle = glossGrad;
    ctx.fill();
  }

  // Subtle border
  roundRect(ctx, x, y, w, totalH, radius);
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Traffic lights (macOS style) ──────────────────────────────────────────
  const dotY = y + barH / 2;
  const dotR = isMac ? 6 : 5;
  const dotSpacing = isMac ? 18 : 16;
  const dotsX = x + (isMac ? 18 : 14);

  const dotColors = isMac
    ? ["#ff5f57", "#febc2e", "#28c840"]
    : isDark
    ? ["#ff5f57", "#febc2e", "#28c840"]
    : ["#ff5f57", "#febc2e", "#28c840"];

  dotColors.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(dotsX + i * dotSpacing, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // ── Address bar / title ───────────────────────────────────────────────────
  if (!isMac) {
    // URL bar pill
    const barX = x + dotsX + dotColors.length * dotSpacing + 12;
    const barW = w - (barX - x) - 16;
    const barH2 = 20;
    const barY2 = dotY - barH2 / 2;

    roundRect(ctx, barX, barY2, barW, barH2, 10);
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
    ctx.fill();

    // URL text
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
    ctx.font = `12px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Clip text inside bar
    ctx.save();
    roundRect(ctx, barX, barY2, barW, barH2, 10);
    ctx.clip();
    ctx.fillText(config.urlText, barX + barW / 2, dotY, barW - 16);
    ctx.restore();
  } else {
    // macOS window title — centered
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = `500 13px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(config.urlText, x + w / 2, dotY, w * 0.6);
  }

  // ── Content separator line ────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(x, y + barH);
  ctx.lineTo(x + w, y + barH);
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();

  // Return the content area (below the title bar)
  return { ix: x, iy: y + barH, iw: w, ih: h };
}

// ─── Rounded Rectangle Helper ─────────────────────────────────────────────────

function roundRect(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: number | [number, number, number, number] = 0
): void {
  const [tl, tr, br, bl] = typeof radii === "number"
    ? [radii, radii, radii, radii]
    : radii;

  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);
  ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);
  ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}

// ─── Drop Shadow ─────────────────────────────────────────────────────────────

function applyShadow(ctx: Ctx, intensity: number): void {
  const alpha = intensity * 0.6;
  const blur = intensity * 40;
  const offsetY = intensity * 16;
  ctx.shadowColor = `rgba(0,0,0,${alpha})`;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = offsetY;
}

function clearShadow(ctx: Ctx): void {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// ─── Watermark ────────────────────────────────────────────────────────────────

function drawWatermark(
  ctx: Ctx,
  totalW: number,
  totalH: number,
  config: WatermarkConfig
): void {
  if (!config.enabled || !config.text.trim()) return;

  ctx.save();
  ctx.globalAlpha = config.opacity;

  const fontSize = config.fontSize;
  ctx.font = `${config.fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
  ctx.textBaseline = "middle";

  const metrics = ctx.measureText(config.text);
  const textW = metrics.width;
  const textH = fontSize * 1.2;
  const padH = fontSize * 0.5;
  const padV = fontSize * 0.35;

  // Compute base position
  let bx = 0;
  let by = 0;
  const margin = fontSize * 1.0;

  switch (config.position) {
    case "top-left":
      bx = margin;
      by = margin;
      ctx.textAlign = "left";
      break;
    case "top-center":
      bx = totalW / 2;
      by = margin;
      ctx.textAlign = "center";
      break;
    case "top-right":
      bx = totalW - margin;
      by = margin;
      ctx.textAlign = "right";
      break;
    case "bottom-left":
      bx = margin;
      by = totalH - margin;
      ctx.textAlign = "left";
      break;
    case "bottom-center":
      bx = totalW / 2;
      by = totalH - margin;
      ctx.textAlign = "center";
      break;
    case "bottom-right":
    default:
      bx = totalW - margin;
      by = totalH - margin;
      ctx.textAlign = "right";
      break;
  }

  // Offset adjustment
  bx += config.offsetX * totalW * 0.1;
  by += config.offsetY * totalH * 0.1;

  // Background pill
  if (config.bgColor) {
    const pillX =
      config.position.includes("center")
        ? bx - textW / 2 - padH
        : config.position.includes("right")
        ? bx - textW - padH
        : bx - padH;

    const pillY = by - textH / 2 - padV;

    roundRect(ctx, pillX, pillY, textW + padH * 2, textH + padV * 2, (textH + padV * 2) / 2);
    ctx.fillStyle = config.bgColor;
    ctx.fill();
  }

  ctx.fillStyle = config.color;
  ctx.fillText(config.text, bx, by);

  ctx.restore();
}

// ─── Main Composite ───────────────────────────────────────────────────────────

export async function drawSplitImage(options: DrawOptions): Promise<DrawResult | null> {
  const { images, splitConfig, background, mockup, watermark, exportConfig } = options;

  const lightFile = images.light;
  const darkFile = images.dark;
  if (!lightFile || !darkFile) return null;

  const [lightImg, darkImg] = await Promise.all([
    loadImage(lightFile.url),
    loadImage(darkFile.url),
  ]);

  // ── Dimensions ──────────────────────────────────────────────────────────────
  const imgW = Math.max(lightImg.naturalWidth, darkImg.naturalWidth);
  const imgH = Math.max(lightImg.naturalHeight, darkImg.naturalHeight);

  const hasBg = background.type !== "none";
  const hasMockup = mockup.style !== "none";

  const pad = hasBg ? background.padding : 0;
  const mockupBarH = hasMockup ? MOCKUP_TITLEBAR_H : 0;

  // Total canvas size = image + padding + mockup bar
  const totalW = imgW + pad * 2;
  const totalH = imgH + pad * 2 + mockupBarH;

  const scale = exportConfig.scale;
  const outputW = Math.round(totalW * scale);
  const outputH = Math.round(totalH * scale);

  // ── Canvas setup ────────────────────────────────────────────────────────────
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  let ctx: Ctx;

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

  ctx.scale(scale, scale);

  // ── Layer 0: Background ──────────────────────────────────────────────────
  drawBackground(ctx, totalW, totalH, background);

  // ── Determine image area (after padding + mockup bar) ────────────────────
  // imgX/imgY: top-left of the image area in logical coords
  const imgX = pad;
  const imgY = pad + mockupBarH;

  // ── Layer 1: Mockup frame (draws around image area) ──────────────────────
  let contentX = imgX;
  let contentY = imgY;
  let contentW = imgW;
  let contentH = imgH;

  if (hasMockup) {
    // Shadow under the entire mockup card
    if (hasBg && background.shadow) {
      ctx.save();
      applyShadow(ctx, background.shadowIntensity);
      roundRect(ctx, imgX, imgY - mockupBarH, imgW, imgH + mockupBarH, 12);
      ctx.fillStyle = "transparent";
      ctx.fill();
      clearShadow(ctx);
      ctx.restore();
    }

    const contentArea = drawBrowserMockup(
      ctx,
      imgX,
      imgY - mockupBarH,
      imgW,
      imgH,
      mockup.style,
      mockup,
      scale
    );
    contentX = contentArea.ix;
    contentY = contentArea.iy;
    contentW = contentArea.iw;
    contentH = contentArea.ih;
  } else if (hasBg && background.shadow) {
    // Shadow under the bare image card
    ctx.save();
    applyShadow(ctx, background.shadowIntensity);
    roundRect(ctx, imgX, imgY, imgW, imgH, background.cornerRadius);
    ctx.fillStyle = "rgba(0,0,0,0.001)"; // must fill to cast shadow
    ctx.fill();
    clearShadow(ctx);
    ctx.restore();
  }

  // ── Layer 2: Clipped image composite ────────────────────────────────────
  // Build clip region for the content area (respects corner radius when no mockup)
  const [lightPath, darkPath] = buildSplitPaths(contentW, contentH, splitConfig);

  // Helper: translate a path by (dx, dy)
  function translatePath(src: Path2D, dx: number, dy: number): Path2D {
    const m = new DOMMatrix().translate(dx, dy);
    return new Path2D(src);
    // DOMMatrix translation on Path2D — not universally available in OffscreenCanvas
    // Fallback: use ctx transform trick
    void m; // silence unused warning; we use transform approach below
    return src;
  }
  void translatePath; // unused, using ctx.translate approach instead

  // Clip the entire content area to a rounded rect (only when there's a background/mockup)
  const shouldClipContent = hasBg || hasMockup;

  // Draw light image
  ctx.save();
  if (shouldClipContent) {
    const cr = hasMockup ? 0 : background.cornerRadius;
    roundRect(ctx, contentX, contentY, contentW, contentH, [0, 0, cr, cr]);
    ctx.clip();
  }
  ctx.save();
  ctx.translate(contentX, contentY);
  ctx.clip(lightPath);
  drawImageCover(ctx, lightImg, 0, 0, contentW, contentH);
  ctx.restore();
  ctx.restore();

  // Draw dark image
  ctx.save();
  if (shouldClipContent) {
    const cr = hasMockup ? 0 : background.cornerRadius;
    roundRect(ctx, contentX, contentY, contentW, contentH, [0, 0, cr, cr]);
    ctx.clip();
  }
  ctx.save();
  ctx.translate(contentX, contentY);
  ctx.clip(darkPath);
  drawImageCover(ctx, darkImg, 0, 0, contentW, contentH);
  ctx.restore();
  ctx.restore();

  // ── Layer 3: Divider line ────────────────────────────────────────────────
  if (splitConfig.showDivider) {
    ctx.save();
    ctx.translate(contentX, contentY);
    drawDividerLine(ctx, contentW, contentH, splitConfig);
    ctx.restore();
  }

  // ── Layer 4: Watermark ───────────────────────────────────────────────────
  drawWatermark(ctx, totalW, totalH, watermark);

  return { canvas, width: outputW, height: outputH };
}

// ─── Export Helpers ───────────────────────────────────────────────────────────

export async function exportToBlob(
  result: DrawResult,
  exportConfig: ExportConfig
): Promise<Blob | null> {
  const { format, quality } = exportConfig;
  const mimeType =
    format === "png"
      ? "image/png"
      : format === "jpeg"
      ? "image/jpeg"
      : "image/webp";

  if (result.canvas instanceof HTMLCanvasElement) {
    return new Promise((resolve) => {
      (result.canvas as HTMLCanvasElement).toBlob(
        (blob) => resolve(blob),
        mimeType,
        format === "png" ? undefined : quality
      );
    });
  }

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
