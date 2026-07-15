import { type ButtonHTMLAttributes, forwardRef } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "default" | "subtle";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = "default", className = "", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={[
        "inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors",
        variant === "default"
          ? "bg-surface-raised text-ink border border-border hover:bg-surface-sunken"
          : "text-ink-muted hover:bg-surface-raised",
        className
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
});
