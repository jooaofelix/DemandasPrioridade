import { describe, expect, it } from "vitest";
import { computeWeeklyReview } from "./compute";
import type { Task } from "@/types";

const NOW = new Date("2026-07-15T12:00:00Z").getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    uid: "user-1",
    title: "Tarefa",
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

describe("computeWeeklyReview", () => {
  it("counts tasks completed within the last 7 days", () => {
    const recent = makeTask({ completedAt: NOW - DAY_MS });
    const old = makeTask({ completedAt: NOW - 20 * DAY_MS });
    const review = computeWeeklyReview([recent, old], [], NOW);
    expect(review.completedCount).toBe(1);
  });

  it("flags tasks postponed twice or more", () => {
    const postponed = makeTask({ postponedCount: 3, title: "Relatório" });
    const review = computeWeeklyReview([postponed], [], NOW);
    expect(review.mostPostponedTaskIds).toContain(postponed.id);
    expect(review.insights.some((i) => i.includes("Relatório"))).toBe(true);
  });

  it("never produces clinical language in insights", () => {
    const postponed = makeTask({ postponedCount: 5, title: "X" });
    const review = computeWeeklyReview([postponed], [], NOW);
    review.insights.forEach((insight) => {
      expect(insight.toLowerCase()).not.toContain("tdah");
      expect(insight.toLowerCase()).not.toContain("diagnóstic");
    });
  });

  it("returns null estimate accuracy when there is no data", () => {
    const review = computeWeeklyReview([makeTask()], [], NOW);
    expect(review.estimateAccuracyRatio).toBeNull();
  });
});
