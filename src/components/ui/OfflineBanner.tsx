import { useUiStore } from "@/store/uiStore";

export function OfflineBanner() {
  const isOnline = useUiStore((s) => s.isOnline);
  if (isOnline) return null;

  return (
    <div role="status" className="bg-warning/15 px-4 py-2 text-center text-xs font-medium text-warning">
      Sem internet. Suas tarefas continuam disponíveis e serão sincronizadas quando a conexão voltar.
    </div>
  );
}
