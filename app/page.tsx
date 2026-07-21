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

const eventDate = new Date("2026-09-29T09:00:00+02:00");

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
];

const sponsorTiers: {
  tier: string;
  logoHeight: number;
  sponsors: {
    name: string;
    href: string;
    logo: string;
    logoClassName: string;
    logoFrameClassName: string;
    logoVariant?: "platformatic-theme-aware";
  }[];
}[] = [
  {
    tier: "Diamond",
    logoHeight: 84,
    sponsors: [],
  },
  {
    tier: "Platinum",
    logoHeight: 72,
    sponsors: [
      {
        name: "Platformatic",
        href: "https://platformatic.dev/",
        logo: "",
        logoClassName: "sponsor-logo sponsor-logo-platformatic",
        logoFrameClassName: "sponsor-logo-frame",
        logoVariant: "platformatic-theme-aware",
      },
    ],
  },
  {
    tier: "Gold",
    logoHeight: 60,
    sponsors: [
      {
        name: "Socket",
        href: "https://socket.dev/",
        logo: "/socket.svg",
        logoClassName: "sponsor-logo sponsor-logo-socket",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-socket",
      },
      {
        name: "nxtedition",
        href: "https://nxtedition.com/",
        logo: "/nxtedition.gif",
        logoClassName: "sponsor-logo sponsor-logo-nxtedition",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-nxtedition",
      },
    ],
  },
  {
    tier: "Silver",
    logoHeight: 48,
    sponsors: [
      {
        name: "Igalia",
        href: "https://www.igalia.com/",
        logo: "/igalia.png",
        logoClassName: "sponsor-logo",
        logoFrameClassName: "sponsor-logo-frame",
      },
    ],
  },
  {
    tier: "Supporting",
    logoHeight: 40,
    sponsors: [
      {
        name: "OpenJS Foundation",
        href: "https://openjsf.org/",
        logo: "https://openjsf.org/logo.svg",
        logoClassName: "sponsor-logo sponsor-logo-openjs",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-quiet",
      },
      {
        name: "Sentry",
        href: "https://sentry.io/",
        logo: "https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png",
        logoClassName: "sponsor-logo",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-quiet",
      },
      {
        name: "Datadog",
        href: "https://www.datadoghq.com/",
        logo: "https://imgix.datadoghq.com/img/about/presskit/logo-h/dd_horizontal_purple.png",
        logoClassName: "sponsor-logo",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-quiet",
      },
      {
        name: "HeroDevs",
        href: "https://www.herodevs.com/",
        logo: "https://cdn.prod.website-files.com/62865614b39c464b76d339aa/668c0ec8bc50d24d58a40475_Logo%20Gradient%20Darkmode.svg",
        logoClassName: "sponsor-logo",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-herodevs",
      },
      {
        name: "Harper",
        href: "https://www.harpersystems.dev/",
        logo: "/harper.png",
        logoClassName: "sponsor-logo",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-harper",
      },
    ],
  },
  {
    tier: "Community",
    logoHeight: 56,
    sponsors: [
      {
        name: "CityJS London",
        href: "https://london.cityjsconf.org/",
        logo: "https://static.wixstatic.com/media/7f99d3_743fcaf8491a40b59263c7b46a53db9d~mv2.png/v1/fill/w_146,h_146,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/GENERAL_LOGO_FINAL_23.png",
        logoClassName: "sponsor-logo community-partner-logo community-partner-logo-circle",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-quiet",
      },
      {
        name: "ZurichJS",
        href: "https://conf.zurichjs.com/?utm_source=nodeconf_eu&utm_medium=website&utm_campaign=community_partner",
        logo: "https://conf.zurichjs.com/images/logo/zurichjs-square.png",
        logoClassName: "sponsor-logo community-partner-logo community-partner-logo-square",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-contrast",
      },
      {
        name: "BolognaJS",
        href: "https://www.bolognajs.com/",
        logo: "https://www.bolognajs.com/android-chrome-512x512.png",
        logoClassName: "sponsor-logo community-partner-logo community-partner-logo-square",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-contrast",
      },
      {
        name: "GrUSP",
        href: "https://www.grusp.org/conferenze/",
        logo: "https://www.grusp.org/wp-content/uploads/2026/05/grusp-logo.png",
        logoClassName: "sponsor-logo community-partner-logo community-partner-logo-square",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-quiet",
      },
    ],
  },
];

function PlatformaticLogo({ className }: { className: string }) {
  return (
    <span className={className} aria-hidden="true">
      <img
        className="platformatic-logo-variant platformatic-logo-variant-light"
        src="/platformatic-text-light.svg"
        alt=""
      />
      <img
        className="platformatic-logo-variant platformatic-logo-variant-dark"
        src="/platformatic-text-dark.svg"
        alt=""
      />
    </span>
  );
}

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
                href="https://ti.to/apropos/nodeconf-eu-2026"
                {...externalLinkProps("Get tickets")}
              >
                Get tickets
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
            href="https://ti.to/apropos/nodeconf-eu-2026"
            {...externalLinkProps("Get tickets")}
          >
            Get tickets
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
                <div className="sponsor-logo-grid">
                  {tier.sponsors.length > 0 ? (
                    tier.sponsors.map((sponsor) => (
                      <a
                        key={sponsor.name}
                        className="sponsor-tile"
                        href={sponsor.href}
                        {...externalLinkProps(sponsor.name)}
                      >
                        <span className={sponsor.logoFrameClassName}>
                          {sponsor.logoVariant === "platformatic-theme-aware" ? (
                            <PlatformaticLogo className={sponsor.logoClassName} />
                          ) : (
                            <img
                              className={sponsor.logoClassName}
                              src={sponsor.logo}
                              alt=""
                              loading="lazy"
                            />
                          )}
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
