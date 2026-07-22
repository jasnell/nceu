/**
 * Content integrity checks.
 *
 * The site is stitched together from three files that reference each other by
 * id: `content/program.yaml` points at `content/speakers/*.md` (via
 * `speakerId`) and `content/talks/*.md` (via `talkId`), and each talk points
 * back at its speaker. Nothing in the build fails when one of those ids is
 * wrong — a bad `talkId` just renders a session with no abstract, and a bad
 * `speakerId` renders a link to an anchor that does not exist. Both look fine
 * until someone clicks.
 *
 * `validateContent()` walks that graph and reports what is broken. Run via
 * `npm run check` (and automatically before `npm run build`).
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));

/** Link keys the speakers page knows how to render; anything else is dropped silently. */
const SUPPORTED_LINKS = ["website", "github", "x", "bluesky", "linkedin"];
const SESSION_TYPES = ["talk", "intro", "break", "social"];
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export type Report = { errors: string[]; warnings: string[] };

type Doc = { id: string; file: string; data: Record<string, unknown>; body: string };

function readMarkdownDir(dir: string): Doc[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => {
      const raw = readFileSync(join(dir, f), "utf8");
      const match = raw.match(FRONTMATTER);
      return {
        id: f.replace(/\.md$/, ""),
        file: `${dir.split("/").slice(-2).join("/")}/${f}`,
        data: (match ? (parseYaml(match[1]) ?? {}) : {}) as Record<string, unknown>,
        body: (match ? match[2] : raw).trim(),
      };
    });
}

function minutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** `root` is the repo root by default; tests point it at fixture directories. */
export function validateContent(root: string = REPO_ROOT): Report {
  const SPEAKER_DIR = join(root, "content/speakers");
  const TALK_DIR = join(root, "content/talks");
  const PROGRAM_FILE = join(root, "content/program.yaml");
  const PUBLIC_DIR = join(root, "public");

  const errors: string[] = [];
  const warnings: string[] = [];

  const speakers = readMarkdownDir(SPEAKER_DIR);
  const talks = readMarkdownDir(TALK_DIR);
  const speakerIds = new Set(speakers.map((s) => s.id));
  const talkIds = new Set(talks.map((t) => t.id));

  if (speakers.length === 0) errors.push("content/speakers/ has no speaker files");
  if (talks.length === 0) errors.push("content/talks/ has no talk files");

  // --- speakers ------------------------------------------------------------
  for (const s of speakers) {
    if (!ID_PATTERN.test(s.id)) {
      errors.push(`${s.file}: filename "${s.id}" is used as a URL anchor, so it must be kebab-case`);
    }
    if (typeof s.data.name !== "string" || !s.data.name.trim()) {
      errors.push(`${s.file}: missing required "name"`);
    }
    if (!s.body) warnings.push(`${s.file}: no bio — the card will render an empty body`);

    const photo = s.data.photo;
    if (photo !== undefined) {
      if (typeof photo !== "string" || !photo.startsWith("/")) {
        errors.push(`${s.file}: "photo" must be a root-relative path like /speakers/name.jpg`);
      } else if (!existsSync(join(PUBLIC_DIR, photo))) {
        errors.push(`${s.file}: photo "${photo}" does not exist in public/`);
      }
    }

    const links = s.data.links;
    if (links !== undefined) {
      if (typeof links !== "object" || links === null) {
        errors.push(`${s.file}: "links" must be a mapping`);
      } else {
        for (const [key, value] of Object.entries(links)) {
          if (!SUPPORTED_LINKS.includes(key)) {
            errors.push(
              `${s.file}: link "${key}" is not rendered by the speakers page ` +
                `(supported: ${SUPPORTED_LINKS.join(", ")})`,
            );
          }
          if (typeof value !== "string" || !/^https?:\/\//.test(value)) {
            errors.push(`${s.file}: link "${key}" must be an absolute http(s) URL`);
          }
        }
      }
    }
  }

  // --- talks ---------------------------------------------------------------
  for (const t of talks) {
    if (!ID_PATTERN.test(t.id)) {
      errors.push(`${t.file}: filename "${t.id}" is used as a URL anchor, so it must be kebab-case`);
    }
    if (typeof t.data.title !== "string" || !t.data.title.trim()) {
      errors.push(`${t.file}: missing required "title"`);
    }
    if (!t.body) errors.push(`${t.file}: no abstract — expanding this talk shows nothing`);

    const speakerId = t.data.speakerId;
    if (typeof speakerId !== "string" || !speakerId) {
      errors.push(`${t.file}: missing required "speakerId"`);
    } else if (!speakerIds.has(speakerId)) {
      errors.push(`${t.file}: speakerId "${speakerId}" has no content/speakers/${speakerId}.md`);
    }
  }

  // --- program -------------------------------------------------------------
  if (!existsSync(PROGRAM_FILE)) {
    errors.push("content/program.yaml is missing");
    return { errors, warnings };
  }

  const program = parseYaml(readFileSync(PROGRAM_FILE, "utf8")) as {
    days?: { date?: string; label?: string; sessions?: Record<string, unknown>[] }[];
  };

  const referencedTalks = new Set<string>();
  const seenTalkAnchors = new Map<string, string>();

  if (!Array.isArray(program.days) || program.days.length === 0) {
    errors.push("content/program.yaml: no days defined");
  }

  for (const day of program.days ?? []) {
    const where = `program.yaml (${day.label ?? day.date ?? "unnamed day"})`;

    if (typeof day.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day.date)) {
      errors.push(`${where}: "date" must be YYYY-MM-DD`);
    }
    if (!day.label) errors.push(`${where}: missing "label"`);
    if (!Array.isArray(day.sessions) || day.sessions.length === 0) {
      errors.push(`${where}: no sessions`);
      continue;
    }

    let previousEnd = -1;
    for (const session of day.sessions) {
      const start = session.start as string | undefined;
      const end = session.end as string | undefined;
      const label = `${where} ${start ?? "??:??"} "${session.title ?? "untitled"}"`;

      if (typeof session.title !== "string" || !session.title.trim()) {
        errors.push(`${label}: missing "title"`);
      }
      if (!SESSION_TYPES.includes(session.type as string)) {
        errors.push(`${label}: type "${session.type}" must be one of ${SESSION_TYPES.join(", ")}`);
      }

      if (typeof start !== "string" || !TIME_PATTERN.test(start)) {
        errors.push(`${label}: "start" must be HH:MM`);
      } else {
        if (end !== undefined) {
          if (!TIME_PATTERN.test(end)) {
            errors.push(`${label}: "end" must be HH:MM`);
          } else if (minutes(end) <= minutes(start)) {
            errors.push(`${label}: ends at ${end}, which is not after ${start}`);
          }
        }
        if (minutes(start) < previousEnd) {
          errors.push(`${label}: starts before the previous session ends — schedule is out of order`);
        }
        previousEnd = end && TIME_PATTERN.test(end) ? minutes(end) : minutes(start);
      }

      const speakerId = session.speakerId as string | undefined;
      if (speakerId !== undefined && !speakerIds.has(speakerId)) {
        errors.push(`${label}: speakerId "${speakerId}" has no content/speakers/${speakerId}.md`);
      }

      const talkId = session.talkId as string | undefined;
      if (talkId === undefined) continue;

      if (!talkIds.has(talkId)) {
        errors.push(`${label}: talkId "${talkId}" has no content/talks/${talkId}.md`);
        continue;
      }

      // Anchors are DOM ids; a repeated talkId would make /program#<id> ambiguous.
      const previous = seenTalkAnchors.get(talkId);
      if (previous) {
        errors.push(`${label}: talkId "${talkId}" is already used by ${previous} — anchors must be unique`);
      }
      seenTalkAnchors.set(talkId, label);
      referencedTalks.add(talkId);

      const talk = talks.find((t) => t.id === talkId)!;
      if (talk.data.title !== session.title) {
        errors.push(
          `${label}: title differs from content/talks/${talkId}.md ("${talk.data.title}") — ` +
            "the program and the speakers page would disagree",
        );
      }
      if (speakerId !== undefined && talk.data.speakerId !== speakerId) {
        errors.push(
          `${label}: speakerId "${speakerId}" differs from content/talks/${talkId}.md ` +
            `("${talk.data.speakerId}")`,
        );
      }
    }
  }

  // --- graph ---------------------------------------------------------------
  for (const t of talks) {
    if (!referencedTalks.has(t.id)) {
      errors.push(`${t.file}: no session in program.yaml has talkId "${t.id}" — this talk is unreachable`);
    }
  }

  const speakersWithTalks = new Set(talks.map((t) => t.data.speakerId as string));
  for (const s of speakers) {
    if (!speakersWithTalks.has(s.id)) {
      warnings.push(`${s.file}: no talk in content/talks/ points at "${s.id}" — the card will show no talk`);
    }
  }

  return { errors, warnings };
}

// Run as a CLI when invoked directly.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { errors, warnings } = validateContent();

  for (const w of warnings) console.warn(`warning  ${w}`);
  for (const e of errors) console.error(`error    ${e}`);

  if (errors.length) {
    console.error(`\n${errors.length} content error(s).`);
    process.exit(1);
  }
  console.log(
    `Content OK${warnings.length ? ` (${warnings.length} warning(s))` : ""}.`,
  );
}
