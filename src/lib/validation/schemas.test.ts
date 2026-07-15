import { describe, expect, it } from "vitest";
import {
  dailyPlanningSchema,
  ifThenPlanSchema,
  quickCaptureSchema,
  routineSchema,
  taskEditSchema
} from "./schemas";

describe("quickCaptureSchema", () => {
  it("rejects empty content", () => {
    const result = quickCaptureSchema.safeParse({ content: "   " });
    expect(result.success).toBe(false);
  });

  it("accepts trimmed content", () => {
    const result = quickCaptureSchema.safeParse({ content: "  ligar para o dentista  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("ligar para o dentista");
    }
  });

  it("rejects content over 2000 characters", () => {
    const result = quickCaptureSchema.safeParse({ content: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });
});

describe("taskEditSchema", () => {
  it("requires a title", () => {
    const result = taskEditSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("accepts a minimal valid task", () => {
    const result = taskEditSchema.safeParse({ title: "Escrever relatório" });
    expect(result.success).toBe(true);
  });

  it("rejects estimated minutes outside the allowed range", () => {
    const result = taskEditSchema.safeParse({ title: "x", estimatedMinutes: 0 });
    expect(result.success).toBe(false);
  });
});

describe("ifThenPlanSchema", () => {
  it("requires both when and then", () => {
    expect(ifThenPlanSchema.safeParse({ when: "", then: "abrir o material" }).success).toBe(false);
    expect(
      ifThenPlanSchema.safeParse({ when: "forem 19h", then: "abrir o material" }).success
    ).toBe(true);
  });
});

describe("routineSchema", () => {
  it("rejects an invalid time format", () => {
    const result = routineSchema.safeParse({
      name: "Manhã",
      daysOfWeek: [1, 2, 3],
      timeOfDay: "25:99"
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid routine", () => {
    const result = routineSchema.safeParse({
      name: "Manhã",
      daysOfWeek: [1, 2, 3, 4, 5],
      timeOfDay: "07:30"
    });
    expect(result.success).toBe(true);
  });
});

describe("dailyPlanningSchema", () => {
  it("rejects more than two secondary priorities", () => {
    const result = dailyPlanningSchema.safeParse({
      energyLevel: "medium",
      hasScheduledCommitment: false,
      mainPriorityTaskId: "task-1",
      secondaryTaskIds: ["a", "b", "c"]
    });
    expect(result.success).toBe(false);
  });

  it("requires a main priority", () => {
    const result = dailyPlanningSchema.safeParse({
      energyLevel: "medium",
      hasScheduledCommitment: false,
      mainPriorityTaskId: "",
      secondaryTaskIds: []
    });
    expect(result.success).toBe(false);
  });
});
