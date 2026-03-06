import { useId } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
  className?: string;
}

// ─── Size Maps ────────────────────────────────────────────────────────────────

const sizeClasses = {
  sm: {
    track: "p-0.5 rounded-[var(--radius-sm)]",
    item: "h-6 px-2.5 text-xs gap-1 rounded-[calc(var(--radius-sm)-2px)]",
  },
  md: {
    track: "p-1 rounded-[var(--radius-md)]",
    item: "h-7 px-3 text-sm gap-1.5 rounded-[calc(var(--radius-md)-4px)]",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
  size = "md",
  fullWidth = false,
  className = "",
}: SegmentedControlProps<T>) {
  const groupId = useId();
  const sc = sizeClasses[size];

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Optional label */}
      {label && (
        <span className="text-xs font-medium text-[var(--color-text-secondary)] select-none">
          {label}
        </span>
      )}

      {/* Track */}
      <div
        role="group"
        aria-label={label}
        className={[
          "inline-flex items-stretch",
          "bg-[var(--color-surface-secondary)]",
          sc.track,
          fullWidth ? "w-full" : "w-fit",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {options.map((option) => {
          const isActive = option.value === value;
          const optionId = `${groupId}-${option.value}`;

          return (
            <button
              key={option.value}
              id={optionId}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={option.label}
              disabled={option.disabled}
              onClick={() => !option.disabled && onChange(option.value)}
              className={[
                "inline-flex items-center justify-center",
                "font-medium select-none cursor-pointer",
                "transition-all duration-[var(--transition-fast)]",
                "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-1",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                fullWidth ? "flex-1" : "",
                sc.item,
                isActive
                  ? [
                      "bg-[var(--color-surface)] text-[var(--color-text)]",
                      "shadow-[0_1px_3px_var(--color-shadow),0_0_0_0.5px_var(--color-border)]",
                    ].join(" ")
                  : "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {option.icon && (
                <span aria-hidden="true" className="shrink-0">
                  {option.icon}
                </span>
              )}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
