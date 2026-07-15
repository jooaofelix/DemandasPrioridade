import { describe, expect, it } from "vitest";
import { countSentToday, dueReminders, isWithinQuietHours } from "./scheduler";
import type { Reminder } from "@/types";

function makeReminder(overrides: Partial<Reminder> = {}): Reminder {
  const now = Date.now();
  return {
    id: Math.random().toString(36).slice(2),
    uid: "user-1",
    taskId: null,
    routineId: null,
    type: "start",
    scheduledAt: now,
    style: "warm",
    message: null,
    status: "scheduled",
    snoozeCount: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

describe("isWithinQuietHours", () => {
  it("handles a normal same-day window", () => {
    const date = new Date("2026-07-15T13:00:00");
    expect(isWithinQuietHours(date, "12:00", "14:00")).toBe(true);
    expect(isWithinQuietHours(date, "15:00", "16:00")).toBe(false);
  });

  it("handles a window that crosses midnight", () => {
    const late = new Date("2026-07-15T23:30:00");
    const early = new Date("2026-07-15T02:00:00");
    const midday = new Date("2026-07-15T13:00:00");
    expect(isWithinQuietHours(late, "22:00", "08:00")).toBe(true);
    expect(isWithinQuietHours(early, "22:00", "08:00")).toBe(true);
    expect(isWithinQuietHours(midday, "22:00", "08:00")).toBe(false);
  });

  it("returns false when quiet hours are not configured", () => {
    expect(isWithinQuietHours(new Date(), null, null)).toBe(false);
  });
});

describe("dueReminders", () => {
  it("returns only scheduled reminders whose time has passed", () => {
    const now = Date.now();
    const due = makeReminder({ scheduledAt: now - 1000 });
    const future = makeReminder({ scheduledAt: now + 100000 });
    const sent = makeReminder({ scheduledAt: now - 1000, status: "sent" });
    expect(dueReminders([due, future, sent], now)).toEqual([due]);
  });
});

describe("countSentToday", () => {
  it("counts only reminders sent since midnight", () => {
    const now = new Date("2026-07-15T15:00:00").getTime();
    const todayMorning = new Date("2026-07-15T07:00:00").getTime();
    const yesterday = new Date("2026-07-14T20:00:00").getTime();
    const reminders = [
      makeReminder({ status: "sent", updatedAt: todayMorning }),
      makeReminder({ status: "sent", updatedAt: yesterday }),
      makeReminder({ status: "scheduled", updatedAt: todayMorning })
    ];
    expect(countSentToday(reminders, now)).toBe(1);
  });
});
