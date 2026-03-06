import { useRef } from "react";
import type { ExportConfig, ImageFile, SplitConfig } from "../../types";
import { useCanvas } from "../../hooks/useCanvas";
import {
  drawSplitImage,
  exportAndDownload,
} from "../../utils/canvas";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreviewCanvasProps {
  images: Partial<Record<ImageFile["id"], ImageFile>>;
  splitConfig: SplitConfig;
  exportConfig: ExportConfig;
  isExporting?: boolean;
  onExportStart?: () => void;
  onExportEnd?: () => void;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ImagePlaceholderIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="10"
        width="18"
        height="28"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      <rect
        x="26"
        y="10"
        width="18"
        height="28"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      <path
        d="M22 10 L26 38"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />
      <circle cx="11" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 32 l5-6 4 4 3-3 6 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="37" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M26 32 l5-6 4 4 3-3 6 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="7 10 12 15 17 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="12"
        y1="15"
        x2="12"
        y2="3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpinnerIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ animation: "spin 0.7s linear infinite" }}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="42"
        strokeDashoffset="14"
        opacity="0.85"
      />
    </svg>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ missingBoth }: { missingBoth: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 select-none">
      <div
        className="flex items-center justify-center w-20 h-20 rounded-3xl"
        style={{
          color: "var(--color-text-tertiary)",
          background: "var(--color-surface-secondary)",
        }}
      >
        <ImagePlaceholderIcon />
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center max-w-[200px]">
        <span className="text-sm font-semibold text-[var(--color-text)]">
          {missingBoth ? "上传两张截图" : "再上传一张"}
        </span>
        <span className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          {missingBoth
            ? "分别上传亮色和暗色模式截图，预览将自动生成"
            : "再上传另一张截图，预览就会出现在这里"}
        </span>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mt-1">
        <StepDot label="亮色" done={false} />
        <div
          className="w-8 h-px"
          style={{ background: "var(--color-border)" }}
        />
        <StepDot label="暗色" done={false} />
        <div
          className="w-8 h-px"
          style={{ background: "var(--color-border)" }}
        />
        <StepDot label="合成" done={false} dimmed />
      </div>
    </div>
  );
}

function StepDot({
  label,
  done,
  dimmed,
}: {
  label: string;
  done: boolean;
  dimmed?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-2 h-2 rounded-full transition-colors duration-200"
        style={{
          background: done
            ? "var(--color-primary)"
            : dimmed
              ? "var(--color-border)"
              : "var(--color-text-tertiary)",
        }}
      />
      <span
        className="text-[9px] font-medium select-none"
        style={{
          color: dimmed ? "var(--color-text-tertiary)" : "var(--color-text-secondary)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Rendering Overlay ────────────────────────────────────────────────────────

function RenderingOverlay() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center rounded-[var(--radius-xl)] z-10 transition-opacity duration-200"
      style={{ background: "rgba(0,0,0,0.18)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-medium text-white"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)" }}
      >
        <SpinnerIcon size={16} />
        渲染中…
      </div>
    </div>
  );
}

// ─── Dimension Badge ──────────────────────────────────────────────────────────

function DimensionBadge({ width, height, scale }: { width: number; height: number; scale: number }) {
  const exportW = Math.round(width * scale);
  const exportH = Math.round(height * scale);

  return (
    <div
      className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono text-white select-none pointer-events-none"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
    >
      <span style={{ opacity: 0.7 }}>预览</span>
      <span
        className="inline-block w-px h-2.5 rounded-full mx-0.5"
        style={{ background: "rgba(255,255,255,0.3)" }}
      />
      <span>
        {exportW} × {exportH}
      </span>
      {scale > 1 && (
        <span style={{ opacity: 0.6 }}>@{scale}×</span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PreviewCanvas({
  images,
  splitConfig,
  exportConfig,
  onExportStart,
  onExportEnd,
}: PreviewCanvasProps) {
  const { canvasRef, isRendering, hasOutput, error } = useCanvas({
    images,
    splitConfig,
    exportConfig,
  });

  const isExportingRef = useRef(false);

  const hasLight = !!images.light;
  const hasDark = !!images.dark;
  const hasBoth = hasLight && hasDark;
  const missingBoth = !hasLight && !hasDark;

  // Estimate preview canvas dimensions for the badge
  const previewW = images.light?.width ?? images.dark?.width ?? 0;
  const previewH = images.light?.height ?? images.dark?.height ?? 0;

  async function handleExport() {
    if (isExportingRef.current || !hasBoth) return;
    isExportingRef.current = true;
    onExportStart?.();

    try {
      const result = await drawSplitImage({
        images,
        splitConfig,
        exportConfig,
      });
      if (result) {
        await exportAndDownload(result, exportConfig);
      }
    } finally {
      isExportingRef.current = false;
      onExportEnd?.();
    }
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* ── Canvas area ─────────────────────────────────────────────── */}
      <div
        className="relative flex-1 flex items-center justify-center rounded-[var(--radius-xl)] overflow-hidden min-h-[240px]"
        style={{
          background: hasOutput
            ? "transparent"
            : "var(--color-surface-secondary)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Checkerboard background when canvas has content */}
        {hasOutput && (
          <div className="absolute inset-0 checkerboard rounded-[var(--radius-xl)]" />
        )}

        {/* The canvas element – always mounted, visibility toggled */}
        <canvas
          ref={canvasRef}
          aria-label="合成预览图"
          className="relative z-[1] max-w-full max-h-full object-contain animate-fade-in"
          style={{
            display: hasOutput ? "block" : "none",
            borderRadius: "calc(var(--radius-xl) - 1px)",
            // subtle shadow to lift the canvas off the checkerboard
            boxShadow: "0 4px 32px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.1)",
          }}
        />

        {/* Empty state */}
        {!hasBoth && !isRendering && (
          <EmptyState missingBoth={missingBoth} />
        )}

        {/* Rendering overlay */}
        {isRendering && hasBoth && <RenderingOverlay />}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-20 p-6">
            <div
              className="flex flex-col items-center gap-2 px-5 py-4 rounded-2xl text-center max-w-[220px]"
              style={{
                background: "rgba(255,59,48,0.1)",
                border: "1px solid rgba(255,59,48,0.25)",
              }}
            >
              <span className="text-sm font-semibold text-[#ff3b30]">渲染失败</span>
              <span className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                {error}
              </span>
            </div>
          </div>
        )}

        {/* Dimension badge */}
        {hasOutput && previewW > 0 && previewH > 0 && (
          <DimensionBadge
            width={previewW}
            height={previewH}
            scale={exportConfig.scale}
          />
        )}
      </div>

      {/* ── Export button ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleExport}
        disabled={!hasBoth || isRendering}
        aria-label={`导出为 ${exportConfig.filename}.${exportConfig.format}`}
        className={[
          "relative w-full h-11 rounded-[var(--radius-lg)]",
          "inline-flex items-center justify-center gap-2",
          "text-sm font-semibold select-none cursor-pointer",
          "transition-all duration-200",
          "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          hasBoth && !isRendering
            ? [
                "bg-[var(--color-primary)] text-white",
                "hover:bg-[var(--color-primary-hover)]",
                "active:bg-[var(--color-primary-active)] active:scale-[0.98]",
                "shadow-[0_2px_8px_rgba(0,100,209,0.35)]",
                "hover:shadow-[0_4px_16px_rgba(0,100,209,0.45)]",
              ].join(" ")
            : "bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {isRendering ? (
          <>
            <SpinnerIcon size={16} />
            <span>生成中…</span>
          </>
        ) : (
          <>
            <DownloadIcon />
            <span>
              导出 {exportConfig.filename}.{exportConfig.format}
            </span>
            {hasBoth && (
              <span
                className="ml-0.5 text-[11px] font-normal opacity-75"
              >
                {exportConfig.scale}×
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
