import type { Reminder } from "@/types";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Suporta períodos que cruzam a meia-noite (ex.: 22:00–08:00). */
export function isWithinQuietHours(date: Date, quietStart: string | null, quietEnd: string | null): boolean {
  if (!quietStart || !quietEnd) return false;
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const start = toMinutes(quietStart);
  const end = toMinutes(quietEnd);
  if (start === end) return false;
  if (start < end) return nowMinutes >= start && nowMinutes < end;
  return nowMinutes >= start || nowMinutes < end;
}

export function dueReminders(reminders: Reminder[], now: number): Reminder[] {
  return reminders.filter((r) => r.status === "scheduled" && r.scheduledAt <= now);
}

export function countSentToday(reminders: Reminder[], now: number): number {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  return reminders.filter((r) => r.status === "sent" && r.updatedAt >= dayStart.getTime()).length;
}
