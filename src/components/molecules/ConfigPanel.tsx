import { SegmentedControl } from "../atoms/SegmentedControl";
import { Slider } from "../atoms/Slider";
import type {
  ExportConfig,
  ExportFormat,
  ExportScale,
  SplitConfig,
  SplitDirection,
} from "../../types";
import {
  EXPORT_FORMATS,
  EXPORT_SCALES,
  SPLIT_DIRECTIONS,
  SPLIT_LABELS,
} from "../../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfigPanelProps {
  splitConfig: SplitConfig;
  exportConfig: ExportConfig;
  onSplitChange: <K extends keyof SplitConfig>(key: K, value: SplitConfig[K]) => void;
  onExportChange: <K extends keyof ExportConfig>(key: K, value: ExportConfig[K]) => void;
  disabled?: boolean;
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] select-none">
        {title}
      </h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="h-px bg-[var(--color-border)] my-1" />;
}

// ─── Color Swatch Picker ──────────────────────────────────────────────────────

const PRESET_DIVIDER_COLORS = [
  "#ffffff",
  "#000000",
  "#0064d1",
  "#5e5ce6",
  "#ff3b30",
  "#34c759",
  "#ff9500",
  "#ff2d55",
];

function ColorPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PRESET_DIVIDER_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          title={color}
          aria-label={`分割线颜色 ${color}`}
          aria-pressed={value === color}
          disabled={disabled}
          onClick={() => onChange(color)}
          className={[
            "w-5 h-5 rounded-full transition-all duration-150",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            value === color
              ? "ring-2 ring-offset-2 ring-[var(--color-primary)] ring-offset-[var(--color-surface)] scale-110"
              : "hover:scale-110",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            backgroundColor: color,
            border: color === "#ffffff" ? "1px solid var(--color-border)" : undefined,
          }}
        />
      ))}

      {/* Custom color input */}
      <label
        className={[
          "relative w-5 h-5 rounded-full cursor-pointer overflow-hidden",
          "ring-1 ring-[var(--color-border)]",
          "hover:scale-110 transition-transform duration-150",
          disabled ? "opacity-40 cursor-not-allowed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        title="自定义颜色"
        aria-label="自定义分割线颜色"
      >
        {/* Rainbow gradient to indicate "custom" */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
          }}
        />
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="absolute opacity-0 w-full h-full cursor-pointer top-0 left-0"
        />
      </label>
    </div>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  sublabel,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer group">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-[var(--color-text)] select-none">{label}</span>
        {sublabel && (
          <span className="text-xs text-[var(--color-text-tertiary)] select-none">
            {sublabel}
          </span>
        )}
      </div>

      {/* iOS-style toggle */}
      <div
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        tabIndex={disabled ? -1 : 0}
        className={[
          "relative w-10 h-6 rounded-full cursor-pointer select-none",
          "transition-colors duration-200",
          "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
          disabled ? "opacity-40 cursor-not-allowed" : "",
          checked ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.2)]",
            "transition-transform duration-200",
            checked ? "translate-x-4" : "translate-x-0.5",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>
    </label>
  );
}

// ─── Export Format & Scale Row ────────────────────────────────────────────────

const FORMAT_OPTIONS = EXPORT_FORMATS.map((f) => ({
  value: f,
  label: f.toUpperCase(),
}));

const SCALE_OPTIONS = EXPORT_SCALES.map((s) => ({
  value: s as ExportScale,
  label: `${s}×`,
}));

// ─── Main Component ───────────────────────────────────────────────────────────

export function ConfigPanel({
  splitConfig,
  exportConfig,
  onSplitChange,
  onExportChange,
  disabled = false,
}: ConfigPanelProps) {
  const directionOptions = SPLIT_DIRECTIONS.map((d) => ({
    value: d,
    label: SPLIT_LABELS[d],
  }));

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* ── Section: 分割 ───────────────────────────────────────────── */}
      <Section title="分割方式">
        {/* Direction */}
        <SegmentedControl<SplitDirection>
          label="对角线方向"
          options={directionOptions}
          value={splitConfig.direction}
          onChange={(v) => onSplitChange("direction", v)}
          fullWidth
        />

        {/* Offset */}
        <Slider
          label="对角线偏移"
          value={Math.round(splitConfig.offset * 100)}
          min={10}
          max={90}
          step={1}
          unit="%"
          showValue
          showMinMax
          disabled={disabled}
          onChange={(v) => onSplitChange("offset", v / 100)}
          formatValue={(v) => `${v}%`}
        />
      </Section>

      <Divider />

      {/* ── Section: 分割线 ─────────────────────────────────────────── */}
      <Section title="分割线">
        <ToggleRow
          label="显示分割线"
          sublabel="在两图交界处绘制一条线"
          checked={splitConfig.showDivider}
          onChange={(v) => onSplitChange("showDivider", v)}
          disabled={disabled}
        />

        {splitConfig.showDivider && (
          <>
            <Slider
              label="线条宽度"
              value={splitConfig.dividerWidth}
              min={1}
              max={12}
              step={0.5}
              unit="px"
              showValue
              disabled={disabled}
              onChange={(v) => onSplitChange("dividerWidth", v)}
            />

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[var(--color-text-secondary)] select-none">
                线条颜色
              </span>
              <ColorPicker
                value={splitConfig.dividerColor}
                onChange={(v) => onSplitChange("dividerColor", v)}
                disabled={disabled}
              />
            </div>
          </>
        )}
      </Section>

      <Divider />

      {/* ── Section: 导出 ───────────────────────────────────────────── */}
      <Section title="导出设置">
        {/* Format */}
        <SegmentedControl<ExportFormat>
          label="图片格式"
          options={FORMAT_OPTIONS}
          value={exportConfig.format}
          onChange={(v) => onExportChange("format", v)}
          fullWidth
        />

        {/* Scale */}
        <SegmentedControl<ExportScale>
          label="导出倍率"
          options={SCALE_OPTIONS}
          value={exportConfig.scale}
          onChange={(v) => onExportChange("scale", v)}
          fullWidth
        />

        {/* Quality (only for jpeg/webp) */}
        {exportConfig.format !== "png" && (
          <Slider
            label="压缩质量"
            value={Math.round(exportConfig.quality * 100)}
            min={50}
            max={100}
            step={1}
            unit="%"
            showValue
            disabled={disabled}
            onChange={(v) => onExportChange("quality", v / 100)}
            formatValue={(v) => `${v}%`}
          />
        )}

        {/* Filename */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="export-filename"
            className="text-xs font-medium text-[var(--color-text-secondary)] select-none"
          >
            文件名
          </label>
          <div className="flex items-center gap-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:ring-offset-0 transition-shadow">
            <input
              id="export-filename"
              type="text"
              value={exportConfig.filename}
              onChange={(e) => onExportChange("filename", e.target.value)}
              disabled={disabled}
              placeholder="icover-preview"
              spellCheck={false}
              className="flex-1 min-w-0 h-9 px-3 text-sm bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none disabled:opacity-50"
            />
            <span className="shrink-0 h-9 px-2.5 flex items-center text-xs text-[var(--color-text-tertiary)] bg-[var(--color-surface-secondary)] border-l border-[var(--color-border)] select-none font-mono">
              .{exportConfig.format}
            </span>
          </div>
        </div>
      </Section>
    </div>
  );
}
