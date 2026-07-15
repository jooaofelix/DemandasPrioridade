import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";
import { TextField } from "@/components/ui/TextField";
import { useAuthStore } from "@/store/authStore";
import { useFocusStore } from "@/store/focusStore";
import type { DistractionCategory } from "@/types";

const CATEGORY_OPTIONS: { value: DistractionCategory; label: string }[] = [
  { value: "respond", label: "Preciso responder alguém" },
  { value: "research", label: "Quero pesquisar uma coisa" },
  { value: "remembered_task", label: "Lembrei de outra tarefa" },
  { value: "buy", label: "Preciso comprar algo" },
  { value: "other", label: "Outro" }
];

interface DistractionParkSheetProps {
  open: boolean;
  onClose: () => void;
}

export function DistractionParkSheet({ open, onClose }: DistractionParkSheetProps) {
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const registerDistraction = useFocusStore((s) => s.registerDistraction);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<DistractionCategory>("remembered_task");

  async function save() {
    if (!uid || !content.trim()) return;
    await registerDistraction(uid, content.trim(), category);
    setContent("");
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Estacionar pensamento">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">Guarde em uma frase. Você continua no foco.</p>
        <TextField label="O que é?" value={content} onChange={(e) => setContent(e.target.value)} autoFocus />
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((opt) => (
            <Chip key={opt.value} selected={category === opt.value} onClick={() => setCategory(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>
        <Button fullWidth onClick={save} disabled={!content.trim()}>
          Guardar e continuar focando
        </Button>
      </div>
    </Sheet>
  );
}
