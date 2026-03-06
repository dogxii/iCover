import type {
  BackgroundConfig,
  MockupConfig,
  PresetTemplate,
  SplitConfig,
  WatermarkConfig,
} from "../../types";
import { PRESET_TEMPLATES } from "../../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PresetGalleryProps {
  activePresetId: string | null;
  onApply: (preset: PresetTemplate) => void;
}

// ─── Check icon ───────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8l3.5 3.5 6.5-7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Mini Split Preview ───────────────────────────────────────────────────────
// Renders a tiny SVG that visually represents the split mode + bg of the preset

function MiniPreview({ preset }: { preset: PresetTemplate }) {
  const { splitConfig, background } = preset;

  // Resolve gradient stops for preview
  const gradientStops = (() => {
    if (background.type === "none") return null;
    if (background.type === "solid") return null;
    // Simplified gradient colors for the preview
    const pairs: Record<string, [string, string]> = {
      ocean:  ["#667eea", "#764ba2"],
      sunset: ["#f093fb", "#f5576c"],
      forest: ["#4facfe", "#00f2fe"],
      fire:   ["#f7971e", "#ffd200"],
      night:  ["#0f0c29", "#302b63"],
      aurora: ["#00b4db", "#0083b0"],
      candy:  ["#a18cd1", "#fbc2eb"],
      carbon: ["#1a1a2e", "#16213e"],
    };
    return pairs[background.gradientPreset] ?? ["#667eea", "#764ba2"];
  })();

  const W = 56;
  const H = 38;
  const pad = background.type !== "none" ? 5 : 0;
  const iW = W - pad * 2;
  const iH = H - pad * 2;
  const iX = pad;
  const iY = pad;
  const r = background.cornerRadius > 0 && background.type !== "none" ? 3 : 0;

  // Build split clip polygons in miniature
  const { mode, offset, waveAmplitude, waveFrequency } = splitConfig;

  function buildMiniLightD(): string {
    switch (mode) {
      case "horizontal": {
        const y = iH * offset;
        return `M${iX},${iY} L${iX + iW},${iY} L${iX + iW},${iY + y} L${iX},${iY + y} Z`;
      }
      case "vertical": {
        const x = iW * offset;
        return `M${iX},${iY} L${iX + x},${iY} L${iX + x},${iY + iH} L${iX},${iY + iH} Z`;
      }
      case "diagonal-lr": {
        const shift = (offset - 0.5) * iW;
        const x1 = iW / 2 + shift + iX;
        return `M${iX},${iY} L${x1},${iY} L${x1 + iW},${iY + iH} L${iX},${iY + iH} Z`;
      }
      case "diagonal-rl": {
        const shift = (offset - 0.5) * iW;
        const x1 = iW / 2 + shift + iX;
        return `M${x1},${iY} L${iX + iW},${iY} L${iX + iW},${iY + iH} L${x1 - iW},${iY + iH} Z`;
      }
      case "arc": {
        const midY = iH * offset + iY;
        const amplitude = iH * waveAmplitude;
        const cpX = iX + iW / 2;
        const cpY = midY - amplitude * 2.5;
        return `M${iX},${iY} L${iX + iW},${iY} L${iX + iW},${midY} Q${cpX},${cpY} ${iX},${midY} Z`;
      }
      case "wave": {
        const midY = iH * offset + iY;
        const amplitude = iH * waveAmplitude;
        const steps = 20;
        const freq = waveFrequency;
        const pts = Array.from({ length: steps + 1 }, (_, i) => {
          const px = iX + (i / steps) * iW;
          const py = midY + Math.sin((i / steps) * Math.PI * 2 * freq) * amplitude;
          return `${px.toFixed(1)},${py.toFixed(1)}`;
        });
        const lastPy = midY + Math.sin(Math.PI * 2 * freq) * amplitude;
        return `M${iX},${iY} L${iX + iW},${iY} L${iX + iW},${lastPy.toFixed(1)} ${pts.slice().reverse().join(" L")} Z`;
      }
    }
  }

  function buildMiniDarkD(): string {
    switch (mode) {
      case "horizontal": {
        const y = iH * offset;
        return `M${iX},${iY + y} L${iX + iW},${iY + y} L${iX + iW},${iY + iH} L${iX},${iY + iH} Z`;
      }
      case "vertical": {
        const x = iW * offset;
        return `M${iX + x},${iY} L${iX + iW},${iY} L${iX + iW},${iY + iH} L${iX + x},${iY + iH} Z`;
      }
      case "diagonal-lr": {
        const shift = (offset - 0.5) * iW;
        const x1 = iW / 2 + shift + iX;
        return `M${x1},${iY} L${iX + iW},${iY} L${iX + iW},${iY + iH} L${x1 + iW},${iY + iH} Z`;
      }
      case "diagonal-rl": {
        const shift = (offset - 0.5) * iW;
        const x1 = iW / 2 + shift + iX;
        return `M${iX},${iY} L${x1},${iY} L${x1 - iW},${iY + iH} L${iX},${iY + iH} Z`;
      }
      case "arc": {
        const midY = iH * offset + iY;
        const amplitude = iH * waveAmplitude;
        const cpX = iX + iW / 2;
        const cpY = midY - amplitude * 2.5;
        return `M${iX},${midY} Q${cpX},${cpY} ${iX + iW},${midY} L${iX + iW},${iY + iH} L${iX},${iY + iH} Z`;
      }
      case "wave": {
        const midY = iH * offset + iY;
        const amplitude = iH * waveAmplitude;
        const steps = 20;
        const freq = waveFrequency;
        const pts = Array.from({ length: steps + 1 }, (_, i) => {
          const px = iX + (i / steps) * iW;
          const py = midY + Math.sin((i / steps) * Math.PI * 2 * freq) * amplitude;
          return `${px.toFixed(1)},${py.toFixed(1)}`;
        });
        const firstPy = midY + Math.sin(0) * amplitude;
        return `M${iX},${firstPy.toFixed(1)} ${pts.join(" L")} L${iX + iW},${iY + iH} L${iX},${iY + iH} Z`;
      }
    }
  }

  const lightD = buildMiniLightD();
  const darkD = buildMiniDarkD();
  const gradId = `grad-${preset.id}`;
  const clipId = `clip-${preset.id}`;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        {gradientStops && (
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStops[0]} />
            <stop offset="100%" stopColor={gradientStops[1]} />
          </linearGradient>
        )}
        <clipPath id={clipId}>
          <rect x={iX} y={iY} width={iW} height={iH} rx={r} />
        </clipPath>
      </defs>

      {/* Background */}
      {background.type !== "none" && (
        <rect
          x={0}
          y={0}
          width={W}
          height={H}
          rx={4}
          fill={
            background.type === "solid"
              ? background.solidColor
              : gradientStops
              ? `url(#${gradId})`
              : "#1a1a2e"
          }
        />
      )}

      {/* Light half — warm/bright color */}
      <path d={lightD} fill="#e8e0f0" clipPath={`url(#${clipId})`} />
      {/* Dark half — cool/deep color */}
      <path d={darkD} fill="#1a1433" clipPath={`url(#${clipId})`} />

      {/* Mockup bar hint */}
      {preset.mockup.style !== "none" && (
        <rect
          x={iX}
          y={iY}
          width={iW}
          height={5}
          rx={r}
          fill="rgba(180,180,180,0.3)"
          clipPath={`url(#${clipId})`}
        />
      )}

      {/* Divider line hint */}
      {splitConfig.showDivider && (
        <path
          d={(() => {
            switch (mode) {
              case "horizontal": return `M${iX},${iH * offset + iY} L${iX + iW},${iH * offset + iY}`;
              case "vertical":   return `M${iW * offset + iX},${iY} L${iW * offset + iX},${iY + iH}`;
              case "diagonal-lr": {
                const shift = (offset - 0.5) * iW;
                const x1 = iW / 2 + shift + iX;
                return `M${x1},${iY} L${x1 + iW},${iY + iH}`;
              }
              case "diagonal-rl": {
                const shift = (offset - 0.5) * iW;
                const x1 = iW / 2 + shift + iX;
                return `M${x1},${iY} L${x1 - iW},${iY + iH}`;
              }
              default: return "";
            }
          })()}
          stroke={splitConfig.dividerColor}
          strokeWidth="0.8"
          strokeLinecap="round"
          clipPath={`url(#${clipId})`}
        />
      )}

      {/* Border around image area */}
      <rect
        x={iX + 0.5}
        y={iY + 0.5}
        width={iW - 1}
        height={iH - 1}
        rx={r}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

// ─── Preset Card ──────────────────────────────────────────────────────────────

function PresetCard({
  preset,
  isActive,
  onApply,
}: {
  preset: PresetTemplate;
  isActive: boolean;
  onApply: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onApply}
      aria-label={`应用预设：${preset.name}`}
      aria-pressed={isActive}
      className={[
        "relative flex flex-col gap-2 p-2.5 rounded-[var(--radius-md)]",
        "border transition-all duration-200 cursor-pointer select-none text-left",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
        "hover:scale-[1.03] active:scale-[0.98]",
        isActive
          ? "border-[var(--color-primary)] bg-[rgba(0,100,209,0.06)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-tertiary)]",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        minWidth: 80,
        maxWidth: 88,
        boxShadow: isActive
          ? "0 0 0 1px var(--color-primary), 0 2px 8px rgba(0,100,209,0.15)"
          : "0 1px 3px var(--color-shadow)",
      }}
    >
      {/* Active check badge */}
      {isActive && (
        <div
          className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-white"
          style={{ background: "var(--color-primary)" }}
          aria-hidden="true"
        >
          <CheckIcon />
        </div>
      )}

      {/* Mini preview SVG */}
      <div className="flex items-center justify-center w-full overflow-hidden rounded-[4px]">
        <MiniPreview preset={preset} />
      </div>

      {/* Label */}
      <div className="flex flex-col gap-0.5 px-0.5">
        <span
          className="text-[11px] font-semibold leading-tight truncate"
          style={{
            color: isActive ? "var(--color-primary)" : "var(--color-text)",
          }}
        >
          {preset.name}
        </span>
        <span className="text-[9px] leading-tight text-[var(--color-text-tertiary)] truncate">
          {preset.description}
        </span>
      </div>
    </button>
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

export function PresetGallery({ activePresetId, onApply }: PresetGalleryProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] select-none">
          预设模板
        </span>
        {activePresetId && (
          <span className="text-[10px] text-[var(--color-primary)] select-none">
            已应用
          </span>
        )}
      </div>

      {/* Scrollable card row */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        role="listbox"
        aria-label="预设模板列表"
      >
        {PRESET_TEMPLATES.map((preset) => (
          <div key={preset.id} role="option" aria-selected={preset.id === activePresetId}>
            <PresetCard
              preset={preset}
              isActive={preset.id === activePresetId}
              onApply={() => onApply(preset)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helper to detect if current config matches a preset ─────────────────────

export function detectActivePreset(
  splitConfig: SplitConfig,
  background: BackgroundConfig,
  mockup: MockupConfig,
  watermark: WatermarkConfig
): string | null {
  for (const preset of PRESET_TEMPLATES) {
    const s = preset.splitConfig;
    const b = preset.background;
    const m = preset.mockup;
    const w = preset.watermark;

    const splitMatch =
      s.mode === splitConfig.mode &&
      Math.abs(s.offset - splitConfig.offset) < 0.02;

    const bgMatch =
      b.type === background.type &&
      (b.type === "none" || b.gradientPreset === background.gradientPreset);

    const mockupMatch = m.style === mockup.style;
    const watermarkMatch = w.enabled === watermark.enabled;

    if (splitMatch && bgMatch && mockupMatch && watermarkMatch) {
      return preset.id;
    }
  }
  return null;
}
