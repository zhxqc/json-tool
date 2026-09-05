"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  title?: string;
}

/** Accessible segmented control (button group) for small option sets. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "sm",
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: "sm" | "xs";
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center rounded-md border border-border bg-background p-0.5"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-[5px] font-medium transition-colors",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]",
              active
                ? "bg-accent text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
