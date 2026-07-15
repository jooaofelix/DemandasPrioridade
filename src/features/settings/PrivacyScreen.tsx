import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function PrivacyScreen() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-28 pt-6">
      <Button variant="ghost" size="sm" className="self-start" onClick={() => navigate(-1)}>
        ← Voltar
      </Button>
      <h1 className="text-xl font-semibold text-ink">Privacidade</h1>

      <div className="flex flex-col gap-4 text-sm text-ink-muted">
        <p>
          Este sistema é uma ferramenta de apoio à organização e não substitui acompanhamento profissional de
          psicoterapia ou medicina.
        </p>
        <section>
          <h2 className="mb-1 font-medium text-ink">O que guardamos</h2>
          <p>
            Suas tarefas, rotinas, sessões de foco, check-ins de energia e preferências ficam no Firebase (Google
            Cloud), isolados por sua conta. Ninguém além de você tem acesso a esses dados através do aplicativo.
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-medium text-ink">Como usamos</h2>
          <p>
            Os dados servem apenas para o funcionamento do AGORA: sugerir prioridades, lembrar compromissos e
            mostrar seu progresso. Não vendemos, compartilhamos ou usamos seus dados para publicidade.
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-medium text-ink">Seus direitos</h2>
          <p>
            Você pode exportar todos os seus dados em formato JSON ou excluir sua conta e todos os dados a
            qualquer momento, nas Configurações.
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-medium text-ink">Notificações</h2>
          <p>
            Lembretes usam a API de notificações do navegador e funcionam apenas com o app aberto ou recentemente
            usado. Você pode desativá-los a qualquer momento.
          </p>
        </section>
      </div>
    </div>
  );
}
