import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected = false, className = "", ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={[
        "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
        selected
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-border bg-surface-raised text-ink-muted hover:bg-surface-sunken",
        className
      ].join(" ")}
      {...props}
    />
  );
}
