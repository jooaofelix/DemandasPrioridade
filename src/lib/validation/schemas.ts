import { z } from "zod";

export const quickCaptureSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Escreva alguma coisa antes de salvar.")
    .max(2000, "Isso é grande demais para uma captura rápida. Tente resumir.")
});
export type QuickCaptureInput = z.infer<typeof quickCaptureSchema>;

export const taskEditSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Dê um nome para a tarefa.")
    .max(280, "Tente um título mais curto."),
  notes: z.string().max(4000).optional().nullable(),
  area: z.enum(["work", "study", "personal", "home"]).optional().nullable(),
  dueAt: z.number().int().positive().optional().nullable(),
  estimatedMinutes: z.number().int().min(1).max(600).optional().nullable(),
  energyRequired: z.enum(["low", "medium", "high"]).optional().nullable(),
  importance: z.enum(["low", "medium", "high"]).optional().nullable(),
  consequenceIfSkipped: z.enum(["low", "medium", "high"]).optional().nullable(),
  isBlockingOtherTasks: z.boolean().optional(),
  firstStep: z.string().max(280).optional().nullable()
});
export type TaskEditInput = z.infer<typeof taskEditSchema>;

export const subtaskTitleSchema = z
  .string()
  .trim()
  .min(1, "O passo precisa de um nome.")
  .max(280, "Tente um passo mais curto.");

export const ifThenPlanSchema = z.object({
  when: z.string().trim().min(1, "Descreva a situação.").max(200),
  then: z.string().trim().min(1, "Descreva a ação.").max(200)
});

export const minimalVersionSchema = z
  .string()
  .trim()
  .min(1, "Descreva a menor versão que ainda conta como avanço.")
  .max(280);

export const blockingThoughtSchema = z.object({
  thought: z.string().trim().min(1, "Escreva o pensamento.").max(500),
  type: z.enum(["fact", "prediction", "demand"]),
  functionalResponse: z.string().trim().min(1, "Escreva uma resposta mais funcional.").max(500)
});

export const estimatePredictionSchema = z.object({
  expectedMinutes: z.number().int().min(1).max(600),
  expectedDifficulty: z.number().int().min(1).max(5)
});

export const actualReflectionSchema = z.object({
  actualMinutes: z.number().int().min(1).max(600),
  actualDifficulty: z.number().int().min(1).max(5),
  note: z.string().max(500).optional()
});

export const routineSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome para a rotina.").max(160),
  description: z.string().max(500).optional().nullable(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).max(7),
  timeOfDay: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use o formato HH:MM.")
    .optional()
    .nullable(),
  linkedEventLabel: z.string().max(120).optional().nullable()
});
export type RoutineInput = z.infer<typeof routineSchema>;

export const routineStepSchema = z.object({
  title: z.string().trim().min(1, "Dê um nome para o passo.").max(200),
  optional: z.boolean().default(false)
});

export const dailyPlanningSchema = z.object({
  energyLevel: z.enum(["low", "medium", "high"]),
  hasScheduledCommitment: z.boolean(),
  worthwhileOutcome: z.string().trim().max(280).optional().nullable(),
  mainPriorityTaskId: z.string().min(1, "Escolha uma prioridade principal."),
  secondaryTaskIds: z.array(z.string()).max(2, "No máximo duas prioridades secundárias."),
  firstStep: z.string().trim().max(280).optional().nullable()
});

export const dayClosingSchema = z.object({
  completedTaskIds: z.array(z.string()),
  advancedTaskIds: z.array(z.string()),
  somethingOnMind: z.string().max(2000).optional().nullable(),
  firstThingTomorrow: z.string().max(280).optional().nullable()
});

export const focusSessionStartSchema = z.object({
  taskId: z.string().nullable(),
  plannedMinutes: z.number().int().min(1).max(240)
});

export const distractionNoteSchema = z.object({
  content: z.string().trim().min(1, "Escreva o pensamento em poucas palavras.").max(500),
  category: z.enum(["respond", "research", "remembered_task", "buy", "other"])
});

export const reminderSchema = z.object({
  type: z.enum(["prepare", "start", "deadline", "resume", "routine", "day_summary", "day_closing"]),
  scheduledAt: z.number().int().positive(),
  style: z.enum(["direct", "warm"]),
  message: z.string().max(280).optional().nullable()
});

export const notificationPreferencesSchema = z.object({
  enabled: z.boolean(),
  quietHoursStart: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .nullable(),
  quietHoursEnd: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .nullable(),
  maxPerDay: z.number().int().min(0).max(20),
  daysOfWeek: z.array(z.number().int().min(0).max(6)),
  style: z.enum(["direct", "warm"])
});

export const userSettingsSchema = z.object({
  energyPeriod: z.enum(["morning", "afternoon", "evening", "variable"]).nullable(),
  reminderStyle: z.enum(["direct", "warm"]),
  maxDailyPriorities: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  gamificationLevel: z.enum(["off", "discrete", "full"]),
  theme: z.enum(["light", "dark", "system"]),
  reducedMotion: z.boolean(),
  focusAreas: z.array(z.enum(["work", "study", "personal", "home"])).max(4)
});

export const onboardingSchema = z.object({
  focusAreas: z.array(z.enum(["work", "study", "personal", "home"])).min(1, "Escolha ao menos uma área."),
  energyPeriod: z.enum(["morning", "afternoon", "evening", "variable"]),
  reminderStyle: z.enum(["direct", "warm"]),
  maxDailyPriorities: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  gamificationLevel: z.enum(["off", "discrete", "full"])
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;
