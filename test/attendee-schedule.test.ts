/**
 * Tests for the attendee app's time logic. Times are given as UTC instants
 * and checked against Bologna wall-clock time (UTC+2 in late September).
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  formatCountdown,
  minutesUntil,
  sessionEndMinutes,
  sessionKey,
  timeline,
  wallClock,
} from "../app/app/schedule.ts";

const TZ = "Europe/Rome";

const days = [
  {
    date: "2026-09-29",
    label: "Day One",
    sessions: [
      { start: "08:30", end: "09:00", type: "break", title: "Coffee" },
      { start: "09:00", end: "09:30", type: "talk", title: "Keynote", talkId: "keynote" },
      { start: "09:30", type: "talk", title: "No end" },
      { start: "11:00", type: "social", title: "Last, no end" },
    ],
  },
  {
    date: "2026-09-30",
    label: "Day Two",
    sessions: [{ start: "09:00", end: "10:00", type: "talk", title: "Morning" }],
  },
] as const;

// Deep-mutable copy so the tuple literal satisfies the `Day[]` type.
const program = JSON.parse(JSON.stringify(days));

/** An instant at Bologna wall-clock `date time` (CEST, UTC+2). */
const at = (date: string, time: string) => new Date(`${date}T${time}:00+02:00`);

describe("wallClock", () => {
  test("converts to Bologna time across UTC midnight", () => {
    assert.deepEqual(wallClock(new Date("2026-09-28T23:30:00Z"), TZ), {
      date: "2026-09-29",
      minutes: 1 * 60 + 30,
    });
  });
});

describe("sessionEndMinutes", () => {
  test("uses end, then the next start, then a default length", () => {
    assert.equal(sessionEndMinutes(program[0], 1), 9 * 60 + 30);
    assert.equal(sessionEndMinutes(program[0], 2), 11 * 60);
    assert.equal(sessionEndMinutes(program[0], 3), 12 * 60);
  });
});

describe("timeline", () => {
  test("before the event opens on day one with the first session next", () => {
    const t = timeline(program, at("2026-09-20", "12:00"), TZ);
    assert.equal(t.phase, "before");
    assert.equal(t.dayIndex, 0);
    assert.equal(t.current, undefined);
    assert.deepEqual(t.next, { dayIndex: 0, index: 0 });
  });

  test("early on an event day there is no current session yet", () => {
    const t = timeline(program, at("2026-09-29", "08:00"), TZ);
    assert.equal(t.phase, "live");
    assert.equal(t.current, undefined);
    assert.deepEqual(t.next, { dayIndex: 0, index: 0 });
  });

  test("during a session reports it and the one after", () => {
    const t = timeline(program, at("2026-09-29", "09:10"), TZ);
    assert.deepEqual(t.current, { dayIndex: 0, index: 1 });
    assert.deepEqual(t.next, { dayIndex: 0, index: 2 });
  });

  test("a session starts exactly on its start minute and ends before its end", () => {
    assert.deepEqual(timeline(program, at("2026-09-29", "09:30"), TZ).current, {
      dayIndex: 0,
      index: 2,
    });
  });

  test("the evening of day one points at day two and opens on day one", () => {
    const t = timeline(program, at("2026-09-29", "21:00"), TZ);
    assert.equal(t.phase, "live");
    assert.equal(t.current, undefined);
    assert.deepEqual(t.next, { dayIndex: 1, index: 0 });
    assert.equal(t.dayIndex, 0);
  });

  test("opens on day two during day two", () => {
    assert.equal(timeline(program, at("2026-09-30", "09:30"), TZ).dayIndex, 1);
  });

  test("after the last session everything is done", () => {
    const t = timeline(program, at("2026-09-30", "10:00"), TZ);
    assert.equal(t.phase, "after");
    assert.equal(t.current, undefined);
    assert.equal(t.next, undefined);
  });
});

describe("minutesUntil", () => {
  test("counts across days", () => {
    const now = at("2026-09-29", "21:00");
    assert.equal(minutesUntil(program[1], program[1].sessions[0], now, TZ), 12 * 60);
  });
});

describe("sessionKey", () => {
  test("prefers the talk id and falls back to day + start", () => {
    assert.equal(sessionKey(program[0], program[0].sessions[1]), "keynote");
    assert.equal(sessionKey(program[0], program[0].sessions[0]), "2026-09-29@08:30");
  });
});

describe("formatCountdown", () => {
  test("reads naturally at each scale", () => {
    assert.equal(formatCountdown(0), "now");
    assert.equal(formatCountdown(5), "in 5 min");
    assert.equal(formatCountdown(60), "in 1 h");
    assert.equal(formatCountdown(80), "in 1 h 20 min");
    assert.equal(formatCountdown(24 * 60), "in 1 day");
    assert.equal(formatCountdown(5 * 24 * 60), "in 5 days");
  });
});
