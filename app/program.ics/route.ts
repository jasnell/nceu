import {
  type Day,
  type Session,
  TIME_ZONE,
  days,
  speakerNames,
  talkText,
} from "../program-data";

const SITE_URL = "https://nodeconf.eu";
const VENUE = "Hotel Savoia Regency, Via del Pilastro 2, 40127 Bologna BO, Italy";

/** RFC 5545 §3.3.11 TEXT escaping. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** RFC 5545 §3.1: fold lines longer than 75 octets without splitting UTF-8. */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let octets = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    // Continuation lines start with a space, which counts toward the limit.
    const limit = parts.length === 0 ? 75 : 74;
    if (octets + size > limit) {
      parts.push(current);
      current = "";
      octets = 0;
    }
    current += char;
    octets += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

const localDateTime = (date: string, time: string) =>
  `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;

function sessionPeople(session: Session): string[] {
  const people = session.speaker ? [session.speaker] : [];
  for (const id of session.coSpeakerIds ?? []) {
    people.push(speakerNames[id] ?? id);
  }
  return people;
}

function sessionEvent(day: Day, session: Session, dtstamp: string): string[] {
  const people = sessionPeople(session);
  const summary = people.length
    ? `${session.title} — ${people.join(" & ")}`
    : session.title;
  const url = session.talkId
    ? `${SITE_URL}/program#${session.talkId}`
    : `${SITE_URL}/program`;
  const abstract = session.talkId ? talkText[session.talkId] : undefined;
  const description = [session.description, abstract, url]
    .filter(Boolean)
    .join("\n\n");
  const uid = session.talkId
    ? `${session.talkId}@nodeconf.eu`
    : `${day.date}-${session.start.replace(":", "")}-${session.type}@nodeconf.eu`;

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=${TIME_ZONE}:${localDateTime(day.date, session.start)}`,
    // `end` is optional in program.yaml; RFC 5545 §3.6.1 allows omitting
    // DTEND, which makes the event a point in time.
    ...(session.end
      ? [`DTEND;TZID=${TIME_ZONE}:${localDateTime(day.date, session.end)}`]
      : []),
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(session.location ? `${session.location}, Bologna` : VENUE)}`,
    `URL:${url}`,
    `CATEGORIES:${session.type.toUpperCase()}`,
    "END:VEVENT",
  ];
}

// Europe/Rome observes CET/CEST; a VTIMEZONE keeps TZID-aware clients happy.
const vtimezone = [
  "BEGIN:VTIMEZONE",
  `TZID:${TIME_ZONE}`,
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

function buildCalendar(): string {
  const dtstamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NodeConf EU//NodeConf EU 2026 Program//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:NodeConf EU 2026",
    `X-WR-TIMEZONE:${TIME_ZONE}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
    ...vtimezone,
    ...days.flatMap((day) =>
      day.sessions.flatMap((session) => sessionEvent(day, session, dtstamp)),
    ),
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function GET(): Response {
  return new Response(buildCalendar(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="nodeconf-eu-2026.ics"',
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Content-Language": "en",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
