"use client";

import { SiteFooter, ThemeSwitch, externalLinkProps, useTheme } from "../shared";

type SpeakerLinks = Partial<
  Record<"website" | "github" | "x" | "bluesky" | "linkedin", string>
>;

type Speaker = {
  id: string;
  name: string;
  role?: string;
  photo?: string;
  order?: number;
  links?: SpeakerLinks;
  html: string;
};

// Loaded and parsed at build time by `vite-content-plugin.ts`.
const modules = import.meta.glob<{ default: Omit<Speaker, "id"> }>(
  "../../content/speakers/*.md",
  { eager: true },
);

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

const pad = (n: number) => String(n).padStart(2, "0");

const speakers: Speaker[] = Object.entries(modules)
  .filter(([path]) => {
    const file = path.split("/").pop() ?? "";
    return !file.startsWith("_");
  })
  .map(([path, mod]) => {
    const id = (path.split("/").pop() ?? "").replace(/\.md$/, "");
    return { id, ...mod.default };
  })
  .sort(
    (a, b) =>
      (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) ||
      a.name.localeCompare(b.name),
  );

export default function SpeakersPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="page-shell cast-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header">
        <a className="brand-mark" href="/">
          NodeConf EU 2026
        </a>
        <div className="header-actions">
          <nav className="top-links" aria-label="Primary">
            <a href="/program">
              <span>Program</span>
            </a>
            <a href="/">
              <span>Home</span>
            </a>
          </nav>
          <ThemeSwitch theme={theme} setTheme={setTheme} />
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="cast-masthead" aria-labelledby="speakers-title">
          <p className="kicker">NodeConf EU 2026 · The line-up</p>
          <h1 className="cast-title" id="speakers-title">
            Speakers
          </h1>
          <p className="cast-lede">
            The people taking the single stage at NodeConf EU 2026. The lineup
            grows as talks are confirmed — check back for new faces.
          </p>
          <p className="cast-count">
            <b>{pad(speakers.length)}</b>
            <span>confirmed so far</span>
          </p>
        </section>

        <div className="cast-sheet">
          {speakers.map((speaker, i) => (
            <article key={speaker.id} id={speaker.id} className="cast-card">
              <span className="cast-index" aria-hidden="true">
                {pad(i + 1)}
              </span>
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
