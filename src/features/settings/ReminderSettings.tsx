import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import type { ReminderType } from "@/types";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const TYPE_LABELS: Record<ReminderType, string> = {
  prepare: "Preparar-se",
  start: "Começar",
  deadline: "Prazo",
  resume: "Retomar",
  routine: "Rotina",
  day_summary: "Resumo do dia",
  day_closing: "Encerramento do dia"
};

export function ReminderSettings() {
  const prefs = useAuthStore((s) => s.profile?.notificationPreferences ?? null);
  const updateNotificationPreferences = useAuthStore((s) => s.updateNotificationPreferences);
  const showToast = useUiStore((s) => s.showToast);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );

  if (!prefs) return null;
  const currentPrefs = prefs;

  async function requestPermission() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result !== "granted") {
      showToast("Sem permissão, os lembretes não vão aparecer como notificação.");
    }
  }

  function toggleDay(day: number) {
    const days = currentPrefs.daysOfWeek.includes(day)
      ? currentPrefs.daysOfWeek.filter((d) => d !== day)
      : [...currentPrefs.daysOfWeek, day].sort();
    updateNotificationPreferences({ daysOfWeek: days });
  }

  function toggleType(type: ReminderType) {
    updateNotificationPreferences({
      typesEnabled: { ...currentPrefs.typesEnabled, [type]: !currentPrefs.typesEnabled[type] }
    });
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Lembretes</p>
        <Chip selected={currentPrefs.enabled} onClick={() => updateNotificationPreferences({ enabled: !currentPrefs.enabled })}>
          {currentPrefs.enabled ? "Ativados" : "Desativados"}
        </Chip>
      </div>

      {currentPrefs.enabled && permission !== "granted" && permission !== "unsupported" && (
        <Button size="sm" variant="secondary" onClick={requestPermission}>
          Permitir notificações no navegador
        </Button>
      )}
      {permission === "unsupported" && (
        <p className="text-xs text-ink-faint">Este navegador não suporta notificações locais.</p>
      )}

      {currentPrefs.enabled && (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-ink-muted">Estilo</span>
            <div className="flex gap-2">
              <Chip selected={currentPrefs.style === "direct"} onClick={() => updateNotificationPreferences({ style: "direct" })}>
                Direto
              </Chip>
              <Chip selected={currentPrefs.style === "warm"} onClick={() => updateNotificationPreferences({ style: "warm" })}>
                Acolhedor
              </Chip>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-ink-muted">Dias da semana</span>
            <div className="flex flex-wrap gap-1.5">
              {DAY_LABELS.map((label, day) => (
                <Chip key={day} selected={currentPrefs.daysOfWeek.includes(day)} onClick={() => toggleDay(day)}>
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <TextField
              label="Silêncio a partir de"
              type="time"
              value={currentPrefs.quietHoursStart ?? ""}
              onChange={(e) => updateNotificationPreferences({ quietHoursStart: e.target.value || null })}
            />
            <TextField
              label="Silêncio até"
              type="time"
              value={currentPrefs.quietHoursEnd ?? ""}
              onChange={(e) => updateNotificationPreferences({ quietHoursEnd: e.target.value || null })}
            />
          </div>

          <TextField
            label="Máximo de lembretes por dia"
            type="number"
            min={0}
            max={20}
            value={String(currentPrefs.maxPerDay)}
            onChange={(e) => updateNotificationPreferences({ maxPerDay: Number(e.target.value) || 0 })}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-ink-muted">Tipos de lembrete</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(TYPE_LABELS) as ReminderType[]).map((type) => (
                <Chip key={type} selected={currentPrefs.typesEnabled[type] !== false} onClick={() => toggleType(type)}>
                  {TYPE_LABELS[type]}
                </Chip>
              ))}
            </div>
          </div>

          <p className="text-xs text-ink-faint">
            Os lembretes funcionam enquanto o AGORA está aberto ou instalado como app, verificando a cada poucos
            segundos. Não é um sistema de notificação em segundo plano garantido — veja as limitações na
            documentação.
          </p>
        </>
      )}
    </Card>
  );
}
