"use client";

import {
  type IconName,
  LinkIcon,
  SiteFooter,
  SiteHeader,
  externalLinkProps,
  useTheme,
} from "./shared";
import { eventDates, sponsorTiers2027, ticketsUrl, venue } from "./event";
import { playlistUrl } from "./2026/event";

const watchCta = {
  href: playlistUrl,
  label: "Watch the 2026 talks",
};

const pulseStats = [
  { value: eventDates ?? "TBD", label: eventDates ? "2027" : "dates to be announced" },
  { value: "1 venue", label: venue.name },
  { value: "24", label: "talks from 2026, on YouTube" },
  { value: "∞", label: "side quests and conversations" },
];

const highlights = [
  {
    title: "Runtime and platform talks",
    body:
      "Expect a focused program for engineers working on Node.js applications, runtimes, tooling, observability, architecture, and production systems.",
  },
  {
    title: "A schedule built for conversation",
    body:
      "Two days, one venue, and enough breathing room between sessions to actually meet people, compare notes, and keep discussions going after the talks end.",
  },
  {
    title: "The community in one room",
    body:
      "You are not just showing up for slides. You are showing up for maintainers, staff engineers, library authors, and teams building serious JavaScript products.",
  },
];

const links: { title: string; href: string; blurb: string; icon: IconName }[] = [
  ...(ticketsUrl
    ? [
        {
          title: "Tickets",
          href: ticketsUrl,
          blurb: "Reserve your spot for the 2027 edition.",
          icon: "ticket" as const,
        },
      ]
    : []),
  {
    title: "2026 talks",
    href: playlistUrl,
    blurb: "Every talk from NodeConf EU 2026, in one playlist.",
    icon: "youtube",
  },
  {
    title: "Venue",
    href: venue.href,
    blurb: `${venue.name}, Bologna. Same place as 2026.`,
    icon: "venue",
  },
  {
    title: "Map",
    href: venue.map,
    blurb: "Open the route and plan the trip.",
    icon: "map",
  },
  {
    title: "YouTube",
    href: "https://www.youtube.com/@nodeconfeu",
    blurb: "Talks from every edition of NodeConf EU.",
    icon: "youtube",
  },
  {
    title: "X",
    href: "https://twitter.com/NodeConfEU",
    blurb: "Follow along for dates and ticket news.",
    icon: "x",
  },
  {
    title: "Bluesky",
    href: "https://bsky.app/profile/nodeconf.eu",
    blurb: "Follow along on the AT Protocol.",
    icon: "bluesky",
  },
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com/company/nodeconf-eu/",
    blurb: "Connect with the NodeConf EU community.",
    icon: "linkedin",
  },
  {
    title: "Keet",
    href: "https://keet.io/chat/#gfo56pqko64awqxoiay79tf84hr6mczsgxemazka4npzmty9ud7kei76t7q4websj76zocrzbz6fwuc9kcema31cmds8b8fr4qofkaefr9ybnpzgy698d6xp63nsn1nck6ex88deh7qedkyzyg64mozmdnwhhyedsyrto9ozo6frjraebsbewtrubbtqyya&title=NodeConf.eu",
    blurb: "Join the NodeConf EU group on Keet, peer-to-peer.",
    icon: "keet",
  },
];

export default function Page() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="page-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <SiteHeader theme={theme} setTheme={setTheme} />

      <main id="main-content" tabIndex={-1}>
        <section
          className="hero-section hero-section-2027"
          aria-labelledby="hero-title"
        >
          <div className="hero-copy">
            <p className="kicker">
              {eventDates ?? "Dates to be announced"} · Bologna, Italy
            </p>
            <h1 id="hero-title">
              A sharper, warmer
              <span>Node.js gathering</span>
              for Europe.
            </h1>
            <p className="hero-text">
              NodeConf EU 2027 is coming back to Bologna, at the same venue as
              2026. Dates and tickets are on their way. Until then, catch up on
              every talk from last year and get a feel for the technical depth,
              the people, and the hallway track that make the trip worth it.
            </p>
            <div className="hero-actions">
              {ticketsUrl ? (
                <>
                  <a
                    className="button button-primary"
                    href={ticketsUrl}
                    {...externalLinkProps("Get tickets")}
                  >
                    Get tickets
                  </a>
                  <a
                    className="text-link"
                    href={watchCta.href}
                    {...externalLinkProps(watchCta.label)}
                  >
                    <LinkIcon name="youtube" />
                    <span>{watchCta.label}</span>
                  </a>
                </>
              ) : (
                <>
                  <a
                    className="button button-primary"
                    href={watchCta.href}
                    {...externalLinkProps(watchCta.label)}
                  >
                    <LinkIcon name="youtube" />
                    <span>{watchCta.label}</span>
                  </a>
                  <p className="text-link text-link-pending">
                    <LinkIcon name="ticket" />
                    <span>Tickets coming soon</span>
                  </p>
                </>
              )}
            </div>
          </div>

          <aside className="poster-card" aria-label="Event poster">
            <div className="poster-frame poster-frame-2027">
              <img
                src="/hexagon.svg"
                alt="NodeConf EU 2027 — Bologna hexagon mark"
              />
            </div>
            <div className="poster-caption">
              <span>{venue.name}</span>
              <a href={venue.href} {...externalLinkProps("Venue details")}>
                Venue details
              </a>
            </div>
          </aside>
        </section>

        <section className="pulse-strip" aria-label="Event highlights">
          {pulseStats.map((item) => (
            <article key={item.label} className="pulse-card">
              <p>{item.value}</p>
              <span>{item.label}</span>
            </article>
          ))}
        </section>

        <section
          id="recordings"
          className="dinner-banner"
          aria-labelledby="recordings-title"
        >
          <div className="dinner-copy">
            <p className="eyebrow">NodeConf EU 2026 · Now on YouTube</p>
            <h2 id="recordings-title">All 24 talks from 2026. One playlist.</h2>
            <p>
              Runtimes, observability, security, performance, and the future of
              Node.js itself: every session from the main stage in Bologna,
              recorded and ready to watch. Browse the{" "}
              <a href="/2026/program">2026 program</a> to find a talk, or
              start from the top.
            </p>
          </div>
          <a
            className="button dinner-cta"
            href={watchCta.href}
            {...externalLinkProps("Watch the 2026 playlist")}
          >
            Watch the playlist
          </a>
        </section>

        <section
          id="experience"
          className="content-grid"
          aria-labelledby="experience-title"
        >
          <div className="section-heading">
            <p className="eyebrow">What to expect</p>
            <h2 id="experience-title">
              A conference made for people who build with Node.js every day.
            </h2>
          </div>
          <div className="experience-cards">
            {highlights.map((item) => (
              <article key={item.title} className="experience-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="links" className="link-panel" aria-labelledby="links-title">
          <div className="section-heading wide">
            <p className="eyebrow">Plan your visit</p>
            <h2 id="links-title">
              Venue details, recordings, and where to follow along.
            </h2>
            <p className="section-copy">
              Everything important is one click away, whether you are planning
              the trip, catching up on the 2026 talks, or waiting for tickets.
            </p>
          </div>
          <div className="link-grid">
            {links.map((link) => (
              <a
                key={link.title}
                className="link-card"
                href={link.href}
                {...externalLinkProps(link.title)}
              >
                <div className="link-card-head">
                  <LinkIcon name={link.icon} />
                  <strong>{link.title}</strong>
                </div>
                <span>{link.blurb}</span>
              </a>
            ))}
          </div>
        </section>

        <section
          id="partners"
          className="partners-section"
          aria-labelledby="partners-title"
        >
          <div className="section-heading wide">
            <p className="eyebrow">Sponsors and friends</p>
            <h2 id="partners-title">
              Supported by teams investing in the JavaScript ecosystem.
            </h2>
            <p className="section-copy">
              Partners for 2027 will be announced here. See who made{" "}
              <a href="/2026#partners">the 2026 edition</a> happen.
            </p>
          </div>
          <div className="sponsor-stack">
            {sponsorTiers2027.map((tier) => (
              <article key={tier} className="sponsor-tier">
                <div className="tier-intro">
                  <p className="tier-name">{tier}</p>
                </div>
                <div className="sponsor-logo-grid">
                  <div className="sponsor-placeholder">
                    <span>To be announced soon</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
