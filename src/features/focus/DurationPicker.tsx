import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";

const PRESETS = [2, 5, 10, 15, 25, 45];

interface DurationPickerProps {
  taskTitle: string;
  firstStep: string | null;
  onStart: (minutes: number) => void;
}

export function DurationPicker({ taskTitle, firstStep, onStart }: DurationPickerProps) {
  const [selected, setSelected] = useState<number | "custom">(25);
  const [custom, setCustom] = useState("");

  const minutes = selected === "custom" ? Number(custom) || 0 : selected;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-between px-6 py-10">
      <div>
        <p className="text-sm text-ink-muted">Por quanto tempo você quer focar?</p>
        <h1 className="mt-1 text-xl font-semibold text-ink">{taskTitle}</h1>
        {firstStep && <p className="mt-2 text-sm text-ink-muted">Primeiro passo: {firstStep}</p>}

        <div className="mt-6 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Chip key={p} selected={selected === p} onClick={() => setSelected(p)}>
              {p} min
            </Chip>
          ))}
          <Chip selected={selected === "custom"} onClick={() => setSelected("custom")}>
            Personalizado
          </Chip>
        </div>

        {selected === "custom" && (
          <div className="mt-4">
            <TextField
              label="Minutos"
              type="number"
              min={1}
              max={240}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
          </div>
        )}
      </div>

      <Button size="lg" fullWidth disabled={minutes <= 0} onClick={() => onStart(minutes)}>
        Começar
      </Button>
    </div>
  );
}
