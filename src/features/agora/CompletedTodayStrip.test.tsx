import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompletedTodayStrip } from "./CompletedTodayStrip";
import { useTaskStore } from "@/store/taskStore";
import { todayId } from "@/store/dailyPlanStore";
import type { Task } from "@/types";

function makeTask(overrides: Partial<Task>): Task {
  const now = Date.now();
  return {
    id: overrides.id ?? "t1",
    uid: "user-1",
    title: "Tarefa",
    notes: null,
    status: "done",
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
    completedAt: now,
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

afterEach(() => {
  useTaskStore.setState({ tasks: [], loaded: false, subtasksByTaskId: {} });
});

describe("CompletedTodayStrip", () => {
  it("renders nothing when no task was completed today", () => {
    useTaskStore.setState({ tasks: [] });
    const { container } = render(<CompletedTodayStrip />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists tasks completed today", () => {
    const completedToday = makeTask({ id: "t1", title: "Responder e-mail", completedAt: Date.now() });
    useTaskStore.setState({ tasks: [completedToday] });
    render(<CompletedTodayStrip />);
    expect(screen.getByText("1 tarefa concluída hoje")).toBeInTheDocument();
    expect(screen.getByText("Responder e-mail")).toBeInTheDocument();
  });

  it("does not count tasks completed on a previous day", () => {
    const yesterday = new Date(`${todayId()}T00:00:00`).getTime() - 60 * 60 * 1000;
    const oldTask = makeTask({ id: "t2", completedAt: yesterday });
    useTaskStore.setState({ tasks: [oldTask] });
    const { container } = render(<CompletedTodayStrip />);
    expect(container).toBeEmptyDOMElement();
  });
});
