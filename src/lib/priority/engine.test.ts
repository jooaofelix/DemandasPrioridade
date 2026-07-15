import { describe, expect, it } from "vitest";
import { rankTasks, scoreTask, selectAgoraPriorities } from "./engine";
import type { PriorityContext, Task } from "@/types";

const NOW = new Date("2026-07-15T12:00:00Z").getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    uid: "user-1",
    title: "Tarefa de teste",
    notes: null,
    status: "planned",
    source: "manual",
    area: null,
    dueAt: null,
    estimatedMinutes: null,
    energyRequired: null,
    importance: null,
    consequenceIfSkipped: null,
    isBlockingOtherTasks: false,
    dependsOnTaskIds: [],
    manualPriorityPin: false,
    firstStep: null,
    minimalVersion: null,
    ifThenPlan: null,
    blockingThought: null,
    estimatePrediction: null,
    actualReflection: null,
    rewardId: null,
    completedAt: null,
    postponedCount: 0,
    lastTouchedAt: NOW,
    version: 1,
    createdAt: NOW,
    updatedAt: NOW,
    archivedAt: null,
    deletedAt: null,
    ...overrides
  };
}

function makeContext(tasks: Task[], overrides: Partial<PriorityContext> = {}): PriorityContext {
  return {
    now: NOW,
    currentEnergy: null,
    hasScheduledCommitmentToday: false,
    allTasks: tasks,
    ...overrides
  };
}

describe("scoreTask", () => {
  it("gives an overdue task a higher score than one due soon", () => {
    const overdue = makeTask({ id: "overdue", dueAt: NOW - DAY_MS });
    const dueSoon = makeTask({ id: "due-soon", dueAt: NOW + DAY_MS / 2 });
    const ctx = makeContext([overdue, dueSoon]);
    const overdueScore = scoreTask(overdue, ctx, new Map()).score;
    const dueSoonScore = scoreTask(dueSoon, ctx, new Map()).score;
    expect(overdueScore).toBeGreaterThan(dueSoonScore);
  });

  it("rewards tasks that match current energy", () => {
    const matching = makeTask({ id: "matching", energyRequired: "low" });
    const ctx = makeContext([matching], { currentEnergy: "low" });
    const { score, reasons } = scoreTask(matching, ctx, new Map());
    expect(score).toBeGreaterThan(0);
    expect(reasons.some((r) => r.key === "matches_energy")).toBe(true);
  });

  it("penalizes tasks that require more energy than is available", () => {
    const demanding = makeTask({ id: "demanding", energyRequired: "high" });
    const ctxLowEnergy = makeContext([demanding], { currentEnergy: "low" });
    const ctxHighEnergy = makeContext([demanding], { currentEnergy: "high" });
    const lowScore = scoreTask(demanding, ctxLowEnergy, new Map()).score;
    const highScore = scoreTask(demanding, ctxHighEnergy, new Map()).score;
    expect(lowScore).toBeLessThan(highScore);
  });

  it("marks a task blocked by an incomplete dependency and heavily deprioritizes it", () => {
    const dependency = makeTask({ id: "dep", status: "planned" });
    const dependent = makeTask({
      id: "dependent",
      dueAt: NOW - DAY_MS,
      dependsOnTaskIds: ["dep"]
    });
    const byId = new Map([[dependency.id, dependency]]);
    const ctx = makeContext([dependency, dependent]);
    const { score, blocked } = scoreTask(dependent, ctx, byId);
    expect(blocked).toBe(true);
    expect(score).toBeLessThan(0);
  });

  it("does not consider a task blocked once its dependency is done", () => {
    const dependency = makeTask({ id: "dep", status: "done" });
    const dependent = makeTask({ id: "dependent", dependsOnTaskIds: ["dep"] });
    const byId = new Map([[dependency.id, dependency]]);
    const ctx = makeContext([dependency, dependent]);
    const { blocked } = scoreTask(dependent, ctx, byId);
    expect(blocked).toBe(false);
  });

  it("gives a short task a quick-win reason", () => {
    const quick = makeTask({ id: "quick", estimatedMinutes: 10 });
    const ctx = makeContext([quick]);
    const { reasons } = scoreTask(quick, ctx, new Map());
    expect(reasons.some((r) => r.key === "quick_win")).toBe(true);
  });

  it("flags a task that has been stalled for a long time", () => {
    const stalled = makeTask({ id: "stalled", lastTouchedAt: NOW - 5 * DAY_MS });
    const ctx = makeContext([stalled]);
    const { reasons } = scoreTask(stalled, ctx, new Map());
    expect(reasons.some((r) => r.key === "stalled_long")).toBe(true);
  });
});

describe("rankTasks", () => {
  it("always ranks a manually pinned task first", () => {
    const urgent = makeTask({ id: "urgent", dueAt: NOW - DAY_MS });
    const pinned = makeTask({ id: "pinned", manualPriorityPin: true });
    const ranked = rankTasks(makeContext([urgent, pinned]));
    expect(ranked[0].task.id).toBe("pinned");
  });

  it("excludes done, cancelled and archived tasks", () => {
    const done = makeTask({ id: "done", status: "done" });
    const cancelled = makeTask({ id: "cancelled", status: "cancelled" });
    const archived = makeTask({ id: "archived", archivedAt: NOW });
    const active = makeTask({ id: "active" });
    const ranked = rankTasks(makeContext([done, cancelled, archived, active]));
    expect(ranked.map((r) => r.task.id)).toEqual(["active"]);
  });

  it("breaks ties by earlier due date", () => {
    const later = makeTask({ id: "later", dueAt: NOW + 5 * DAY_MS });
    const sooner = makeTask({ id: "sooner", dueAt: NOW + DAY_MS });
    const ranked = rankTasks(makeContext([later, sooner]));
    expect(ranked[0].task.id).toBe("sooner");
  });
});

describe("selectAgoraPriorities", () => {
  it("returns at most one main task and two secondary tasks", () => {
    const tasks = Array.from({ length: 6 }, (_, i) =>
      makeTask({ id: `t${i}`, dueAt: NOW + i * DAY_MS })
    );
    const { main, secondary } = selectAgoraPriorities(makeContext(tasks));
    expect(main).not.toBeNull();
    expect(secondary.length).toBeLessThanOrEqual(2);
    expect(secondary.map((s) => s.task.id)).not.toContain(main?.task.id);
  });

  it("returns null main when there are no eligible tasks", () => {
    const { main, secondary } = selectAgoraPriorities(makeContext([]));
    expect(main).toBeNull();
    expect(secondary).toHaveLength(0);
  });
});
