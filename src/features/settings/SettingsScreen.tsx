import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteAllUserData, deleteAuthUser, downloadJson, exportUserDataAsJson } from "@/lib/firebase/accountData";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import type { GamificationLevel, ThemePreference } from "@/types";
import { ReminderSettings } from "./ReminderSettings";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" }
];

const GAMIFICATION_OPTIONS: { value: GamificationLevel; label: string }[] = [
  { value: "off", label: "Desligada" },
  { value: "discrete", label: "Discreta" },
  { value: "full", label: "Completa" }
];

export function SettingsScreen() {
  const navigate = useNavigate();
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const profile = useAuthStore((s) => s.profile);
  const updateSettings = useAuthStore((s) => s.updateSettings);
  const signOut = useAuthStore((s) => s.signOut);
  const showToast = useUiStore((s) => s.showToast);

  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { canInstall, promptInstall } = useInstallPrompt();

  if (!profile) return null;
  const { settings } = profile;

  async function handleExport() {
    if (!uid) return;
    setExporting(true);
    try {
      const json = await exportUserDataAsJson(uid);
      downloadJson(`agora-dados-${new Date().toISOString().slice(0, 10)}.json`, json);
      showToast("Exportação concluída.", "success");
    } catch {
      showToast("Não foi possível exportar agora. Tente novamente.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    if (!uid || !firebaseUser) return;
    setDeleting(true);
    try {
      await deleteAllUserData(uid);
      await deleteAuthUser(firebaseUser);
      showToast("Conta e dados excluídos.");
    } catch {
      showToast("Não foi possível excluir agora. Se você entrou há muito tempo, entre novamente e tente de novo.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pb-28 pt-6">
      <header>
        <h1 className="text-xl font-semibold text-ink">Configurações</h1>
      </header>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Aparência</span>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((opt) => (
              <Chip key={opt.value} selected={settings.theme === opt.value} onClick={() => updateSettings({ theme: opt.value })}>
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink">Reduzir movimento</span>
          <Chip selected={settings.reducedMotion} onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}>
            {settings.reducedMotion ? "Ativado" : "Desativado"}
          </Chip>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Prioridades por dia</span>
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <Chip
                key={n}
                selected={settings.maxDailyPriorities === n}
                onClick={() => updateSettings({ maxDailyPriorities: n as 1 | 2 | 3 })}
              >
                {n}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Gamificação</span>
          <div className="flex gap-2">
            {GAMIFICATION_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                selected={settings.gamificationLevel === opt.value}
                onClick={() => updateSettings({ gamificationLevel: opt.value })}
              >
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>
      </Card>

      {canInstall && (
        <Card className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink">Instalar o AGORA</p>
          <p className="text-sm text-ink-muted">Use como um aplicativo, com acesso rápido e suporte offline.</p>
          <Button variant="secondary" onClick={promptInstall}>
            Instalar
          </Button>
        </Card>
      )}

      <ReminderSettings />

      <Card className="flex flex-col gap-3">
        <p className="text-sm font-medium text-ink">Seus dados</p>
        <Button variant="secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? "Exportando..." : "Exportar meus dados"}
        </Button>
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>
          Excluir conta e todos os dados
        </Button>
      </Card>

      <Button variant="ghost" onClick={() => navigate("/privacidade")}>
        Privacidade
      </Button>

      <Button variant="secondary" onClick={signOut}>
        Sair
      </Button>

      <p className="text-center text-xs text-ink-faint">
        Este sistema é uma ferramenta de apoio à organização e não substitui acompanhamento profissional.
      </p>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir sua conta?"
        description="Todas as suas tarefas, rotinas e histórico serão apagados permanentemente. Isso não pode ser desfeito."
        confirmLabel={deleting ? "Excluindo..." : "Excluir tudo"}
        destructive
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
