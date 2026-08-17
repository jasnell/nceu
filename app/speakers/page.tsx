"use client";

import { SiteFooter, SiteHeader, externalLinkProps, useTheme } from "../shared";

type SpeakerLinks = Partial<
  Record<"website" | "github" | "x" | "bluesky" | "linkedin", string>
>;

type Speaker = {
  id: string;
  name: string;
  role?: string;
  photo?: string;
  links?: SpeakerLinks;
  html: string;
};

type Talk = {
  id: string;
  title: string;
  speakerId?: string;
  coSpeakerIds?: string[];
};

// Loaded and parsed at build time by `vite-content-plugin.ts`.
const modules = import.meta.glob<{ default: Omit<Speaker, "id"> }>(
  "../../content/speakers/*.md",
  { eager: true },
);

const talkModules = import.meta.glob<{ default: Omit<Talk, "id"> }>(
  "../../content/talks/*.md",
  { eager: true },
);

const contentFiles = <T,>(mods: Record<string, { default: T }>) =>
  Object.entries(mods)
    .filter(([path]) => !(path.split("/").pop() ?? "").startsWith("_"))
    .map(([path, mod]) => ({
      id: (path.split("/").pop() ?? "").replace(/\.md$/, ""),
      ...mod.default,
    }));

// A speaker's talks come from content/talks/, so the title shown here is
// always the one on the program and the anchor is guaranteed to resolve.
// A co-presented talk appears on every one of its speakers' cards.
const talksBySpeaker = contentFiles<Omit<Talk, "id">>(talkModules).reduce<
  Record<string, Talk[]>
>((acc, talk) => {
  for (const id of [talk.speakerId, ...(talk.coSpeakerIds ?? [])]) {
    if (id) (acc[id] ??= []).push(talk);
  }
  return acc;
}, {});

const linkLabels: Record<keyof SpeakerLinks, string> = {
  website: "Website",
  github: "GitHub",
  x: "X",
  bluesky: "Bluesky",
  linkedin: "LinkedIn",
};

const linkOrder: (keyof SpeakerLinks)[] = [
  "website",
  "github",
  "x",
  "bluesky",
  "linkedin",
];

const speakers: Speaker[] = contentFiles<Omit<Speaker, "id">>(modules).sort(
  (a, b) => a.name.localeCompare(b.name),
);

export default function SpeakersPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="page-shell cast-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <SiteHeader theme={theme} setTheme={setTheme} />

      <main id="main-content" tabIndex={-1}>
        <section className="cast-masthead" aria-labelledby="speakers-title">
          <p className="kicker">NodeConf EU 2026 · The line-up</p>
          <h1 className="cast-title" id="speakers-title">
            Speakers
          </h1>
          <p className="cast-lede">
            The people taking the single stage at NodeConf EU 2026. The lineup
            grows as talks are confirmed, so check back for new faces.
          </p>
        </section>

        <div className="cast-sheet">
          {speakers.map((speaker) => (
            <article key={speaker.id} id={speaker.id} className="cast-card">
              <div className="cast-photo-frame">
                <img
                  className="cast-photo"
                  src={speaker.photo ?? "/speakers/placeholder.svg"}
                  alt={speaker.name}
                  loading="lazy"
                />
              </div>
              <div className="cast-info">
                <h2 className="cast-name">{speaker.name}</h2>
                {speaker.role ? <p className="cast-role">{speaker.role}</p> : null}
                {(talksBySpeaker[speaker.id] ?? []).map((talk) => (
                  <p className="cast-talk" key={talk.id}>
                    <span className="cast-talk-label">Talk</span>
                    <a href={`/program#${talk.id}`}>{talk.title}</a>
                  </p>
                ))}
                <div
                  className="cast-bio"
                  dangerouslySetInnerHTML={{ __html: speaker.html }}
                />
                {speaker.links ? (
                  <div className="cast-links">
                    {linkOrder
                      .filter((key) => speaker.links?.[key])
                      .map((key) => (
                        <a
                          key={key}
                          className="cast-link"
                          href={speaker.links![key]!}
                          {...externalLinkProps(`${speaker.name} on ${linkLabels[key]}`)}
                        >
                          {linkLabels[key]}
                        </a>
                      ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
