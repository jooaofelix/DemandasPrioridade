import { type ReactNode, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import { quickCaptureSchema } from "@/lib/validation/schemas";
import { useAuthStore } from "@/store/authStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useInboxStore } from "@/store/inboxStore";
import { useTaskStore } from "@/store/taskStore";
import { useUiStore } from "@/store/uiStore";
import type { ImpactLevel } from "@/types";

type Phase = "capture" | "ask_date" | "ask_consequence" | "ask_first_step" | "choose_action";

const SpeechRecognitionCtor =
  typeof window !== "undefined"
    ? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition
    : undefined;

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: { transcript: string }[][] } & Event) => void) | null;
  onerror: (() => void) | null;
}

export function CaptureSheet() {
  const open = useUiStore((s) => s.captureOpen);
  const closeCapture = useUiStore((s) => s.closeCapture);
  const showToast = useUiStore((s) => s.showToast);
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const capture = useInboxStore((s) => s.capture);
  const updateInboxItem = useInboxStore((s) => s.update);
  const createTask = useTaskStore((s) => s.createTask);
  const markConverted = useInboxStore((s) => s.markConverted);
  const recordAction = useGamificationStore((s) => s.recordAction);

  const [phase, setPhase] = useState<Phase>("capture");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [dueAt, setDueAt] = useState<string>("");
  const [consequence, setConsequence] = useState<ImpactLevel | null>(null);
  const [firstStepKnown, setFirstStepKnown] = useState<boolean | null>(null);
  const [firstStepText, setFirstStepText] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  function reset() {
    setPhase("capture");
    setContent("");
    setError(null);
    setItemId(null);
    setDueAt("");
    setConsequence(null);
    setFirstStepKnown(null);
    setFirstStepText("");
  }

  function handleClose() {
    reset();
    closeCapture();
  }

  function toggleVoice() {
    if (!SpeechRecognitionCtor) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results.map((r) => r[0]?.transcript ?? "").join(" ");
      setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  async function handleSaveCapture() {
    const result = quickCaptureSchema.safeParse({ content });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Escreva algo antes de salvar.");
      return;
    }
    if (!uid) return;
    const item = await capture(uid, result.data.content);
    setItemId(item.id);
    setError(null);
    setPhase("ask_date");
  }

  async function finalize(action: "organize" | "inbox" | "two_minutes" | "schedule") {
    if (!uid || !itemId) return;
    const parsedDueAt = dueAt ? new Date(dueAt).getTime() : null;

    if (action === "inbox") {
      if (parsedDueAt) await updateInboxItem(uid, itemId, { scheduledFor: parsedDueAt });
      showToast("Guardado na caixa de entrada.");
      handleClose();
      return;
    }

    if (action === "schedule") {
      await updateInboxItem(uid, itemId, {
        scheduledFor: parsedDueAt,
        consequenceIfSkipped: consequence,
        firstStepKnown
      });
      showToast("Guardado para revisar depois.");
      handleClose();
      return;
    }

    const task = await createTask(uid, {
      title: content,
      source: "quick_capture",
      status: "planned",
      dueAt: parsedDueAt,
      consequenceIfSkipped: consequence,
      estimatedMinutes: action === "two_minutes" ? 2 : null,
      firstStep: firstStepKnown && firstStepText.trim() ? firstStepText.trim() : null
    });
    await markConverted(uid, itemId, task.id);
    await recordAction(uid, "start_task");
    showToast(action === "two_minutes" ? "Pronta para começar em 2 minutos." : "Organizada.", "success");
    handleClose();
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Tirar da cabeça">
      {phase === "capture" && (
        <div className="flex flex-col gap-4">
          <TextArea
            label="O que está ocupando sua cabeça?"
            placeholder="Escreva em poucas palavras..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            error={error ?? undefined}
            autoFocus
          />
          {SpeechRecognitionCtor && (
            <button
              type="button"
              onClick={toggleVoice}
              className="self-start text-sm font-medium text-brand-600 hover:underline"
            >
              {listening ? "Parar gravação" : "🎙 Usar voz"}
            </button>
          )}
          <Button onClick={handleSaveCapture} fullWidth>
            Salvar
          </Button>
        </div>
      )}

      {phase === "ask_date" && (
        <QuestionStep
          question="Isso precisa ser feito em algum dia específico?"
          onSkip={() => setPhase("ask_consequence")}
        >
          <TextField
            label="Data (opcional)"
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
          <Button fullWidth onClick={() => setPhase("ask_consequence")}>
            Continuar
          </Button>
        </QuestionStep>
      )}

      {phase === "ask_consequence" && (
        <QuestionStep
          question="Qual é a consequência de não fazer isso?"
          onSkip={() => setPhase("ask_first_step")}
        >
          <div className="flex gap-2">
            {(["low", "medium", "high"] as ImpactLevel[]).map((level) => (
              <Chip key={level} selected={consequence === level} onClick={() => setConsequence(level)}>
                {level === "low" ? "Pouca" : level === "medium" ? "Média" : "Grande"}
              </Chip>
            ))}
          </div>
          <Button fullWidth onClick={() => setPhase("ask_first_step")}>
            Continuar
          </Button>
        </QuestionStep>
      )}

      {phase === "ask_first_step" && (
        <QuestionStep
          question="Você sabe qual é o primeiro passo?"
          onSkip={() => setPhase("choose_action")}
        >
          <div className="flex gap-2">
            <Chip selected={firstStepKnown === true} onClick={() => setFirstStepKnown(true)}>
              Sim
            </Chip>
            <Chip selected={firstStepKnown === false} onClick={() => setFirstStepKnown(false)}>
              Não
            </Chip>
          </div>
          {firstStepKnown && (
            <TextField
              label="Primeiro passo"
              placeholder="Ex.: abrir o arquivo"
              value={firstStepText}
              onChange={(e) => setFirstStepText(e.target.value)}
            />
          )}
          <Button fullWidth onClick={() => setPhase("choose_action")}>
            Continuar
          </Button>
        </QuestionStep>
      )}

      {phase === "choose_action" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-muted">O que você quer fazer com isso agora?</p>
          <Button fullWidth onClick={() => finalize("organize")}>
            Organizar agora
          </Button>
          <Button fullWidth variant="secondary" onClick={() => finalize("two_minutes")}>
            Fazer em menos de 2 minutos
          </Button>
          <Button fullWidth variant="secondary" onClick={() => finalize("schedule")}>
            Agendar para depois
          </Button>
          <Button fullWidth variant="ghost" onClick={() => finalize("inbox")}>
            Guardar na caixa de entrada
          </Button>
        </div>
      )}
    </Sheet>
  );
}

function QuestionStep({
  question,
  onSkip,
  children
}: {
  question: string;
  onSkip: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium text-ink">{question}</p>
      {children}
      <button onClick={onSkip} className="self-center text-sm text-ink-faint hover:text-ink-muted">
        Pular esta pergunta
      </button>
    </div>
  );
}
