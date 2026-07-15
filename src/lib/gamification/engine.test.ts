import { describe, expect, it } from "vitest";
import { ENVIRONMENT_STAGES, pointsForAction, pointsToNextStage, stageForPoints } from "./engine";

describe("pointsForAction", () => {
  it("awards points for starting a task, not only completing it", () => {
    expect(pointsForAction("start_task")).toBeGreaterThan(0);
    expect(pointsForAction("complete_task")).toBeGreaterThan(0);
  });

  it("awards points for asking for help and reorganizing, matching the ethics constraints", () => {
    expect(pointsForAction("ask_for_help")).toBeGreaterThan(0);
    expect(pointsForAction("reorganize_day")).toBeGreaterThan(0);
  });
});

describe("stageForPoints", () => {
  it("returns the first stage at zero points", () => {
    expect(stageForPoints(0).stage).toBe(0);
  });

  it("returns the highest stage whose threshold has been reached", () => {
    const stage = stageForPoints(50);
    expect(stage.threshold).toBeLessThanOrEqual(50);
    const nextStage = ENVIRONMENT_STAGES[ENVIRONMENT_STAGES.indexOf(stage) + 1];
    if (nextStage) expect(nextStage.threshold).toBeGreaterThan(50);
  });

  it("never regresses below the lowest stage", () => {
    expect(stageForPoints(-10).stage).toBe(0);
  });
});

describe("pointsToNextStage", () => {
  it("returns null once the final stage is reached", () => {
    const maxThreshold = ENVIRONMENT_STAGES[ENVIRONMENT_STAGES.length - 1].threshold;
    expect(pointsToNextStage(maxThreshold)).toBeNull();
  });

  it("returns a positive remaining amount before the final stage", () => {
    expect(pointsToNextStage(0)).toBeGreaterThan(0);
  });
});
