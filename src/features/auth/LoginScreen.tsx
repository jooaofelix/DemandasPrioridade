import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";

export function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const error = useAuthStore((s) => s.error);
  const [pending, setPending] = useState(false);

  async function handleSignIn() {
    setPending(true);
    try {
      await signIn();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white">
          A
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink">AGORA</h1>
          <p className="mt-2 max-w-xs text-sm text-ink-muted">
            Uma estrutura externa para organizar o dia. Descarregue a cabeça, escolha uma prioridade e comece.
          </p>
        </div>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button onClick={handleSignIn} disabled={pending} size="lg" fullWidth>
          {pending ? "Entrando..." : "Entrar com Google"}
        </Button>
        {error && (
          <p role="alert" className="text-center text-sm text-danger">
            {error}
          </p>
        )}
      </div>

      <p className="max-w-xs text-center text-xs text-ink-faint">
        Este sistema é uma ferramenta de apoio à organização e não substitui acompanhamento profissional de
        psicoterapia ou medicina.
      </p>
    </div>
  );
}
