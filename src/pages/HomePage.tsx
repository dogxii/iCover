import { useCallback, useState } from "react";
import { ImageDropZone } from "../components/molecules/ImageDropZone";
import { ConfigPanel } from "../components/molecules/ConfigPanel";
import { PreviewCanvas } from "../components/molecules/PreviewCanvas";
import { useImageUpload } from "../hooks/useImageUpload";
import type { ExportConfig, SplitConfig } from "../types";
import { DEFAULT_EXPORT_CONFIG, DEFAULT_SPLIT_CONFIG } from "../types";

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  children,
  noPadding = false,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  return (
    <div
      className="flex flex-col surface overflow-hidden"
      style={{ boxShadow: "0 1px 4px var(--color-shadow)" }}
    >
      {(title || subtitle) && (
        <div
          className="flex flex-col gap-0.5 px-4 pt-4 pb-3"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          {title && (
            <h2 className="text-sm font-semibold text-[var(--color-text)] leading-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-[var(--color-text-tertiary)] leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={noPadding ? "" : "p-4"}>{children}</div>
    </div>
  );
}

// ─── Step Badge ───────────────────────────────────────────────────────────────

function StepBadge({ step, label }: { step: number; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 select-none">
      <div
        className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white shrink-0"
        style={{ background: "var(--color-primary)" }}
        aria-hidden="true"
      >
        {step}
      </div>
      <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HomePage() {
  const [splitConfig, setSplitConfig] = useState<SplitConfig>(DEFAULT_SPLIT_CONFIG);
  const [exportConfig, setExportConfig] = useState<ExportConfig>(DEFAULT_EXPORT_CONFIG);
  const [isExporting, setIsExporting] = useState(false);

  const {
    images,
    isDragging,
    removeImage,
    getInputProps,
    getInputRef,
    getDragProps,
    openFilePicker,
  } = useImageUpload();

  const handleSplitChange = useCallback(
    <K extends keyof SplitConfig>(key: K, value: SplitConfig[K]) => {
      setSplitConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleExportChange = useCallback(
    <K extends keyof ExportConfig>(key: K, value: ExportConfig[K]) => {
      setExportConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const hasBoth = !!images.light && !!images.dark;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-slide-up">
      {/* ── Hero tagline ──────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-1 select-none">
        <h1 className="text-xl font-bold text-[var(--color-text)] tracking-tight leading-tight">
          生成炫酷的 README 封面图
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          上传亮色 / 暗色截图，对角线合成为一张精美展示图 &mdash; 无需安装，纯本地处理
        </p>
      </div>

      {/* ── Main layout ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_220px_1fr] gap-4 items-start">

        {/* ── Column 1: Upload ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div>
            <StepBadge step={1} label="上传截图" />
            <div className="flex flex-col gap-4">
              {/* Light slot */}
              <SectionCard>
                <ImageDropZone
                  id="light"
                  image={images.light}
                  isDragging={isDragging.light}
                  onRemove={() => removeImage("light")}
                  openFilePicker={() => openFilePicker("light")}
                  inputProps={getInputProps("light")}
                  inputRef={getInputRef("light")}
                  dragProps={getDragProps("light")}
                />
              </SectionCard>

              {/* Dark slot */}
              <SectionCard>
                <ImageDropZone
                  id="dark"
                  image={images.dark}
                  isDragging={isDragging.dark}
                  onRemove={() => removeImage("dark")}
                  openFilePicker={() => openFilePicker("dark")}
                  inputProps={getInputProps("dark")}
                  inputRef={getInputRef("dark")}
                  dragProps={getDragProps("dark")}
                />
              </SectionCard>
            </div>
          </div>

          {/* Progress indicator */}
          <UploadProgress hasLight={!!images.light} hasDark={!!images.dark} />
        </div>

        {/* ── Column 2: Config ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div>
            <StepBadge step={2} label="调整参数" />
            <SectionCard noPadding>
              <ConfigPanel
                splitConfig={splitConfig}
                exportConfig={exportConfig}
                onSplitChange={handleSplitChange}
                onExportChange={handleExportChange}
                disabled={!hasBoth}
              />
            </SectionCard>
          </div>
        </div>

        {/* ── Column 3: Preview + Export ────────────────────────────────── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-[calc(56px+1.5rem)]">
          <div>
            <StepBadge step={3} label="预览 &amp; 导出" />
            <SectionCard noPadding>
              <div className="p-4">
                <PreviewCanvas
                  images={images}
                  splitConfig={splitConfig}
                  exportConfig={exportConfig}
                  isExporting={isExporting}
                  onExportStart={() => setIsExporting(true)}
                  onExportEnd={() => setIsExporting(false)}
                />
              </div>
            </SectionCard>
          </div>

          {/* Usage tip */}
          {hasBoth && (
            <UsageTip format={exportConfig.format} filename={exportConfig.filename} />
          )}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="mt-10 pb-4 flex items-center justify-between text-[11px] text-[var(--color-text-tertiary)] select-none">
        <span>
          iCover &mdash; 一切处理在本地完成，不上传任何图片
        </span>
        <span className="font-mono">
          v{import.meta.env.APP_VERSION ?? "0.1.0"}
        </span>
      </footer>
    </main>
  );
}

// ─── Upload Progress ──────────────────────────────────────────────────────────

function UploadProgress({
  hasLight,
  hasDark,
}: {
  hasLight: boolean;
  hasDark: boolean;
}) {
  const count = (hasLight ? 1 : 0) + (hasDark ? 1 : 0);

  if (count === 2) return null;

  return (
    <div
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-md)] animate-fade-in"
      style={{
        background: "var(--color-surface-secondary)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Mini progress bar */}
      <div
        className="flex-1 h-1 rounded-full overflow-hidden"
        style={{ background: "var(--color-border)" }}
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={2}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(count / 2) * 100}%`,
            background: "var(--color-primary)",
          }}
        />
      </div>
      <span className="text-xs text-[var(--color-text-secondary)] shrink-0 tabular-nums">
        {count} / 2
      </span>
    </div>
  );
}

// ─── Usage Tip ────────────────────────────────────────────────────────────────

function UsageTip({
  format,
  filename,
}: {
  format: string;
  filename: string;
}) {
  const mdSnippet = `![Preview](./${filename}.${format})`;

  function handleCopy() {
    try {
      navigator.clipboard.writeText(mdSnippet);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = mdSnippet;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  }

  return (
    <div
      className="flex flex-col gap-2 px-3.5 py-3 rounded-[var(--radius-md)] animate-fade-in"
      style={{
        background: "rgba(0, 100, 209, 0.05)",
        border: "1px solid rgba(0, 100, 209, 0.15)",
      }}
    >
      <span className="text-[11px] font-semibold text-[var(--color-primary)] uppercase tracking-wider select-none">
        放入 README
      </span>
      <div className="flex items-center gap-2">
        <code
          className="flex-1 min-w-0 text-[11px] font-mono text-[var(--color-text-secondary)] truncate select-all"
          title={mdSnippet}
        >
          {mdSnippet}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="复制 Markdown 代码"
          className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-md text-[var(--color-primary)] hover:bg-[rgba(0,100,209,0.1)] active:bg-[rgba(0,100,209,0.18)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] cursor-pointer select-none"
        >
          复制
        </button>
      </div>
    </div>
  );
}
