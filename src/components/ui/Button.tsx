import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700 disabled:bg-brand-400/60",
  secondary:
    "bg-surface-raised text-ink border border-border hover:bg-surface-sunken disabled:opacity-50",
  ghost: "bg-transparent text-ink-muted hover:bg-surface-raised disabled:opacity-50",
  danger: "bg-danger text-white hover:brightness-95 disabled:opacity-50"
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "text-sm px-3 py-2 gap-1.5",
  md: "text-base px-4 py-3 gap-2",
  lg: "text-lg px-6 py-4 gap-2.5"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", fullWidth = false, className = "", disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-control font-medium transition-colors",
        "disabled:cursor-not-allowed",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? "w-full" : "",
        className
      ].join(" ")}
      {...props}
    />
  );
});
