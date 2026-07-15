import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useAuthStore } from "@/store/authStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useInboxTriage } from "@/features/inbox/useInboxTriage";
import type { InboxItem } from "@/types";

interface CloseMentalTabsGameProps {
  items: InboxItem[];
  open: boolean;
  onClose: () => void;
}

/** Minigame "Fechar abas mentais": até ~2 minutos, uma decisão simples por vez. */
export function CloseMentalTabsGame({ items, open, onClose }: CloseMentalTabsGameProps) {
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const recordAction = useGamificationStore((s) => s.recordAction);
  const { doNow, doTwoMinutes, schedule, keep } = useInboxTriage();
  const [index, setIndex] = useState(0);
  const [decided, setDecided] = useState(0);

  const queue = items.slice(0, 6);
  const current = queue[index];
  const finished = index >= queue.length;

  function advance() {
    setDecided((d) => d + 1);
    setIndex((i) => i + 1);
  }

  async function handleClose() {
    if (decided > 0 && uid) {
      await recordAction(uid, "reorganize_day");
    }
    setIndex(0);
    setDecided(0);
    onClose();
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Fechar abas mentais">
      {!finished && current && (
        <div className="flex flex-col gap-5">
          <p className="text-xs text-ink-faint">
            {index + 1} de {queue.length}
          </p>
          <p className="rounded-control bg-surface-sunken p-4 text-base text-ink">{current.content}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                doNow(current);
                advance();
              }}
            >
              Fazer
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                schedule(current, null);
                advance();
              }}
            >
              Agendar
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                keep(current);
                advance();
              }}
            >
              Guardar
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                doTwoMinutes(current);
                advance();
              }}
            >
              2 minutos
            </Button>
          </div>
        </div>
      )}

      {finished && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="text-lg font-medium text-ink">
            {decided > 0 ? `Pronto! ${decided} itens organizados.` : "Nada para organizar agora."}
          </p>
          <Button onClick={handleClose}>Fechar</Button>
        </div>
      )}
    </Sheet>
  );
}
