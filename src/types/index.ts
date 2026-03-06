// ─── Image ───────────────────────────────────────────────────────────────────

export interface ImageFile {
  id: "light" | "dark";
  file: File;
  url: string;
  width: number;
  height: number;
}

// ─── Split Mode ───────────────────────────────────────────────────────────────

export const SPLIT_MODES = [
  "diagonal-lr",
  "diagonal-rl",
  "horizontal",
  "vertical",
  "arc",
  "wave",
] as const;
export type SplitMode = (typeof SPLIT_MODES)[number];

export const SPLIT_MODE_LABELS: Record<SplitMode, string> = {
  "diagonal-lr": "↘ 对角",
  "diagonal-rl": "↙ 对角",
  horizontal:    "— 水平",
  vertical:      "| 垂直",
  arc:           "⌒ 弧形",
  wave:          "〜 波浪",
};

export const SPLIT_MODE_ICONS: Record<SplitMode, string> = {
  "diagonal-lr": "↘",
  "diagonal-rl": "↙",
  horizontal:    "—",
  vertical:      "|",
  arc:           "⌒",
  wave:          "〜",
};

// ─── Split Config ─────────────────────────────────────────────────────────────

// Keep legacy alias so existing canvas.ts doesn't break
export type SplitDirection = Extract<SplitMode, "diagonal-lr" | "diagonal-rl">;
export const SPLIT_DIRECTIONS = ["diagonal-lr", "diagonal-rl"] as const;
export const SPLIT_LABELS: Record<SplitDirection, string> = {
  "diagonal-lr": "↘ 左上 → 右下",
  "diagonal-rl": "↙ 右上 → 左下",
};

export interface SplitConfig {
  mode: SplitMode;
  /** 0–1，分割线位置（默认 0.5 = 正中心） */
  offset: number;
  /** 像素，交界处羽化宽度（0 = 硬切） */
  feather: number;
  /** 是否显示分界描边 */
  showDivider: boolean;
  dividerColor: string;
  dividerWidth: number;
  /** 波浪/弧形专属：振幅系数 0–1 */
  waveAmplitude: number;
  /** 波浪专属：频率（完整波形数） */
  waveFrequency: number;
}

// ─── Background Config ────────────────────────────────────────────────────────

export const BG_TYPES = ["none", "solid", "gradient", "mesh"] as const;
export type BgType = (typeof BG_TYPES)[number];

export const GRADIENT_PRESETS = [
  { id: "ocean",   label: "Ocean",   stops: ["#667eea", "#764ba2"] },
  { id: "sunset",  label: "Sunset",  stops: ["#f093fb", "#f5576c"] },
  { id: "forest",  label: "Forest",  stops: ["#4facfe", "#00f2fe"] },
  { id: "fire",    label: "Fire",    stops: ["#f7971e", "#ffd200"] },
  { id: "night",   label: "Night",   stops: ["#0f0c29", "#302b63"] },
  { id: "aurora",  label: "Aurora",  stops: ["#00b4db", "#0083b0"] },
  { id: "candy",   label: "Candy",   stops: ["#a18cd1", "#fbc2eb"] },
  { id: "carbon",  label: "Carbon",  stops: ["#1a1a2e", "#16213e"] },
] as const;
export type GradientPresetId = (typeof GRADIENT_PRESETS)[number]["id"];

export const GRADIENT_DIRECTIONS = [
  { id: "to-br",     label: "↘" },
  { id: "to-r",      label: "→" },
  { id: "to-b",      label: "↓" },
  { id: "to-tr",     label: "↗" },
] as const;
export type GradientDir = (typeof GRADIENT_DIRECTIONS)[number]["id"];

export interface BackgroundConfig {
  type: BgType;
  solidColor: string;
  gradientPreset: GradientPresetId;
  gradientDir: GradientDir;
  gradientCustomA: string;
  gradientCustomB: string;
  useCustomGradient: boolean;
  /** 图片距背景边缘的内边距，px（需 type !== "none"） */
  padding: number;
  /** 图片圆角，px */
  cornerRadius: number;
  /** 图片投影 */
  shadow: boolean;
  shadowIntensity: number; // 0–1
}

// ─── Mockup Config ────────────────────────────────────────────────────────────

export const MOCKUP_STYLES = ["none", "browser", "browser-dark", "window-macos"] as const;
export type MockupStyle = (typeof MOCKUP_STYLES)[number];

export const MOCKUP_STYLE_LABELS: Record<MockupStyle, string> = {
  none:            "无框架",
  browser:         "浏览器（亮）",
  "browser-dark":  "浏览器（暗）",
  "window-macos":  "macOS 窗口",
};

export interface MockupConfig {
  style: MockupStyle;
  /** mockup 标题栏中显示的 URL / 标题 */
  urlText: string;
  /** 是否在标题栏显示反射光泽 */
  gloss: boolean;
}

// ─── Watermark / Title Config ─────────────────────────────────────────────────

export const WATERMARK_POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const;
export type WatermarkPosition = (typeof WATERMARK_POSITIONS)[number];

export const WATERMARK_POSITION_LABELS: Record<WatermarkPosition, string> = {
  "top-left":       "左上",
  "top-center":     "居上",
  "top-right":      "右上",
  "bottom-left":    "左下",
  "bottom-center":  "居下",
  "bottom-right":   "右下",
};

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  fontSize: number;        // px，相对于 canvas 宽度的比例 × 1000
  fontWeight: "400" | "600" | "700" | "800";
  color: string;
  position: WatermarkPosition;
  offsetX: number;         // 0–1 水平微调
  offsetY: number;         // 0–1 垂直微调
  /** 背景色，空字符串 = 透明 */
  bgColor: string;
  opacity: number;         // 0–1
}

// ─── Preset Templates ────────────────────────────────────────────────────────

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  splitConfig: SplitConfig;
  background: BackgroundConfig;
  mockup: MockupConfig;
  watermark: WatermarkConfig;
}

// ─── Export Config ────────────────────────────────────────────────────────────

export const EXPORT_FORMATS = ["png", "jpeg", "webp"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const EXPORT_SCALES = [1, 1.5, 2, 3] as const;
export type ExportScale = (typeof EXPORT_SCALES)[number];

export interface ExportConfig {
  format: ExportFormat;
  scale: ExportScale;
  quality: number; // 0–1，仅 jpeg/webp 有效
  filename: string;
}

// ─── Theme ────────────────────────────────────────────────────────────────────

export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

// ─── App State ────────────────────────────────────────────────────────────────

export interface AppState {
  images: Partial<Record<ImageFile["id"], ImageFile>>;
  splitConfig: SplitConfig;
  background: BackgroundConfig;
  mockup: MockupConfig;
  watermark: WatermarkConfig;
  exportConfig: ExportConfig;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SPLIT_CONFIG: SplitConfig = {
  mode: "diagonal-lr",
  offset: 0.5,
  feather: 0,
  showDivider: false,
  dividerColor: "#ffffff",
  dividerWidth: 2,
  waveAmplitude: 0.08,
  waveFrequency: 1.5,
};

export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  type: "none",
  solidColor: "#1a1a2e",
  gradientPreset: "ocean",
  gradientDir: "to-br",
  gradientCustomA: "#667eea",
  gradientCustomB: "#764ba2",
  useCustomGradient: false,
  padding: 40,
  cornerRadius: 12,
  shadow: true,
  shadowIntensity: 0.5,
};

export const DEFAULT_MOCKUP_CONFIG: MockupConfig = {
  style: "none",
  urlText: "your-app.vercel.app",
  gloss: true,
};

export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  enabled: false,
  text: "Made with iCover",
  fontSize: 18,
  fontWeight: "600",
  color: "#ffffff",
  position: "bottom-right",
  offsetX: 0,
  offsetY: 0,
  bgColor: "",
  opacity: 0.8,
};

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  format: "png",
  scale: 2,
  quality: 0.92,
  filename: "icover-preview",
};

// ─── Preset Data ──────────────────────────────────────────────────────────────

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "干净对角切割，无背景装饰",
    emoji: "⬜",
    splitConfig: {
      ...DEFAULT_SPLIT_CONFIG,
      mode: "diagonal-lr",
      showDivider: false,
    },
    background: {
      ...DEFAULT_BACKGROUND_CONFIG,
      type: "none",
    },
    mockup: { ...DEFAULT_MOCKUP_CONFIG, style: "none" },
    watermark: { ...DEFAULT_WATERMARK_CONFIG, enabled: false },
  },
  {
    id: "browser-glass",
    name: "Browser",
    description: "浏览器框架 + 渐变背景",
    emoji: "🌐",
    splitConfig: {
      ...DEFAULT_SPLIT_CONFIG,
      mode: "diagonal-lr",
      offset: 0.48,
    },
    background: {
      ...DEFAULT_BACKGROUND_CONFIG,
      type: "gradient",
      gradientPreset: "ocean",
      padding: 48,
      cornerRadius: 16,
      shadow: true,
    },
    mockup: {
      style: "browser",
      urlText: "your-app.vercel.app",
      gloss: true,
    },
    watermark: { ...DEFAULT_WATERMARK_CONFIG, enabled: false },
  },
  {
    id: "macos-night",
    name: "macOS",
    description: "macOS 窗口框架 + 深色背景",
    emoji: "🖥️",
    splitConfig: {
      ...DEFAULT_SPLIT_CONFIG,
      mode: "diagonal-rl",
      offset: 0.52,
    },
    background: {
      ...DEFAULT_BACKGROUND_CONFIG,
      type: "gradient",
      gradientPreset: "night",
      padding: 52,
      cornerRadius: 12,
      shadow: true,
      shadowIntensity: 0.7,
    },
    mockup: {
      style: "window-macos",
      urlText: "My App",
      gloss: false,
    },
    watermark: { ...DEFAULT_WATERMARK_CONFIG, enabled: false },
  },
  {
    id: "wave-aurora",
    name: "Wave",
    description: "波浪分割 + Aurora 渐变",
    emoji: "🌊",
    splitConfig: {
      ...DEFAULT_SPLIT_CONFIG,
      mode: "wave",
      offset: 0.5,
      waveAmplitude: 0.1,
      waveFrequency: 1.5,
    },
    background: {
      ...DEFAULT_BACKGROUND_CONFIG,
      type: "gradient",
      gradientPreset: "aurora",
      padding: 44,
      cornerRadius: 14,
      shadow: true,
    },
    mockup: { ...DEFAULT_MOCKUP_CONFIG, style: "none" },
    watermark: { ...DEFAULT_WATERMARK_CONFIG, enabled: false },
  },
  {
    id: "arc-candy",
    name: "Arc",
    description: "弧形切割 + 糖果渐变",
    emoji: "🌸",
    splitConfig: {
      ...DEFAULT_SPLIT_CONFIG,
      mode: "arc",
      offset: 0.5,
      waveAmplitude: 0.15,
    },
    background: {
      ...DEFAULT_BACKGROUND_CONFIG,
      type: "gradient",
      gradientPreset: "candy",
      padding: 44,
      cornerRadius: 18,
      shadow: true,
    },
    mockup: { ...DEFAULT_MOCKUP_CONFIG, style: "none" },
    watermark: { ...DEFAULT_WATERMARK_CONFIG, enabled: false },
  },
  {
    id: "neon-vertical",
    name: "Neon",
    description: "垂直分割 + 霓虹渐变 + 标题水印",
    emoji: "⚡",
    splitConfig: {
      ...DEFAULT_SPLIT_CONFIG,
      mode: "vertical",
      offset: 0.5,
      showDivider: true,
      dividerColor: "#a78bfa",
      dividerWidth: 2,
    },
    background: {
      ...DEFAULT_BACKGROUND_CONFIG,
      type: "gradient",
      gradientPreset: "night",
      padding: 48,
      cornerRadius: 12,
      shadow: true,
      shadowIntensity: 0.8,
    },
    mockup: { ...DEFAULT_MOCKUP_CONFIG, style: "none" },
    watermark: {
      enabled: true,
      text: "YOUR APP",
      fontSize: 28,
      fontWeight: "800",
      color: "#a78bfa",
      position: "bottom-center",
      offsetX: 0,
      offsetY: 0,
      bgColor: "",
      opacity: 0.95,
    },
  },
];
