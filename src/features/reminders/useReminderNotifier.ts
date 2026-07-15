import { useEffect } from "react";
import { countSentToday, dueReminders, isWithinQuietHours } from "@/lib/reminders/scheduler";
import { useAuthStore } from "@/store/authStore";
import { useReminderStore } from "@/store/reminderStore";

const CHECK_INTERVAL_MS = 20_000;

/**
 * Verificação local: funciona apenas com o app aberto (aba ativa ou PWA em segundo
 * plano recente). Não é um sistema de push real — ver docs/NOTIFICATIONS.md.
 */
export function useReminderNotifier(): void {
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const prefs = useAuthStore((s) => s.profile?.notificationPreferences ?? null);

  useEffect(() => {
    if (!uid || !prefs?.enabled) return;
    if (typeof window === "undefined" || typeof Notification === "undefined") return;

    const interval = setInterval(() => {
      if (Notification.permission !== "granted") return;
      const now = Date.now();
      const nowDate = new Date(now);
      if (isWithinQuietHours(nowDate, prefs.quietHoursStart, prefs.quietHoursEnd)) return;
      if (!prefs.daysOfWeek.includes(nowDate.getDay())) return;

      const reminders = useReminderStore.getState().reminders;
      const sentToday = countSentToday(reminders, now);
      if (sentToday >= prefs.maxPerDay) return;

      const due = dueReminders(reminders, now).filter((r) => prefs.typesEnabled[r.type] !== false);
      const next = due[0];
      if (!next) return;

      const body = next.message ?? defaultMessage(next.type, next.style);
      new Notification("AGORA", { body, tag: next.id });
      useReminderStore.getState().updateStatus(uid, next.id, "sent");
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [uid, prefs]);
}

function defaultMessage(type: string, style: "direct" | "warm"): string {
  const messages: Record<string, { direct: string; warm: string }> = {
    prepare: { direct: "Prepare-se: sua próxima tarefa está chegando.", warm: "Daqui a pouco é hora de começar. Sem pressa." },
    start: { direct: "Hora de começar a tarefa planejada.", warm: "O horário planejado chegou. Vamos começar aos poucos?" },
    deadline: { direct: "Prazo se aproximando.", warm: "Um prazo está chegando — quer dar uma olhada?" },
    resume: { direct: "Retome de onde parou.", warm: "Você pode voltar para essa tarefa quando quiser." },
    routine: { direct: "Hora da sua rotina.", warm: "Sua rotina está esperando por você." },
    day_summary: { direct: "Planeje seu dia agora.", warm: "Vamos escolher juntos a prioridade de hoje?" },
    day_closing: { direct: "Encerre o dia.", warm: "Um bom momento para fechar o dia com calma." }
  };
  return messages[type]?.[style] ?? "Você tem algo planejado no AGORA.";
}
