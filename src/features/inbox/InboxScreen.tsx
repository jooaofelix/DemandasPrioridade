import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CloseMentalTabsGame } from "@/features/gamification/CloseMentalTabsGame";
import { useInboxStore } from "@/store/inboxStore";
import { useUiStore } from "@/store/uiStore";
import { InboxItemCard } from "./InboxItemCard";

export function InboxScreen() {
  const items = useInboxStore((s) => s.items);
  const loaded = useInboxStore((s) => s.loaded);
  const openCapture = useUiStore((s) => s.openCapture);
  const [gameOpen, setGameOpen] = useState(false);

  const pending = items.filter((i) => !i.processed && !i.archivedAt);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Caixa de entrada</h1>
          <p className="text-sm text-ink-muted">Tudo que você tirou da cabeça, sem pressa para decidir.</p>
        </div>
        <Button size="sm" onClick={openCapture}>
          Nova
        </Button>
      </header>

      {pending.length >= 2 && (
        <Button variant="secondary" onClick={() => setGameOpen(true)}>
          Organizar agora ({pending.length})
        </Button>
      )}

      {loaded && pending.length === 0 && (
        <EmptyState
          title="Caixa de entrada vazia"
          description="Quando algo ocupar sua cabeça, tire daqui e guarde aqui."
          action={
            <Button onClick={openCapture} size="sm">
              Tirar da cabeça
            </Button>
          }
        />
      )}

      <div className="flex flex-col gap-3">
        {pending.map((item) => (
          <InboxItemCard key={item.id} item={item} />
        ))}
      </div>

      <CloseMentalTabsGame items={pending} open={gameOpen} onClose={() => setGameOpen(false)} />
    </div>
  );
}
