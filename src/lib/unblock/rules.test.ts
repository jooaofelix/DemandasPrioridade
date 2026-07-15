import { describe, expect, it } from "vitest";
import { firstMovementExamples, interventionFor, INTERVENTION_LABELS, OBSTACLE_LABELS } from "./rules";
import type { UnblockObstacle } from "@/types";

describe("interventionFor", () => {
  it("returns exactly one intervention for every obstacle", () => {
    (Object.keys(OBSTACLE_LABELS) as UnblockObstacle[]).forEach((obstacle) => {
      const intervention = interventionFor(obstacle);
      expect(INTERVENTION_LABELS[intervention]).toBeDefined();
    });
  });

  it("maps 'too_big' to splitting the task", () => {
    expect(interventionFor("too_big")).toBe("split_task");
  });
});

describe("firstMovementExamples", () => {
  it("returns at least one concrete example for every intervention", () => {
    (Object.keys(OBSTACLE_LABELS) as UnblockObstacle[]).forEach((obstacle) => {
      const examples = firstMovementExamples(interventionFor(obstacle), "Tarefa de teste");
      expect(examples.length).toBeGreaterThan(0);
    });
  });
});
