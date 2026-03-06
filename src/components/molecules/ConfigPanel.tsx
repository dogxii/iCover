import { useState } from "react";
import { SegmentedControl } from "../atoms/SegmentedControl";
import { Slider } from "../atoms/Slider";
import type {
  BackgroundConfig,
  BgType,
  ExportConfig,
  ExportFormat,
  ExportScale,
  GradientDir,
  GradientPresetId,
  MockupConfig,
  MockupStyle,
  SplitConfig,
  SplitMode,
  WatermarkConfig,
  WatermarkPosition,
} from "../../types";
import {

  EXPORT_FORMATS,
  EXPORT_SCALES,
  GRADIENT_DIRECTIONS,
  GRADIENT_PRESETS,
  MOCKUP_STYLES,
  MOCKUP_STYLE_LABELS,
  SPLIT_MODE_LABELS,
  SPLIT_MODES,

  WATERMARK_POSITION_LABELS,
} from "../../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfigPanelProps {
  splitConfig: SplitConfig;
  background: BackgroundConfig;
  mockup: MockupConfig;
  watermark: WatermarkConfig;
  exportConfig: ExportConfig;
  onSplitChange: <K extends keyof SplitConfig>(key: K, value: SplitConfig[K]) => void;
  onBackgroundChange: <K extends keyof BackgroundConfig>(key: K, value: BackgroundConfig[K]) => void;
  onMockupChange: <K extends keyof MockupConfig>(key: K, value: MockupConfig[K]) => void;
  onWatermarkChange: <K extends keyof WatermarkConfig>(key: K, value: WatermarkConfig[K]) => void;
  onExportChange: <K extends keyof ExportConfig>(key: K, value: ExportConfig[K]) => void;
  disabled?: boolean;
}

// ─── Tab Config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "split",      label: "分割",  icon: "✂️" },
  { id: "background", label: "背景",  icon: "🎨" },
  { id: "mockup",     label: "框架",  icon: "🖥️" },
  { id: "watermark",  label: "水印",  icon: "✏️" },
  { id: "export",     label: "导出",  icon: "📤" },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ─── Reusable UI Atoms ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] select-none">
        {title}
      </h3>
      <div className="flex flex-col gap-3.5">{children}</div>
    </div>
  );
}

function SectionDivider() {
  return <div className="h-px bg-[var(--color-border)] my-0.5" />;
}

function Row({ label, sublabel, children }: {
  label: string;
  sublabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[13px] text-[var(--color-text)] select-none leading-tight truncate">{label}</span>
        {sublabel && (
          <span className="text-[11px] text-[var(--color-text-tertiary)] select-none leading-tight">
            {sublabel}
          </span>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      className={[
        "relative w-10 h-6 rounded-full cursor-pointer select-none shrink-0",
        "transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
        disabled ? "opacity-40 cursor-not-allowed" : "",
        checked ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]",
      ].filter(Boolean).join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.2)]",
          "transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0.5",
        ].join(" ")}
      />
    </div>
  );
}

const PRESET_COLORS = [
  "#ffffff", "#000000", "#0064d1", "#5e5ce6",
  "#ff3b30", "#34c759", "#ff9500", "#ff2d55",
  "#a78bfa", "#fbbf24",
];

function ColorSwatches({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (c: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          title={c}
          aria-label={`颜色 ${c}`}
          aria-pressed={value === c}
          disabled={disabled}
          onClick={() => onChange(c)}
          className={[
            "w-5 h-5 rounded-full transition-all duration-150",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            value === c
              ? "ring-2 ring-offset-2 ring-[var(--color-primary)] ring-offset-[var(--color-surface)] scale-110"
              : "hover:scale-110",
          ].filter(Boolean).join(" ")}
          style={{
            backgroundColor: c,
            border: c === "#ffffff" ? "1px solid var(--color-border)" : undefined,
          }}
        />
      ))}
      {/* Custom color */}
      <label
        className="relative w-5 h-5 rounded-full cursor-pointer overflow-hidden ring-1 ring-[var(--color-border)] hover:scale-110 transition-transform duration-150"
        title="自定义颜色"
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
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

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div
      className="flex border-b"
      style={{ borderColor: "var(--color-border)" }}
      role="tablist"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={[
              "flex-1 flex flex-col items-center gap-0.5 py-2 px-1",
              "text-[9px] font-semibold select-none cursor-pointer transition-all duration-150",
              "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
              "border-b-2 -mb-px",
              isActive
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]",
            ].join(" ")}
          >
            <span className="text-sm leading-none" aria-hidden="true">{tab.icon}</span>
            <span className="uppercase tracking-wider leading-none">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Split Tab ────────────────────────────────────────────────────────────────



function SplitTab({
  config,
  onChange,
  disabled,
}: {
  config: SplitConfig;
  onChange: <K extends keyof SplitConfig>(key: K, value: SplitConfig[K]) => void;
  disabled: boolean;
}) {
  const isWave = config.mode === "wave";
  const isArc = config.mode === "arc";
  const isCurved = isWave || isArc;

  return (
    <div className="flex flex-col gap-4">
      <Section title="分割模式">
        {/* Mode grid — 3 × 2 */}
        <div className="grid grid-cols-3 gap-1.5">
          {SPLIT_MODES.map((m) => {
            const isActive = config.mode === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={isActive}
                disabled={disabled}
                onClick={() => onChange("mode", m as SplitMode)}
                className={[
                  "flex flex-col items-center gap-1 py-2 px-1 rounded-[var(--radius-sm)]",
                  "border text-center select-none cursor-pointer transition-all duration-150",
                  "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-1",
                  "disabled:opacity-40",
                  isActive
                    ? "border-[var(--color-primary)] bg-[rgba(0,100,209,0.08)] text-[var(--color-primary)]"
                    : "border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)] hover:text-[var(--color-text)]",
                ].filter(Boolean).join(" ")}
              >
                <span className="text-base leading-none">{SPLIT_MODE_LABELS[m].split(" ")[0]}</span>
                <span className="text-[9px] font-medium leading-none">
                  {SPLIT_MODE_LABELS[m].split(" ").slice(1).join(" ") || m.replace("diagonal-", "↘")}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <SectionDivider />

      <Section title="位置">
        <Slider
          label="偏移量"
          value={Math.round(config.offset * 100)}
          min={10} max={90} step={1} unit="%"
          showValue showMinMax
          disabled={disabled}
          onChange={(v) => onChange("offset", v / 100)}
          formatValue={(v) => `${v}%`}
        />

        {isCurved && (
          <Slider
            label="振幅"
            value={Math.round(config.waveAmplitude * 100)}
            min={2} max={25} step={1} unit="%"
            showValue
            disabled={disabled}
            onChange={(v) => onChange("waveAmplitude", v / 100)}
            formatValue={(v) => `${v}%`}
          />
        )}

        {isWave && (
          <Slider
            label="频率"
            value={config.waveFrequency}
            min={0.5} max={4} step={0.5}
            showValue
            disabled={disabled}
            onChange={(v) => onChange("waveFrequency", v)}
            formatValue={(v) => `${v}x`}
          />
        )}
      </Section>

      <SectionDivider />

      <Section title="分割线">
        <Row label="显示分割线">
          <Toggle
            checked={config.showDivider}
            onChange={(v) => onChange("showDivider", v)}
            disabled={disabled}
          />
        </Row>

        {config.showDivider && (
          <>
            <Slider
              label="线宽"
              value={config.dividerWidth}
              min={0.5} max={12} step={0.5} unit="px"
              showValue
              disabled={disabled}
              onChange={(v) => onChange("dividerWidth", v)}
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary)] select-none">
                线条颜色
              </span>
              <ColorSwatches
                value={config.dividerColor}
                onChange={(v) => onChange("dividerColor", v)}
                disabled={disabled}
              />
            </div>
          </>
        )}
      </Section>
    </div>
  );
}

// ─── Background Tab ───────────────────────────────────────────────────────────

const BG_TYPE_OPTIONS: { value: BgType; label: string }[] = [
  { value: "none",     label: "无" },
  { value: "solid",    label: "纯色" },
  { value: "gradient", label: "渐变" },
  { value: "mesh",     label: "网格" },
];

const GRADIENT_DIR_OPTIONS = GRADIENT_DIRECTIONS.map((d) => ({
  value: d.id as GradientDir,
  label: d.label,
}));

function BackgroundTab({
  config,
  onChange,
}: {
  config: BackgroundConfig;
  onChange: <K extends keyof BackgroundConfig>(key: K, value: BackgroundConfig[K]) => void;
}) {
  const hasBg = config.type !== "none";
  const isGradient = config.type === "gradient" || config.type === "mesh";

  return (
    <div className="flex flex-col gap-4">
      <Section title="背景类型">
        <SegmentedControl<BgType>
          options={BG_TYPE_OPTIONS}
          value={config.type}
          onChange={(v) => onChange("type", v)}
          fullWidth
        />
      </Section>

      {config.type === "solid" && (
        <>
          <SectionDivider />
          <Section title="颜色">
            <ColorSwatches
              value={config.solidColor}
              onChange={(v) => onChange("solidColor", v)}
            />
          </Section>
        </>
      )}

      {isGradient && (
        <>
          <SectionDivider />
          <Section title="渐变">
            {/* Gradient preset swatches */}
            <div className="grid grid-cols-4 gap-1.5">
              {GRADIENT_PRESETS.map((p) => {
                const isActive = config.gradientPreset === p.id && !config.useCustomGradient;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-label={p.label}
                    aria-pressed={isActive}
                    onClick={() => {
                      onChange("gradientPreset", p.id as GradientPresetId);
                      onChange("useCustomGradient", false);
                    }}
                    className={[
                      "relative h-8 rounded-[var(--radius-sm)] cursor-pointer transition-all duration-150",
                      "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
                      isActive
                        ? "ring-2 ring-[var(--color-primary)] ring-offset-1 ring-offset-[var(--color-surface)] scale-[1.05]"
                        : "hover:scale-[1.05] opacity-80 hover:opacity-100",
                    ].filter(Boolean).join(" ")}
                    style={{
                      background: `linear-gradient(135deg, ${p.stops[0]}, ${p.stops[1]})`,
                    }}
                    title={p.label}
                  >
                    {isActive && (
                      <div className="absolute inset-0 flex items-end justify-center pb-0.5">
                        <span className="text-[8px] font-bold text-white drop-shadow-md select-none">
                          ✓
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom gradient toggle */}
            <Row label="自定义颜色">
              <Toggle
                checked={config.useCustomGradient}
                onChange={(v) => onChange("useCustomGradient", v)}
              />
            </Row>

            {config.useCustomGradient && (
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-[10px] text-[var(--color-text-tertiary)] select-none">起始色</span>
                  <input
                    type="color"
                    value={config.gradientCustomA}
                    onChange={(e) => onChange("gradientCustomA", e.target.value)}
                    className="w-full h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-[10px] text-[var(--color-text-tertiary)] select-none">结束色</span>
                  <input
                    type="color"
                    value={config.gradientCustomB}
                    onChange={(e) => onChange("gradientCustomB", e.target.value)}
                    className="w-full h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Direction */}
            <SegmentedControl<GradientDir>
              label="渐变方向"
              options={GRADIENT_DIR_OPTIONS}
              value={config.gradientDir}
              onChange={(v) => onChange("gradientDir", v)}
              fullWidth
            />
          </Section>
        </>
      )}

      {hasBg && (
        <>
          <SectionDivider />
          <Section title="图片修饰">
            <Slider
              label="内边距"
              value={config.padding}
              min={0} max={120} step={4} unit="px"
              showValue
              onChange={(v) => onChange("padding", v)}
            />
            <Slider
              label="圆角"
              value={config.cornerRadius}
              min={0} max={40} step={2} unit="px"
              showValue
              onChange={(v) => onChange("cornerRadius", v)}
            />
            <Row label="投影">
              <Toggle
                checked={config.shadow}
                onChange={(v) => onChange("shadow", v)}
              />
            </Row>
            {config.shadow && (
              <Slider
                label="阴影强度"
                value={Math.round(config.shadowIntensity * 100)}
                min={10} max={100} step={5} unit="%"
                showValue
                onChange={(v) => onChange("shadowIntensity", v / 100)}
                formatValue={(v) => `${v}%`}
              />
            )}
          </Section>
        </>
      )}
    </div>
  );
}

// ─── Mockup Tab ───────────────────────────────────────────────────────────────

const MOCKUP_OPTIONS = MOCKUP_STYLES.map((s) => ({
  value: s as MockupStyle,
  label: MOCKUP_STYLE_LABELS[s],
}));

function MockupTab({
  config,
  onChange,
}: {
  config: MockupConfig;
  onChange: <K extends keyof MockupConfig>(key: K, value: MockupConfig[K]) => void;
}) {
  const hasMockup = config.style !== "none";

  return (
    <div className="flex flex-col gap-4">
      <Section title="框架样式">
        <div className="flex flex-col gap-1.5">
          {MOCKUP_OPTIONS.map((opt) => {
            const isActive = config.style === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onChange("style", opt.value)}
                className={[
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-md)]",
                  "border text-left select-none cursor-pointer transition-all duration-150",
                  "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-1",
                  isActive
                    ? "border-[var(--color-primary)] bg-[rgba(0,100,209,0.07)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]",
                ].filter(Boolean).join(" ")}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: isActive ? "var(--color-primary)" : "var(--color-border)",
                  }}
                />
                <span
                  className="text-[13px] font-medium"
                  style={{
                    color: isActive ? "var(--color-primary)" : "var(--color-text)",
                  }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {hasMockup && (
        <>
          <SectionDivider />
          <Section title="标题栏">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="mockup-url"
                className="text-[11px] font-medium text-[var(--color-text-secondary)] select-none"
              >
                {config.style === "window-macos" ? "窗口标题" : "地址栏文字"}
              </label>
              <input
                id="mockup-url"
                type="text"
                value={config.urlText}
                onChange={(e) => onChange("urlText", e.target.value)}
                placeholder={config.style === "window-macos" ? "My App" : "your-app.vercel.app"}
                spellCheck={false}
                className="h-9 px-3 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
              />
            </div>
            {config.style !== "window-macos" && (
              <Row label="光泽效果">
                <Toggle
                  checked={config.gloss}
                  onChange={(v) => onChange("gloss", v)}
                />
              </Row>
            )}
          </Section>
        </>
      )}
    </div>
  );
}

// ─── Watermark Tab ────────────────────────────────────────────────────────────

const FONT_WEIGHT_OPTIONS = [
  { value: "400" as const, label: "细" },
  { value: "600" as const, label: "中" },
  { value: "700" as const, label: "粗" },
  { value: "800" as const, label: "黑" },
];

const POSITION_GRID: { value: WatermarkPosition; label: string; row: number; col: number }[] = [
  { value: "top-left",      label: "↖", row: 0, col: 0 },
  { value: "top-center",    label: "↑", row: 0, col: 1 },
  { value: "top-right",     label: "↗", row: 0, col: 2 },
  { value: "bottom-left",   label: "↙", row: 1, col: 0 },
  { value: "bottom-center", label: "↓", row: 1, col: 1 },
  { value: "bottom-right",  label: "↘", row: 1, col: 2 },
];

function WatermarkTab({
  config,
  onChange,
}: {
  config: WatermarkConfig;
  onChange: <K extends keyof WatermarkConfig>(key: K, value: WatermarkConfig[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Section title="水印">
        <Row label="启用水印">
          <Toggle
            checked={config.enabled}
            onChange={(v) => onChange("enabled", v)}
          />
        </Row>
      </Section>

      {config.enabled && (
        <>
          <SectionDivider />
          <Section title="文字内容">
            <input
              type="text"
              value={config.text}
              onChange={(e) => onChange("text", e.target.value)}
              placeholder="Made with iCover"
              spellCheck={false}
              className="h-9 px-3 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
            />
          </Section>

          <SectionDivider />
          <Section title="样式">
            <Slider
              label="字号"
              value={config.fontSize}
              min={10} max={72} step={2} unit="px"
              showValue
              onChange={(v) => onChange("fontSize", v)}
            />

            <SegmentedControl<"400" | "600" | "700" | "800">
              label="字重"
              options={FONT_WEIGHT_OPTIONS}
              value={config.fontWeight}
              onChange={(v) => onChange("fontWeight", v)}
              fullWidth
            />

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary)] select-none">
                文字颜色
              </span>
              <ColorSwatches
                value={config.color}
                onChange={(v) => onChange("color", v)}
              />
            </div>

            <Slider
              label="不透明度"
              value={Math.round(config.opacity * 100)}
              min={10} max={100} step={5} unit="%"
              showValue
              onChange={(v) => onChange("opacity", v / 100)}
              formatValue={(v) => `${v}%`}
            />
          </Section>

          <SectionDivider />
          <Section title="位置">
            {/* 2×3 position grid */}
            <div className="grid grid-cols-3 gap-1.5">
              {POSITION_GRID.map((pos) => {
                const isActive = config.position === pos.value;
                return (
                  <button
                    key={pos.value}
                    type="button"
                    aria-label={WATERMARK_POSITION_LABELS[pos.value]}
                    aria-pressed={isActive}
                    onClick={() => onChange("position", pos.value as WatermarkPosition)}
                    className={[
                      "flex items-center justify-center h-9 rounded-[var(--radius-sm)]",
                      "border text-base select-none cursor-pointer transition-all duration-150",
                      "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-1",
                      isActive
                        ? "border-[var(--color-primary)] bg-[rgba(0,100,209,0.1)] text-[var(--color-primary)]"
                        : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]",
                    ].filter(Boolean).join(" ")}
                  >
                    {pos.label}
                  </button>
                );
              })}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

// ─── Export Tab ───────────────────────────────────────────────────────────────

const FORMAT_OPTIONS = EXPORT_FORMATS.map((f) => ({
  value: f,
  label: f.toUpperCase(),
}));

const SCALE_OPTIONS = EXPORT_SCALES.map((s) => ({
  value: s as ExportScale,
  label: `${s}×`,
}));

function ExportTab({
  config,
  onChange,
  disabled,
}: {
  config: ExportConfig;
  onChange: <K extends keyof ExportConfig>(key: K, value: ExportConfig[K]) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Section title="格式与质量">
        <SegmentedControl<ExportFormat>
          label="图片格式"
          options={FORMAT_OPTIONS}
          value={config.format}
          onChange={(v) => onChange("format", v)}
          fullWidth
        />

        <SegmentedControl<ExportScale>
          label="导出倍率"
          options={SCALE_OPTIONS}
          value={config.scale}
          onChange={(v) => onChange("scale", v)}
          fullWidth
        />

        {config.format !== "png" && (
          <Slider
            label="压缩质量"
            value={Math.round(config.quality * 100)}
            min={50} max={100} step={1} unit="%"
            showValue
            disabled={disabled}
            onChange={(v) => onChange("quality", v / 100)}
            formatValue={(v) => `${v}%`}
          />
        )}
      </Section>

      <SectionDivider />

      <Section title="文件名">
        <div className="flex items-stretch rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-primary)] transition-shadow">
          <input
            id="export-filename"
            type="text"
            value={config.filename}
            onChange={(e) => onChange("filename", e.target.value)}
            disabled={disabled}
            placeholder="icover-preview"
            spellCheck={false}
            className="flex-1 min-w-0 h-9 px-3 text-sm bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none disabled:opacity-50"
          />
          <span className="shrink-0 h-9 px-2.5 flex items-center text-xs text-[var(--color-text-tertiary)] bg-[var(--color-surface-secondary)] border-l border-[var(--color-border)] select-none font-mono">
            .{config.format}
          </span>
        </div>
      </Section>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ConfigPanel({
  splitConfig,
  background,
  mockup,
  watermark,
  exportConfig,
  onSplitChange,
  onBackgroundChange,
  onMockupChange,
  onWatermarkChange,
  onExportChange,
  disabled = false,
}: ConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("split");

  return (
    <div className="flex flex-col">
      <TabBar active={activeTab} onChange={setActiveTab} />

      <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
        {activeTab === "split" && (
          <SplitTab config={splitConfig} onChange={onSplitChange} disabled={disabled} />
        )}
        {activeTab === "background" && (
          <BackgroundTab config={background} onChange={onBackgroundChange} />
        )}
        {activeTab === "mockup" && (
          <MockupTab config={mockup} onChange={onMockupChange} />
        )}
        {activeTab === "watermark" && (
          <WatermarkTab config={watermark} onChange={onWatermarkChange} />
        )}
        {activeTab === "export" && (
          <ExportTab config={exportConfig} onChange={onExportChange} disabled={disabled} />
        )}
      </div>
    </div>
  );
}
