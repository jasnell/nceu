// Program data shared by the machine-readable routes (`/program.json`,
// `/program.ics`). Everything here is resolved at build time by
// `vite-content-plugin.ts`, so no YAML/Markdown parsing happens at runtime.
import program from "@/content/program.yaml";

export type SessionType = "talk" | "intro" | "break" | "social";

export type Session = {
  start: string;
  end?: string;
  type: SessionType;
  title: string;
  speaker?: string;
  speakerId?: string;
  /** Further speakers of a co-presented talk; names come from their files. */
  coSpeakerIds?: string[];
  talkId?: string;
  location?: string;
  description?: string;
};

export type Day = {
  date: string;
  label: string;
  weekday?: string;
  sessions: Session[];
};

export const TIME_ZONE = "Europe/Rome";

const speakerModules = import.meta.glob<{ default: { name: string } }>(
  "../content/speakers/*.md",
  { eager: true },
);

// `?text` renders the abstract to plain text at build time (see
// `vite-content-plugin.ts`); pages that show HTML import the files without it.
const talkModules = import.meta.glob<{ default: { text: string } }>(
  "../content/talks/*.md",
  { eager: true, query: "?text" },
);

const fileName = (path: string) => path.split("/").pop() ?? "";

/** Content files keyed by id (filename without `.md`), skipping `_` templates. */
function byId<T, V>(
  modules: Record<string, { default: T }>,
  pick: (value: T) => V,
): Record<string, V> {
  return Object.fromEntries(
    Object.entries(modules)
      .filter(([path]) => !fileName(path).startsWith("_"))
      .map(([path, mod]) => [
        fileName(path).replace(/\.md$/, ""),
        pick(mod.default),
      ]),
  );
}

/** Speaker id → display name. */
export const speakerNames: Record<string, string> = byId(
  speakerModules,
  (speaker) => speaker.name,
);

/** Talk id → abstract as plain text. */
export const talkText: Record<string, string> = byId(
  talkModules,
  (talk) => talk.text,
);

export const days: Day[] = program.days;

/** The public JSON view of the program, as served by `/program.json`. */
export const publicProgram = {
  ...program,
  schemaVersion: 1,
  timeZone: TIME_ZONE,
  speakerNames,
};
