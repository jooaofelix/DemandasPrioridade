import { useUiStore } from "@/store/uiStore";

const TONE_CLASSES: Record<string, string> = {
  neutral: "bg-surface-raised text-ink border-border",
  success: "bg-surface-raised text-success border-success/30",
  info: "bg-surface-raised text-brand-600 border-brand-500/30"
};

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  const dismissToast = useUiStore((s) => s.dismissToast);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={[
            "pointer-events-auto flex max-w-sm items-center gap-3 rounded-control border px-4 py-3 text-sm shadow-raised animate-slide-up",
            TONE_CLASSES[toast.tone]
          ].join(" ")}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            aria-label="Dispensar mensagem"
            className="ml-1 text-ink-faint hover:text-ink"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
