import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

interface MoreMenuSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MoreMenuSheet({ open, onClose }: MoreMenuSheetProps) {
  const navigate = useNavigate();

  function go(path: string) {
    onClose();
    navigate(path);
  }

  return (
    <Sheet open={open} onClose={onClose} title="Mais">
      <div className="flex flex-col gap-2">
        <Button variant="secondary" fullWidth onClick={() => go("/planejar")}>
          Planejamento do dia (3 min)
        </Button>
        <Button variant="secondary" fullWidth onClick={() => go("/encerrar")}>
          Encerramento do dia (2 min)
        </Button>
        <Button variant="secondary" fullWidth onClick={() => go("/progresso")}>
          Progresso e revisão semanal
        </Button>
        <Button variant="secondary" fullWidth onClick={() => go("/configuracoes")}>
          Configurações
        </Button>
      </div>
    </Sheet>
  );
}
