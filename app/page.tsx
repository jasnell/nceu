"use client";

import { type CSSProperties, useEffect, useState } from "react";
import {
  type IconName,
  LinkIcon,
  SiteFooter,
  SiteHeader,
  externalLinkProps,
  useTheme,
} from "./shared";
import { liveCta, liveSwitchDate } from "./event";
import { SponsorLogo, sponsorTiers } from "./sponsors";

const eventDate = new Date("2026-09-29T09:00:00+02:00");

const ticketsCta = {
  href: "https://ti.to/apropos/nodeconf-eu-2026",
  label: "Get tickets",
};

function isLive(): boolean {
  return Date.now() >= liveSwitchDate.getTime();
}

function getDaysUntilEvent(): number {
  return Math.max(
    0,
    Math.ceil(
      (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
  );
}

function buildPulseStats(daysUntil: number | null) {
  return [
    { value: daysUntil === null ? "—" : `${daysUntil}d`, label: "until event" },
    { value: "2 days", label: "of talks and hallway track" },
    { value: "1 venue", label: "Hotel Savoia Regency" },
    { value: "∞", label: "side quests and conversations" },
  ];
}

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
  {
    title: "Tickets",
    href: "https://ti.to/apropos/nodeconf-eu-2026",
    blurb: "Reserve your spot for the 2026 edition.",
    icon: "ticket",
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
    blurb: "Revisit talks and get the tone of the event.",
    icon: "youtube",
  },
  {
    title: "X",
    href: "https://twitter.com/NodeConfEU",
    blurb: "Follow updates as the lineup lands.",
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
  const [daysUntil, setDaysUntil] = useState<number | null>(null);

  useEffect(() => {
    setDaysUntil(getDaysUntilEvent());

    const id = window.setInterval(() => {
      setDaysUntil(getDaysUntilEvent());
    }, 60 * 60 * 1000);

    return () => window.clearInterval(id);
  }, []);

  // Resolved after hydration so server and client markup always match.
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (isLive()) {
      setLive(true);
      return;
    }

    // Flip exactly at the cutoff for tabs left open. setTimeout caps at
    // ~24.8 days, so only schedule when the switch is within range.
    const delay = liveSwitchDate.getTime() - Date.now();
    if (delay > 2 ** 31 - 1) return;

    const id = window.setTimeout(() => setLive(true), delay);
    return () => window.clearTimeout(id);
  }, []);

  const cta = live ? liveCta : ticketsCta;
  const pulseStats = buildPulseStats(daysUntil);

  return (
    <div className="page-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <SiteHeader theme={theme} setTheme={setTheme} />

      <main id="main-content" tabIndex={-1}>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="kicker">29-30 September · Bologna, Italy</p>
            <h1 id="hero-title">
              A sharper, warmer
              <span>Node.js gathering</span>
              for Europe.
            </h1>
            <p className="hero-text">
              NodeConf EU returns with two days of talks, conversations, and
              late-evening energy in Bologna. Come for the technical depth,
              stay for the people, the city, and the hallway track that makes
              the trip worth it.
            </p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href={cta.href}
                {...externalLinkProps(cta.label)}
              >
                {cta.label}
              </a>
              <a
                className="text-link"
                href="https://www.youtube.com/watch?v=fqaJXVieDbQ&list=PLFVadYWYE9opLgYJ7i0j50oIgn6pqBOM7"
                {...externalLinkProps("Watch the latest talk drop")}
              >
                <LinkIcon name="youtube" />
                <span>Watch the latest talk drop</span>
              </a>
            </div>
          </div>

          <aside className="poster-card" aria-label="Event poster">
            <div className="poster-frame">
              <img
                src="/hexagon.svg"
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
              When day one wraps, nobody scatters. The whole conference sits
              down together for a proper Bolognese evening of food, wine, and
              conversation — and it is already part of your ticket. No add-on,
              no separate pass.
            </p>
          </div>
          <a
            className="button dinner-cta"
            href={cta.href}
            {...externalLinkProps(cta.label)}
          >
            {cta.label}
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
              Tickets, venue details, and the links you will actually use.
            </h2>
            <p className="section-copy">
              Everything important is one click away, whether you are booking,
              planning the trip, or catching up on previous talks.
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
              These partners help make the conference happen, from the main
              event experience to the broader ecosystem around it.
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

      <SiteFooter />
    </div>
  );
}
