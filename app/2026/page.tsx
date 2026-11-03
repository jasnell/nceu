"use client";

import type { CSSProperties } from "react";
import {
  type IconName,
  LinkIcon,
  SiteFooter,
  SiteHeader,
  externalLinkProps,
  useTheme,
} from "../shared";
import { playlistUrl } from "./event";
import { SponsorLogo, sponsorTiers } from "./sponsors";

// The 2026 edition, archived. The conference is over, so the calls to action
// point at the recordings instead of tickets or the livestream.
const watchCta = {
  href: playlistUrl,
  label: "Watch the 2026 talks",
};

const pulseStats = [
  { value: "24", label: "talks, all on YouTube" },
  { value: "2 days", label: "of talks and hallway track" },
  { value: "1 venue", label: "Hotel Savoia Regency" },
  { value: "∞", label: "side quests and conversations" },
];

const highlights = [
  {
    title: "Runtime and platform talks",
    body:
      "A focused program for engineers working on Node.js applications, runtimes, tooling, observability, architecture, and production systems.",
  },
  {
    title: "A schedule built for conversation",
    body:
      "Two days, one venue, and enough breathing room between sessions to actually meet people, compare notes, and keep discussions going after the talks ended.",
  },
  {
    title: "The community in one room",
    body:
      "Not just slides: maintainers, staff engineers, library authors, and teams building serious JavaScript products, all in the same room.",
  },
];

const links: { title: string; href: string; blurb: string; icon: IconName }[] = [
  {
    title: "2026 talks",
    href: playlistUrl,
    blurb: "Every talk from the 2026 edition, in one playlist.",
    icon: "youtube",
  },
  {
    title: "Venue",
    href: "https://www.savoia.eu/it/savoia-hotel-regency.html",
    blurb: "Hotel Savoia Regency, Bologna.",
    icon: "venue",
  },
  {
    title: "Map",
    href: "https://www.google.com/maps/place//data=!4m2!3m1!1s0x477e2ca643db29ab:0x19c877e26a7b7526?sa=X&ved=1t:8290&ictx=111",
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
    blurb: "Follow along for NodeConf EU 2027 news.",
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

      <SiteHeader edition="2026" theme={theme} setTheme={setTheme} />

      <main id="main-content" tabIndex={-1}>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="kicker">29-30 September 2026 · Bologna, Italy</p>
            <h1 id="hero-title">
              A sharper, warmer
              <span>Node.js gathering</span>
              for Europe.
            </h1>
            <p className="hero-text">
              NodeConf EU 2026 brought two days of talks, conversations, and
              late-evening energy to Bologna. Every talk was recorded, so you
              can catch up on the technical depth even if you missed the
              hallway track.
            </p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href={watchCta.href}
                {...externalLinkProps(watchCta.label)}
              >
                {watchCta.label}
              </a>
              <a className="text-link" href="/">
                <LinkIcon name="spark" />
                <span>On to NodeConf EU 2027</span>
              </a>
            </div>
          </div>

          <aside className="poster-card" aria-label="Event poster">
            <div className="poster-frame">
              <img
                src="/2026/hexagon.svg"
                alt="NodeConf EU 2026 — Bologna hexagon mark"
              />
            </div>
            <div className="poster-caption">
              <span>Hotel Savoia Regency</span>
              <a
                href="https://www.savoia.eu/it/savoia-hotel-regency.html"
                {...externalLinkProps("Venue details")}
              >
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

        <section className="dinner-banner" aria-labelledby="dinner-title">
          <div className="dinner-copy">
            <p className="eyebrow">Night of 29 September</p>
            <h2 id="dinner-title">One amazing social dinner. Included.</h2>
            <p>
              When day one wrapped, nobody scattered. The whole conference sat
              down together for a proper Bolognese evening of food, wine, and
              conversation. The photos are proof.
            </p>
          </div>
          <a className="button dinner-cta" href="/2026/photos">
            See the photos
          </a>
        </section>

        <section
          id="experience"
          className="content-grid"
          aria-labelledby="experience-title"
        >
          <div className="section-heading">
            <p className="eyebrow">What it was</p>
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
            <p className="eyebrow">Links</p>
            <h2 id="links-title">
              Recordings, venue details, and where to follow along.
            </h2>
            <p className="section-copy">
              Catch up on the talks, revisit the venue, or follow NodeConf EU
              for news about the next edition.
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
              These partners made the 2026 edition happen, from the main event
              experience to the broader ecosystem around it.
            </p>
          </div>
          <div className="sponsor-stack">
            {sponsorTiers.map((tier) => (
              <article
                key={tier.tier}
                className="sponsor-tier"
                style={
                  { "--logo-h": `${tier.logoHeight}px` } as CSSProperties
                }
              >
                <div className="tier-intro">
                  <p className="tier-name">{tier.tier}</p>
                </div>
                <div
                  className={`sponsor-logo-grid${
                    tier.layoutCols
                      ? ` sponsor-logo-grid-${tier.layoutCols}`
                      : ""
                  }`}
                >
                  {tier.sponsors.length > 0 ? (
                    tier.sponsors.map((sponsor) => (
                      <a
                        key={sponsor.name}
                        className="sponsor-tile"
                        href={sponsor.href}
                        {...externalLinkProps(sponsor.name)}
                      >
                        <span className={sponsor.logoFrameClassName}>
                          <SponsorLogo sponsor={sponsor} />
                        </span>
                        <strong>{sponsor.name}</strong>
                      </a>
                    ))
                  ) : (
                    <div className="sponsor-placeholder">
                      <span>To be announced soon</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter edition="2026" />
    </div>
  );
}
