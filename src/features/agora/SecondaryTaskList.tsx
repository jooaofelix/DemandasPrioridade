import { Card } from "@/components/ui/Card";
import type { PriorityResult } from "@/types";

interface SecondaryTaskListProps {
  results: PriorityResult[];
  onSelect: (result: PriorityResult) => void;
}

export function SecondaryTaskList({ results, onSelect }: SecondaryTaskListProps) {
  if (results.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Também nesta lista</p>
      {results.map((result) => (
        <Card key={result.task.id} className="p-3">
          <button onClick={() => onSelect(result)} className="w-full text-left">
            <p className="text-sm font-medium text-ink">{result.task.title}</p>
            {result.reasons[0] && <p className="mt-0.5 text-xs text-ink-muted">{result.reasons[0].label}</p>}
          </button>
        </Card>
      ))}
    </div>
  );
}
