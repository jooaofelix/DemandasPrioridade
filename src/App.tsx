import { useEffect } from "react";
import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { AuthGate } from "@/features/auth/AuthGate";
import { AgoraScreen } from "@/features/agora/AgoraScreen";
import { FocusScreen } from "@/features/focus/FocusScreen";
import { InboxScreen } from "@/features/inbox/InboxScreen";
import { DailyPlanningFlow } from "@/features/planning/DailyPlanningFlow";
import { DayClosingFlow } from "@/features/planning/DayClosingFlow";
import { ProgressScreen } from "@/features/progress/ProgressScreen";
import { RoutinesScreen } from "@/features/routines/RoutinesScreen";
import { PrivacyScreen } from "@/features/settings/PrivacyScreen";
import { SettingsScreen } from "@/features/settings/SettingsScreen";
import { useReminderNotifier } from "@/features/reminders/useReminderNotifier";
import { useAppliedTheme } from "@/hooks/useTheme";
import { initAuthListener } from "@/store/authStore";
import { useFocusStore } from "@/store/focusStore";
import { initOnlineStatusListener } from "@/store/uiStore";
import { RootLayout } from "@/app/RootLayout";

export default function App() {
  useAppliedTheme();
  useReminderNotifier();

  useEffect(() => {
    const unsubscribeAuth = initAuthListener();
    const unsubscribeOnline = initOnlineStatusListener();
    useFocusStore.getState().hydrate();
    return () => {
      unsubscribeAuth();
      unsubscribeOnline();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AuthGate>
              <RootLayout />
            </AuthGate>
          }
        >
          <Route index element={<Navigate to="/agora" replace />} />
          <Route path="agora" element={<AgoraScreen />} />
          <Route path="inbox" element={<InboxScreen />} />
          <Route path="rotinas" element={<RoutinesScreen />} />
          <Route path="progresso" element={<ProgressScreen />} />
          <Route path="foco" element={<FocusScreen />} />
          <Route path="planejar" element={<DailyPlanningFlow />} />
          <Route path="encerrar" element={<DayClosingFlow />} />
          <Route path="configuracoes" element={<SettingsScreen />} />
          <Route path="privacidade" element={<PrivacyScreen />} />
          <Route path="*" element={<Navigate to="/agora" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
