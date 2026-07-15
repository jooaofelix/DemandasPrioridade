import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function useAppliedTheme(): void {
  const theme = useAuthStore((s) => s.profile?.settings.theme ?? "system");
  const reducedMotion = useAuthStore((s) => s.profile?.settings.reducedMotion ?? false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("no-motion", reducedMotion);
  }, [reducedMotion]);
}
