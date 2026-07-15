import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";
import { TextField } from "@/components/ui/TextField";
import { routineSchema } from "@/lib/validation/schemas";
import { useAuthStore } from "@/store/authStore";
import { useRoutineStore } from "@/store/routineStore";

const WEEKDAYS = [
  { value: 0, label: "D" },
  { value: 1, label: "S" },
  { value: 2, label: "T" },
  { value: 3, label: "Q" },
  { value: 4, label: "Q" },
  { value: 5, label: "S" },
  { value: 6, label: "S" }
];

interface RoutineEditorSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (routineId: string) => void;
}

export function RoutineEditorSheet({ open, onClose, onCreated }: RoutineEditorSheetProps) {
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const createRoutine = useRoutineStore((s) => s.createRoutine);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [timeOfDay, setTimeOfDay] = useState("");
  const [error, setError] = useState<string | null>(null);

  function toggleDay(day: number) {
    setDaysOfWeek((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  }

  function reset() {
    setName("");
    setDescription("");
    setDaysOfWeek([1, 2, 3, 4, 5]);
    setTimeOfDay("");
    setError(null);
  }

  async function handleCreate() {
    const result = routineSchema.safeParse({
      name,
      description: description || null,
      daysOfWeek,
      timeOfDay: timeOfDay || null
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }
    if (!uid) return;
    const id = await createRoutine(uid, result.data);
    reset();
    onClose();
    onCreated?.(id);
  }

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Nova rotina"
    >
      <div className="flex flex-col gap-4">
        <TextField label="Nome" placeholder="Ex.: Início do trabalho" value={name} onChange={(e) => setName(e.target.value)} autoFocus error={error ?? undefined} />
        <TextField
          label="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Dias da semana</span>
          <div className="flex gap-1.5">
            {WEEKDAYS.map((d) => (
              <Chip key={d.value} selected={daysOfWeek.includes(d.value)} onClick={() => toggleDay(d.value)}>
                {d.label}
              </Chip>
            ))}
          </div>
        </div>
        <TextField label="Horário (opcional)" type="time" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} />
        <Button fullWidth onClick={handleCreate} disabled={!name.trim()}>
          Criar rotina
        </Button>
      </div>
    </Sheet>
  );
}
