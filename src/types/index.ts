// ─── Image ───────────────────────────────────────────────────────────────────

export interface ImageFile {
  id: "light" | "dark";
  file: File;
  url: string;
  width: number;
  height: number;
}

// ─── Split Config ─────────────────────────────────────────────────────────────

export const SPLIT_DIRECTIONS = ["diagonal-lr", "diagonal-rl"] as const;
export type SplitDirection = (typeof SPLIT_DIRECTIONS)[number];

export const SPLIT_LABELS: Record<SplitDirection, string> = {
  "diagonal-lr": "↘ 左上 → 右下",
  "diagonal-rl": "↙ 右上 → 左下",
};

export interface SplitConfig {
  direction: SplitDirection;
  /** 0–1，对角线锚点位置（默认 0.5 = 正中心） */
  offset: number;
  /** 像素，两图交界处的羽化宽度 */
  feather: number;
  /** 是否显示分界线描边 */
  showDivider: boolean;
  dividerColor: string;
  dividerWidth: number;
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
  exportConfig: ExportConfig;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SPLIT_CONFIG: SplitConfig = {
  direction: "diagonal-lr",
  offset: 0.5,
  feather: 0,
  showDivider: false,
  dividerColor: "#ffffff",
  dividerWidth: 2,
};

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  format: "png",
  scale: 2,
  quality: 0.92,
  filename: "icover-preview",
};
