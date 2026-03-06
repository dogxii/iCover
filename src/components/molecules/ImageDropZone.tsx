import type { ImageFile } from "../../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageDropZoneProps {
  id: ImageFile["id"];
  image?: ImageFile;
  isDragging?: boolean;
  onRemove: () => void;
  openFilePicker: () => void;
  inputProps: Omit<React.InputHTMLAttributes<HTMLInputElement>, "ref">;
  inputRef: React.RefCallback<HTMLInputElement>;
  dragProps: {
    onDragEnter: React.DragEventHandler;
    onDragOver: React.DragEventHandler;
    onDragLeave: React.DragEventHandler;
    onDrop: React.DragEventHandler;
  };
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="17 8 12 3 7 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="12"
        y1="3"
        x2="12"
        y2="15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <path
        d="m21 15-5-5L5 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Meta config per slot ─────────────────────────────────────────────────────

const SLOT_META = {
  light: {
    label: "亮色截图",
    sublabel: "Light Mode",
    icon: <SunIcon />,
    accent: "#0064d1",
    accentBg: "rgba(0, 100, 209, 0.06)",
    accentBorder: "rgba(0, 100, 209, 0.25)",
    badgeBg: "rgba(255, 204, 0, 0.15)",
    badgeColor: "#b07d00",
    badgeText: "Light",
  },
  dark: {
    label: "暗色截图",
    sublabel: "Dark Mode",
    icon: <MoonIcon />,
    accent: "#5e5ce6",
    accentBg: "rgba(94, 92, 230, 0.06)",
    accentBorder: "rgba(94, 92, 230, 0.25)",
    badgeBg: "rgba(94, 92, 230, 0.12)",
    badgeColor: "#5e5ce6",
    badgeText: "Dark",
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function ImageDropZone({
  id,
  image,
  isDragging = false,
  onRemove,
  openFilePicker,
  inputProps,
  inputRef,
  dragProps,
}: ImageDropZoneProps) {
  const meta = SLOT_META[id];
  const hasImage = !!image;

  return (
    <div className="flex flex-col gap-2">
      {/* Zone header */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          {/* Mode icon */}
          <span
            className="flex items-center justify-center w-7 h-7 rounded-full"
            style={{
              color: meta.accent,
              background: meta.accentBg,
            }}
          >
            {meta.icon}
          </span>

          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--color-text)] leading-tight">
              {meta.label}
            </span>
            <span className="text-[11px] text-[var(--color-text-tertiary)] leading-tight">
              {meta.sublabel}
            </span>
          </div>
        </div>

        {/* Badge */}
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full select-none"
          style={{
            background: meta.badgeBg,
            color: meta.badgeColor,
          }}
        >
          {meta.badgeText}
        </span>
      </div>

      {/* Drop zone / Preview */}
      <div className="relative">
        {/* Hidden file input */}
        <input {...inputProps} ref={inputRef} />

        {hasImage ? (
          /* ── Image preview state ── */
          <div
            className="relative group rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border)] animate-fade-in"
            style={{ aspectRatio: "16/9" }}
          >
            {/* Checkerboard pattern for transparent backgrounds */}
            <div className="absolute inset-0 checkerboard" />

            {/* Image */}
            <img
              src={image.url}
              alt={`${meta.label} preview`}
              className="relative z-10 w-full h-full object-cover"
              draggable={false}
            />

            {/* Hover overlay */}
            <div
              className="absolute inset-0 z-20 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: "rgba(0, 0, 0, 0.45)" }}
            >
              {/* Replace button */}
              <button
                type="button"
                onClick={openFilePicker}
                aria-label="替换图片"
                className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 text-white text-xs font-medium backdrop-blur-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-white"
              >
                <ImageIcon />
                替换
              </button>

              {/* Remove button */}
              <button
                type="button"
                onClick={onRemove}
                aria-label="移除图片"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 hover:bg-red-500/80 active:bg-red-600/80 text-white backdrop-blur-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-white"
              >
                <XIcon />
              </button>
            </div>

            {/* Image info pill */}
            <div
              className="absolute bottom-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white font-mono backdrop-blur-md select-none pointer-events-none"
              style={{ background: "rgba(0,0,0,0.4)" }}
            >
              {image.width} × {image.height}
            </div>
          </div>
        ) : (
          /* ── Empty / drop state ── */
          <button
            type="button"
            onClick={openFilePicker}
            aria-label={`上传${meta.label}，点击或拖放图片`}
            {...dragProps}
            className={[
              "w-full flex flex-col items-center justify-center gap-3",
              "rounded-[var(--radius-lg)] border-2 border-dashed",
              "transition-all duration-200 cursor-pointer select-none",
              "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
              isDragging ? "drop-zone-active scale-[1.01]" : "hover:scale-[1.005]",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              aspectRatio: "16/9",
              borderColor: isDragging ? meta.accent : "var(--color-border)",
              background: isDragging ? meta.accentBg : "var(--color-surface-secondary)",
            }}
          >
            {/* Upload icon */}
            <div
              className="flex items-center justify-center w-12 h-12 rounded-2xl transition-transform duration-200"
              style={{
                color: isDragging ? meta.accent : "var(--color-text-tertiary)",
                background: isDragging ? meta.accentBg : "var(--color-border)",
                transform: isDragging ? "scale(1.1)" : "scale(1)",
              }}
            >
              <UploadIcon />
            </div>

            {/* Text */}
            <div className="flex flex-col items-center gap-1 text-center">
              <span
                className="text-sm font-semibold transition-colors duration-150"
                style={{
                  color: isDragging ? meta.accent : "var(--color-text)",
                }}
              >
                {isDragging ? "松开以上传" : "拖放或点击上传"}
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)]">
                PNG · JPEG · WebP · GIF
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
