// Time logic for the attendee app, kept free of React and build-time imports
// so it can be unit-tested (test/attendee-schedule.test.ts).
//
// Program times are Bologna wall-clock times; "now" is converted to the same
// clock, so the app is right wherever the phone thinks it is.
import type { Day, Session } from "../program-data";

export type SessionRef = { dayIndex: number; index: number };

export type Timeline = {
  /** before: ahead of day one; live: an event day (or between days); after: all done. */
  phase: "before" | "live" | "after";
  current?: SessionRef;
  next?: SessionRef;
  /** The day to open on: today during the event, otherwise day one. */
  dayIndex: number;
};

/** Sessions without an `end` run until the next one starts, or this long. */
const DEFAULT_LENGTH_MINUTES = 60;

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** 615 → "10:15". */
export function formatClock(minutes: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}`;
}

/** The wall-clock date (YYYY-MM-DD) and minute of the day in `timeZone`. */
export function wallClock(now: Date, timeZone: string): { date: string; minutes: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export function sessionEndMinutes(day: Day, index: number): number {
  const session = day.sessions[index];
  if (session.end) return toMinutes(session.end);
  const following = day.sessions[index + 1];
  return following ? toMinutes(following.start) : toMinutes(session.start) + DEFAULT_LENGTH_MINUTES;
}

export function timeline(days: Day[], now: Date, timeZone: string): Timeline {
  const clock = wallClock(now, timeZone);
  const todayIndex = days.findIndex((d) => d.date === clock.date);

  let current: SessionRef | undefined;
  let next: SessionRef | undefined;
  days.forEach((day, dayIndex) => {
    day.sessions.forEach((session, index) => {
      const start = toMinutes(session.start);
      if (
        day.date === clock.date &&
        start <= clock.minutes &&
        clock.minutes < sessionEndMinutes(day, index)
      ) {
        // Overlapping sessions (e.g. two socials): the latest started wins.
        current = { dayIndex, index };
      }
      const isLater = day.date > clock.date || (day.date === clock.date && start > clock.minutes);
      if (!next && isLater) next = { dayIndex, index };
    });
  });

  const first = days[0];
  const phase =
    first && clock.date < first.date ? "before" : !current && !next ? "after" : "live";
  return { phase, current, next, dayIndex: todayIndex >= 0 ? todayIndex : 0 };
}

/** Minutes from now until a session starts (negative once it has). */
export function minutesUntil(day: Day, session: Session, now: Date, timeZone: string): number {
  const clock = wallClock(now, timeZone);
  const dayDiff = Math.round(
    (Date.parse(`${day.date}T00:00:00Z`) - Date.parse(`${clock.date}T00:00:00Z`)) / 86_400_000,
  );
  return dayDiff * 24 * 60 + toMinutes(session.start) - clock.minutes;
}

/** Stable id for starring: the talk id when there is one, else day + start time. */
export function sessionKey(day: Day, session: Session): string {
  return session.talkId ?? `${day.date}@${session.start}`;
}

/** "in 5 min", "in 1 h 20 min", "in 3 days". */
export function formatCountdown(minutes: number): string {
  if (minutes < 1) return "now";
  if (minutes < 60) return `in ${minutes} min`;
  if (minutes < 24 * 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `in ${h} h ${m} min` : `in ${h} h`;
  }
  const days = Math.round(minutes / (24 * 60));
  return `in ${days} day${days === 1 ? "" : "s"}`;
}
