import { Chip } from "@/components/ui/Chip";
import { useAuthStore } from "@/store/authStore";
import { useDailyPlanStore } from "@/store/dailyPlanStore";
import type { EnergyLevel } from "@/types";

const OPTIONS: { value: EnergyLevel; label: string }[] = [
  { value: "low", label: "Energia baixa" },
  { value: "medium", label: "Energia média" },
  { value: "high", label: "Energia alta" }
];

export function EnergySelector() {
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const energyLevel = useDailyPlanStore((s) => s.today?.energyLevel ?? null);
  const setEnergy = useDailyPlanStore((s) => s.setEnergy);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Como está sua energia agora?">
      {OPTIONS.map((opt) => (
        <Chip
          key={opt.value}
          selected={energyLevel === opt.value}
          onClick={() => uid && setEnergy(uid, opt.value)}
        >
          {opt.label}
        </Chip>
      ))}
    </div>
  );
}
