import { useEffect } from "react";
import { useGamificationStore } from "@/store/gamificationStore";

export function CelebrationToast() {
  const celebration = useGamificationStore((s) => s.celebration);
  const dismiss = useGamificationStore((s) => s.dismissCelebration);

  useEffect(() => {
    if (!celebration) return;
    const timeout = setTimeout(dismiss, 3500);
    return () => clearTimeout(timeout);
  }, [celebration, dismiss]);

  if (!celebration) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-4 z-[70] flex justify-center px-4"
    >
      <div className="animate-slide-up rounded-full border border-brand-500/30 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 shadow-raised">
        {celebration.message}
      </div>
    </div>
  );
}
