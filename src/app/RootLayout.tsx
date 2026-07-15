import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { FAB } from "@/components/ui/FAB";
import { IconButton } from "@/components/ui/IconButton";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { Toaster } from "@/components/ui/Toaster";
import { IconSettings } from "@/components/ui/icons";
import { CaptureSheet } from "@/features/inbox/CaptureSheet";
import { CelebrationToast } from "@/features/gamification/CelebrationToast";
import { useUiStore } from "@/store/uiStore";
import { MoreMenuSheet } from "./MoreMenuSheet";

const TAB_PATHS = ["/agora", "/inbox", "/rotinas", "/progresso"];

export function RootLayout() {
  const location = useLocation();
  const openCapture = useUiStore((s) => s.openCapture);
  const [menuOpen, setMenuOpen] = useState(false);

  const showTabChrome = TAB_PATHS.some((path) => location.pathname.startsWith(path));

  return (
    <div className="min-h-dvh bg-surface-sunken">
      <OfflineBanner />
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface-raised px-4 py-3">
        <span className="text-base font-semibold text-brand-600">AGORA</span>
        <IconButton label="Mais opções" onClick={() => setMenuOpen(true)}>
          <IconSettings width={20} height={20} />
        </IconButton>
      </header>

      <main>
        <Outlet />
      </main>

      {showTabChrome && <FAB onClick={openCapture} />}
      {showTabChrome && <BottomNav />}

      <CaptureSheet />
      <MoreMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Toaster />
      <CelebrationToast />
    </div>
  );
}
