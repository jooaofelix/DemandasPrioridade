import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TextField } from "@/components/ui/TextField";
import { useInboxTriage } from "./useInboxTriage";
import type { InboxItem } from "@/types";

export function InboxItemCard({ item }: { item: InboxItem }) {
  const { doNow, doTwoMinutes, schedule, discard } = useInboxTriage();
  const [scheduling, setScheduling] = useState(false);
  const [date, setDate] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  return (
    <Card className="flex flex-col gap-3">
      <p className="text-sm text-ink">{item.content}</p>
      {item.scheduledFor && (
        <p className="text-xs text-ink-faint">
          Agendado para {new Date(item.scheduledFor).toLocaleDateString("pt-BR")}
        </p>
      )}

      {!scheduling && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => doNow(item)}>
            Organizar agora
          </Button>
          <Button size="sm" variant="secondary" onClick={() => doTwoMinutes(item)}>
            2 minutos
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setScheduling(true)}>
            Agendar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmDiscard(true)}>
            Descartar
          </Button>
        </div>
      )}

      {scheduling && (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <TextField label="Para quando?" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <Button
            size="sm"
            onClick={() => {
              schedule(item, date ? new Date(date).getTime() : null);
              setScheduling(false);
            }}
          >
            Salvar
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmDiscard}
        title="Descartar este item?"
        description="Ele sai da sua caixa de entrada. Isso não pode ser desfeito."
        confirmLabel="Descartar"
        destructive
        onConfirm={() => {
          discard(item);
          setConfirmDiscard(false);
        }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </Card>
  );
}
