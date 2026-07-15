import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainTaskCard } from "./MainTaskCard";
import type { PriorityResult, Task } from "@/types";

function makeTask(overrides: Partial<Task> = {}): Task {
  const now = Date.now();
  return {
    id: "task-1",
    uid: "user-1",
    title: "Escrever relatório",
    notes: null,
    status: "planned",
    source: "manual",
    area: "work",
    dueAt: null,
    estimatedMinutes: 15,
    energyRequired: "medium",
    importance: null,
    consequenceIfSkipped: null,
    isBlockingOtherTasks: false,
    dependsOnTaskIds: [],
    manualPriorityPin: false,
    firstStep: "Abrir o editor",
    minimalVersion: null,
    ifThenPlan: null,
    blockingThought: null,
    estimatePrediction: null,
    actualReflection: null,
    rewardId: null,
    completedAt: null,
    postponedCount: 0,
    lastTouchedAt: now,
    version: 1,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
    deletedAt: null,
    ...overrides
  };
}

function makeResult(overrides: Partial<Task> = {}): PriorityResult {
  return {
    task: makeTask(overrides),
    score: 42,
    reasons: [{ key: "quick_win", label: "É rápida e pode aliviar sua lista" }]
  };
}

describe("MainTaskCard", () => {
  it("shows the task title, first step and suggestion reason", () => {
    render(
      <MainTaskCard
        result={makeResult()}
        onStart={vi.fn()}
        onTwoMinutes={vi.fn()}
        onBreakdown={vi.fn()}
        onUnblock={vi.fn()}
        onSwap={vi.fn()}
        onOpenDetail={vi.fn()}
      />
    );
    expect(screen.getByText("Escrever relatório")).toBeInTheDocument();
    expect(screen.getByText(/Abrir o editor/)).toBeInTheDocument();
    expect(screen.getByText(/é rápida e pode aliviar sua lista/i)).toBeInTheDocument();
  });

  it("calls onStart when 'Começar agora' is clicked", async () => {
    const onStart = vi.fn();
    render(
      <MainTaskCard
        result={makeResult()}
        onStart={onStart}
        onTwoMinutes={vi.fn()}
        onBreakdown={vi.fn()}
        onUnblock={vi.fn()}
        onSwap={vi.fn()}
        onOpenDetail={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Começar agora" }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("calls onUnblock when 'Não consigo começar' is clicked", async () => {
    const onUnblock = vi.fn();
    render(
      <MainTaskCard
        result={makeResult()}
        onStart={vi.fn()}
        onTwoMinutes={vi.fn()}
        onBreakdown={vi.fn()}
        onUnblock={onUnblock}
        onSwap={vi.fn()}
        onOpenDetail={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Não consigo começar" }));
    expect(onUnblock).toHaveBeenCalledTimes(1);
  });
});
