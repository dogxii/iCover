import type { InputHTMLAttributes } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  showValue?: boolean;
  showMinMax?: boolean;
  formatValue?: (value: number) => string;
  onChange: (value: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  showValue = true,
  showMinMax = false,
  formatValue,
  onChange,
  disabled,
  className = "",
  id,
  ...rest
}: SliderProps) {
  const inputId = id ?? (label ? `slider-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label row */}
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="text-xs font-medium text-[var(--color-text-secondary)] select-none"
            >
              {label}
            </label>
          )}
          {showValue && (
            <span
              className="text-xs font-mono font-medium text-[var(--color-text)] tabular-nums"
              aria-live="polite"
            >
              {displayValue}
            </span>
          )}
        </div>
      )}

      {/* Slider track */}
      <div className="relative flex items-center">
        {/* Custom track background */}
        <div
          className="absolute inset-0 h-1.5 my-auto rounded-full pointer-events-none overflow-hidden"
          style={{
            background: `linear-gradient(
              to right,
              var(--color-primary) 0%,
              var(--color-primary) ${percent}%,
              var(--color-border) ${percent}%,
              var(--color-border) 100%
            )`,
          }}
          aria-hidden="true"
        />

        <input
          {...rest}
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label={label}
          style={{
            // Reset appearance so our custom track shows through
            WebkitAppearance: "none",
            appearance: "none",
            background: "transparent",
            width: "100%",
            height: "24px",
            margin: 0,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
          className="relative z-10 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--color-primary)] [&::-webkit-slider-thumb]:shadow-[0_1px_4px_var(--color-shadow-md)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-100 [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--color-primary)] [&::-moz-range-thumb]:shadow-[0_1px_4px_var(--color-shadow-md)] [&::-moz-range-thumb]:cursor-pointer [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:bg-transparent"
        />
      </div>

      {/* Min / Max labels */}
      {showMinMax && (
        <div className="flex justify-between">
          <span className="text-[10px] text-[var(--color-text-tertiary)] tabular-nums select-none">
            {min}{unit}
          </span>
          <span className="text-[10px] text-[var(--color-text-tertiary)] tabular-nums select-none">
            {max}{unit}
          </span>
        </div>
      )}
    </div>
  );
}
