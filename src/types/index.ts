/** Epoch milliseconds. Firestore Timestamps are converted to/from this at the data-access boundary. */
export type EpochMs = number;

export type EnergyLevel = "low" | "medium" | "high";

export type Mood = "full_head" | "fine" | "accelerated" | "tired" | "stuck";

export type TaskArea = "work" | "study" | "personal" | "home";

export type TaskStatus =
  | "inbox"
  | "planned"
  | "active"
  | "done"
  | "postponed"
  | "cancelled";

export type TaskSource =
  | "quick_capture"
  | "manual"
  | "routine"
  | "breakdown"
  | "onboarding";

export type ImpactLevel = "low" | "medium" | "high";

export interface WithOwner {
  uid: string;
}

export interface WithTimestamps {
  createdAt: EpochMs;
  updatedAt: EpochMs;
}

export interface SoftDeletable {
  archivedAt?: EpochMs | null;
  deletedAt?: EpochMs | null;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface AppUser extends WithOwner, WithTimestamps {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  timezone: string;
  onboardingCompletedAt: EpochMs | null;
}

export type ReminderStyle = "direct" | "warm";
export type GamificationLevel = "off" | "discrete" | "full";
export type ThemePreference = "light" | "dark" | "system";

export interface UserSettings extends WithOwner, WithTimestamps {
  energyPeriod: "morning" | "afternoon" | "evening" | "variable" | null;
  reminderStyle: ReminderStyle;
  maxDailyPriorities: 1 | 2 | 3;
  gamificationLevel: GamificationLevel;
  theme: ThemePreference;
  reducedMotion: boolean;
  focusAreas: TaskArea[];
  version: number;
}

export type ReminderType =
  | "prepare"
  | "start"
  | "deadline"
  | "resume"
  | "routine"
  | "day_summary"
  | "day_closing";

export interface NotificationPreferences extends WithOwner, WithTimestamps {
  enabled: boolean;
  quietHoursStart: string | null; // "22:00"
  quietHoursEnd: string | null; // "08:00"
  maxPerDay: number;
  daysOfWeek: number[]; // 0 (domingo) - 6 (sábado)
  style: ReminderStyle;
  typesEnabled: Record<ReminderType, boolean>;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export interface IfThenPlan {
  when: string;
  then: string;
}

export type BlockingThoughtType = "fact" | "prediction" | "demand";

export interface BlockingThought {
  thought: string;
  type: BlockingThoughtType;
  functionalResponse: string;
}

export interface EstimatePrediction {
  expectedMinutes: number;
  expectedDifficulty: 1 | 2 | 3 | 4 | 5;
  recordedAt: EpochMs;
}

export interface ActualReflection {
  actualMinutes: number;
  actualDifficulty: 1 | 2 | 3 | 4 | 5;
  note?: string;
  recordedAt: EpochMs;
}

export interface Task extends WithOwner, WithTimestamps, SoftDeletable {
  id: string;
  title: string;
  notes: string | null;
  status: TaskStatus;
  source: TaskSource;
  area: TaskArea | null;
  dueAt: EpochMs | null;
  estimatedMinutes: number | null;
  energyRequired: EnergyLevel | null;
  importance: ImpactLevel | null;
  consequenceIfSkipped: ImpactLevel | null;
  isBlockingOtherTasks: boolean;
  dependsOnTaskIds: string[];
  manualPriorityPin: boolean;
  firstStep: string | null;
  minimalVersion: string | null;
  ifThenPlan: IfThenPlan | null;
  blockingThought: BlockingThought | null;
  estimatePrediction: EstimatePrediction | null;
  actualReflection: ActualReflection | null;
  rewardId: string | null;
  completedAt: EpochMs | null;
  postponedCount: number;
  lastTouchedAt: EpochMs;
  version: number;
}

export interface TaskDependency {
  taskId: string;
  dependsOnTaskId: string;
}

export interface Subtask extends WithOwner, WithTimestamps {
  id: string;
  taskId: string;
  title: string;
  done: boolean;
  order: number;
  completedAt: EpochMs | null;
}

// ---------------------------------------------------------------------------
// Inbox (descarga mental)
// ---------------------------------------------------------------------------

export interface InboxItem extends WithOwner, WithTimestamps {
  id: string;
  content: string;
  processed: boolean;
  scheduledFor: EpochMs | null;
  consequenceIfSkipped: string | null;
  firstStepKnown: boolean | null;
  convertedTaskId: string | null;
  archivedAt: EpochMs | null;
}

// ---------------------------------------------------------------------------
// Daily plans / rituals
// ---------------------------------------------------------------------------

export interface DailyPlan extends WithOwner, WithTimestamps {
  id: string; // "YYYY-MM-DD" local
  date: string;
  energyLevel: EnergyLevel | null;
  mood: Mood | null;
  hasScheduledCommitment: boolean;
  worthwhileOutcome: string | null;
  mainPriorityTaskId: string | null;
  secondaryTaskIds: string[];
  notNormalDay: boolean;
  closedAt: EpochMs | null;
  closingNotes: {
    completedTaskIds: string[];
    advancedTaskIds: string[];
    somethingOnMind: string | null;
    firstThingTomorrow: string | null;
  } | null;
}

// ---------------------------------------------------------------------------
// Routines
// ---------------------------------------------------------------------------

export interface Routine extends WithOwner, WithTimestamps, SoftDeletable {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  daysOfWeek: number[];
  timeOfDay: string | null;
  linkedEventLabel: string | null;
  active: boolean;
  lastRunDate: string | null;
  lastRunCompletedStepIds: string[];
}

export interface RoutineStep extends WithOwner, WithTimestamps {
  id: string;
  routineId: string;
  title: string;
  order: number;
  optional: boolean;
}

// ---------------------------------------------------------------------------
// Focus mode
// ---------------------------------------------------------------------------

export type FocusOutcome = "completed" | "partial" | "abandoned" | null;

export interface FocusPausedInterval {
  start: EpochMs;
  end: EpochMs | null;
}

export interface FocusSession extends WithOwner, WithTimestamps {
  id: string;
  taskId: string | null;
  plannedMinutes: number;
  startedAt: EpochMs;
  endedAt: EpochMs | null;
  pausedIntervals: FocusPausedInterval[];
  outcome: FocusOutcome;
  distractionCount: number;
  nextStepChanged: boolean;
}

export type DistractionCategory =
  | "respond"
  | "research"
  | "remembered_task"
  | "buy"
  | "other";

export interface DistractionNote extends WithOwner, WithTimestamps {
  id: string;
  focusSessionId: string;
  content: string;
  category: DistractionCategory;
  resolved: boolean;
}

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------

export type ReminderStatus =
  | "scheduled"
  | "sent"
  | "snoozed"
  | "dismissed"
  | "cancelled";

export interface Reminder extends WithOwner, WithTimestamps {
  id: string;
  taskId: string | null;
  routineId: string | null;
  type: ReminderType;
  scheduledAt: EpochMs;
  style: ReminderStyle;
  message: string | null;
  status: ReminderStatus;
  snoozeCount: number;
}

// ---------------------------------------------------------------------------
// Energy check-ins
// ---------------------------------------------------------------------------

export interface EnergyCheckin extends WithOwner {
  id: string;
  level: EnergyLevel;
  mood: Mood | null;
  notNormalDay: boolean;
  createdAt: EpochMs;
}

// ---------------------------------------------------------------------------
// Weekly review
// ---------------------------------------------------------------------------

export interface WeeklyReview extends WithOwner {
  id: string;
  weekStart: string;
  weekEnd: string;
  completedCount: number;
  startedCount: number;
  mostPostponedTaskIds: string[];
  bestStartWindow: string | null;
  estimateAccuracyRatio: number | null;
  mostUsedRoutineIds: string[];
  removedOrDelegatedCount: number;
  insights: string[];
  createdAt: EpochMs;
}

// ---------------------------------------------------------------------------
// Rewards & achievements (gamificação ética)
// ---------------------------------------------------------------------------

export type RewardKind =
  | "coffee"
  | "music"
  | "video"
  | "rest"
  | "minigame"
  | "talk"
  | "walk"
  | "custom";

export interface Reward extends WithOwner {
  id: string;
  taskId: string | null;
  label: string;
  kind: RewardKind;
  plannedAt: EpochMs | null;
  takenAt: EpochMs | null;
  createdAt: EpochMs;
}

export type AchievementKey =
  | "started_first_task"
  | "captured_first_thought"
  | "split_a_task"
  | "asked_for_help"
  | "cancelled_with_clarity"
  | "replanned_day"
  | "made_minimal_version"
  | "resumed_after_break"
  | "respected_own_limit"
  | "completed_five_tasks"
  | "used_focus_mode";

export interface Achievement extends WithOwner {
  id: string;
  key: AchievementKey;
  unlockedAt: EpochMs;
  meta: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Unblock ("Destravar") + Breakdown ("Quebrar em pedaços")
// ---------------------------------------------------------------------------

export type UnblockObstacle =
  | "too_big"
  | "dont_know_where"
  | "boring"
  | "tired"
  | "anxious"
  | "distracted"
  | "missing_something"
  | "cant_explain";

export type UnblockIntervention =
  | "split_task"
  | "minimal_version"
  | "prepare_environment"
  | "two_minutes"
  | "remove_distraction"
  | "register_thought"
  | "reschedule"
  | "ask_for_help"
  | "identify_missing_item";

// ---------------------------------------------------------------------------
// Priority engine
// ---------------------------------------------------------------------------

export interface PriorityContext {
  now: EpochMs;
  currentEnergy: EnergyLevel | null;
  hasScheduledCommitmentToday: boolean;
  allTasks: Task[];
}

export interface PriorityReason {
  key:
    | "due_soon"
    | "overdue"
    | "unblocks_others"
    | "matches_energy"
    | "quick_win"
    | "marked_important"
    | "easily_reschedulable"
    | "stalled_long"
    | "manual_pin";
  label: string;
}

export interface PriorityResult {
  task: Task;
  score: number;
  reasons: PriorityReason[];
}
