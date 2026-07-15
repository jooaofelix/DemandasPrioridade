import type { ButtonHTMLAttributes } from "react";
import { IconPlus } from "./icons";

export function FAB({ label = "Tirar da cabeça", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label?: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className="fixed bottom-20 right-4 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-raised transition-transform hover:bg-brand-700 active:scale-95 sm:bottom-8 sm:right-8"
      {...props}
    >
      <IconPlus width={28} height={28} />
    </button>
  );
}
