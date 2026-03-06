import type { ButtonHTMLAttributes, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children?: ReactNode;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-[var(--color-primary)] text-white",
    "hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)]",
    "shadow-[0_1px_3px_var(--color-shadow-md)]",
    "disabled:bg-[var(--color-primary)] disabled:opacity-50",
  ].join(" "),

  secondary: [
    "bg-[var(--color-surface)] text-[var(--color-text)]",
    "border border-[var(--color-border)]",
    "hover:bg-[var(--color-surface-secondary)]",
    "active:bg-[var(--color-overlay)]",
    "shadow-[0_1px_2px_var(--color-shadow)]",
    "disabled:opacity-50",
  ].join(" "),

  ghost: [
    "bg-transparent text-[var(--color-text-secondary)]",
    "hover:bg-[var(--color-overlay)] hover:text-[var(--color-text)]",
    "active:bg-[var(--color-border)]",
    "disabled:opacity-50",
  ].join(" "),

  danger: [
    "bg-[#ff3b30] text-white",
    "hover:bg-[#e0342a] active:bg-[#c72e25]",
    "shadow-[0_1px_3px_rgba(255,59,48,0.3)]",
    "disabled:opacity-50",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-3 text-xs gap-1.5 rounded-[var(--radius-sm)]",
  md: "h-9 px-4 text-sm gap-2 rounded-[var(--radius-md)]",
  lg: "h-11 px-5 text-base gap-2.5 rounded-[var(--radius-lg)]",
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ size }: { size: ButtonSize }) {
  const dim = size === "sm" ? 12 : size === "md" ? 14 : 16;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{
        animation: "spin 0.7s linear infinite",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="28"
        strokeDashoffset="10"
        opacity="0.8"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseClasses = [
    "inline-flex items-center justify-center",
    "font-medium select-none cursor-pointer",
    "transition-all duration-[var(--transition-fast)]",
    "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
    "disabled:cursor-not-allowed",
    fullWidth ? "w-full" : "",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const showIcon = icon && !loading;
  const showSpinner = loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={baseClasses}
      aria-busy={loading || undefined}
    >
      {/* Left icon / spinner */}
      {iconPosition === "left" && (
        <>
          {showSpinner && <Spinner size={size} />}
          {showIcon && <span aria-hidden="true">{icon}</span>}
        </>
      )}

      {/* Label */}
      {children && (
        <span className={loading && !icon ? "opacity-0" : undefined}>
          {children}
        </span>
      )}

      {/* Right icon */}
      {iconPosition === "right" && showIcon && (
        <span aria-hidden="true">{icon}</span>
      )}
    </button>
  );
}
