import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRoutineStore } from "@/store/routineStore";
import type { Routine } from "@/types";
import { RoutineDetailSheet } from "./RoutineDetailSheet";
import { RoutineEditorSheet } from "./RoutineEditorSheet";

const DAY_LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function RoutinesScreen() {
  const routines = useRoutineStore((s) => s.routines);
  const loaded = useRoutineStore((s) => s.loaded);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selected, setSelected] = useState<Routine | null>(null);

  const active = routines.filter((r) => r.active);
  const paused = routines.filter((r) => !r.active);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Rotinas</h1>
          <p className="text-sm text-ink-muted">Sequências curtas para os momentos que se repetem.</p>
        </div>
        <Button size="sm" onClick={() => setEditorOpen(true)}>
          Nova
        </Button>
      </header>

      {loaded && routines.length === 0 && (
        <EmptyState
          title="Nenhuma rotina ainda"
          description="Crie uma sequência curta para um momento do seu dia, como a manhã ou o início do trabalho."
          action={
            <Button size="sm" onClick={() => setEditorOpen(true)}>
              Criar rotina
            </Button>
          }
        />
      )}

      <div className="flex flex-col gap-3">
        {active.map((routine) => (
          <RoutineCard key={routine.id} routine={routine} onSelect={setSelected} />
        ))}
      </div>

      {paused.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm font-medium text-ink-muted">
            Pausadas ({paused.length})
          </summary>
          <div className="mt-2 flex flex-col gap-3">
            {paused.map((routine) => (
              <RoutineCard key={routine.id} routine={routine} onSelect={setSelected} />
            ))}
          </div>
        </details>
      )}

      <RoutineEditorSheet open={editorOpen} onClose={() => setEditorOpen(false)} />
      <RoutineDetailSheet routine={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
    </div>
  );
}

function RoutineCard({ routine, onSelect }: { routine: Routine; onSelect: (routine: Routine) => void }) {
  return (
    <Card className="p-4">
      <button onClick={() => onSelect(routine)} className="w-full text-left">
        <p className="font-medium text-ink">{routine.name}</p>
        <div className="mt-2 flex gap-1">
          {DAY_LETTERS.map((letter, day) => (
            <span
              key={day}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                routine.daysOfWeek.includes(day) ? "bg-brand-100 text-brand-700" : "text-ink-faint"
              }`}
            >
              {letter}
            </span>
          ))}
        </div>
        {routine.timeOfDay && <p className="mt-1 text-xs text-ink-faint">{routine.timeOfDay}</p>}
      </button>
    </Card>
  );
}
