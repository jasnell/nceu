"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

type IconName =
  | "ticket"
  | "mic"
  | "venue"
  | "map"
  | "youtube"
  | "x"
  | "spark"
  | "chain"
  | "network";

const themeStorageKey = "nodeconf-theme";

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
    title: "Call For Papers",
    href: "https://forms.gle/g2Pa2dAPPAnNcz1J7",
    blurb: "Send the talk you want developers to remember.",
    icon: "mic",
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
    href: "https://www.youtube.com/playlist?list=PL0CdgOSSGlBYI7_e6Zs4kFSXL9LvOn8gM",
    blurb: "Revisit talks and get the tone of the event.",
    icon: "youtube",
  },
  {
    title: "X",
    href: "https://twitter.com/NodeConfEU",
    blurb: "Follow updates as the lineup lands.",
    icon: "x",
  },
];

const footerLinks: { title: string; href: string; icon: IconName }[] = [
  {
    title: "Open map",
    href: "https://www.google.com/maps/place//data=!4m2!3m1!1s0x477e2ca643db29ab:0x19c877e26a7b7526?sa=X&ved=1t:8290&ictx=111",
    icon: "map",
  },
  {
    title: "X",
    href: "https://twitter.com/NodeConfEU",
    icon: "x",
  },
  {
    title: "YouTube",
    href: "https://www.youtube.com/playlist?list=PL0CdgOSSGlBYI7_e6Zs4kFSXL9LvOn8gM",
    icon: "youtube",
  },
];

const navLinks: { title: string; href: string; icon: IconName }[] = [
  { title: "Experience", href: "#experience", icon: "spark" },
  { title: "Links", href: "#links", icon: "chain" },
  { title: "Partners", href: "#partners", icon: "network" },
];

const sponsorTiers: {
  tier: string;
  note: string;
  sponsors: {
    name: string;
    href: string;
    logo: string;
    logoClassName: string;
    logoFrameClassName: string;
  }[];
}[] = [
  {
    tier: "Platinum",
    note: "Headline partner",
    sponsors: [
      {
        name: "Platformatic",
        href: "https://platformatic.dev/",
        logo: "https://platformatic.dev/img/platformatic-logo.svg",
        logoClassName: "sponsor-logo sponsor-logo-platformatic",
        logoFrameClassName: "sponsor-logo-frame",
      },
    ],
  },
  {
    tier: "Gold",
    note: "Product and platform partners",
    sponsors: [],
  },
  {
    tier: "Silver",
    note: "Event experience partners",
    sponsors: [],
  },
  {
    tier: "Supporting",
    note: "Ecosystem supporters",
    sponsors: [
      {
        name: "OpenJS Foundation",
        href: "https://openjsf.org/",
        logo: "https://openjsf.org/logo.svg",
        logoClassName: "sponsor-logo sponsor-logo-openjs",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-quiet",
      },
    ],
  },
  {
    tier: "Community",
    note: "Friends of the conference",
    sponsors: [
      {
        name: "CityJS London",
        href: "https://london.cityjsconf.org/",
        logo: "https://static.wixstatic.com/media/7f99d3_743fcaf8491a40b59263c7b46a53db9d~mv2.png/v1/fill/w_146,h_146,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/GENERAL_LOGO_FINAL_23.png",
        logoClassName: "sponsor-logo sponsor-logo-cityjs",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-contrast",
      },
    ],
  },
];

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const saved = window.localStorage.getItem(themeStorageKey);

  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function LinkIcon({ name }: { name: IconName }) {
  const iconClassName = `link-icon link-icon-${name}`;

  switch (name) {
    case "ticket":
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 9.5A2.5 2.5 0 0 1 6.5 7H18a2 2 0 0 1 2 2v2.1a2.4 2.4 0 0 0 0 4.8V18a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 17.5v-8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M9 9.5v5M9 16.5v.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "mic":
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3M8.5 20h7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "venue":
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5 20V7l7-3 7 3v13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M9 10h1M14 10h1M9 14h1M14 14h1M11 20v-4h2v4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "map":
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 21s5-5.23 5-10a5 5 0 1 0-10 0c0 4.77 5 10 5 10Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="11" r="1.9" fill="currentColor" />
        </svg>
      );
    case "youtube":
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M21 12.2c0 2.06-.24 4.03-.24 4.03a2.9 2.9 0 0 1-2.04 2.03S16.9 18.5 12 18.5s-6.72-.24-6.72-.24a2.9 2.9 0 0 1-2.04-2.03S3 14.26 3 12.2s.24-4.03.24-4.03A2.9 2.9 0 0 1 5.28 6.14S7.1 5.9 12 5.9s6.72.24 6.72.24a2.9 2.9 0 0 1 2.04 2.03S21 10.14 21 12.2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="m10 9.6 5 2.6-5 2.6V9.6Z" fill="currentColor" />
        </svg>
      );
    case "x":
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="m5 5 14 14M15.5 5H19l-6.5 7.4L19.4 19H16l-5.3-5.7L5.7 19H4l6.9-7.9L5 5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "spark":
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3.8 13.9 9l5.3 1.9-5.3 1.9L12 18l-1.9-5.2-5.3-1.9L10.1 9 12 3.8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "chain":
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M10 14 8.3 15.7a3 3 0 1 1-4.2-4.2L7.4 8.2a3 3 0 0 1 4.2 0M14 10l1.7-1.7a3 3 0 1 1 4.2 4.2l-3.3 3.3a3 3 0 0 1-4.2 0M8.7 15.3l6.6-6.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "network":
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="6" cy="12" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="18" cy="7" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="18" cy="17" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M8 11.2 15.9 7.8M8 12.8l7.9 3.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "light") {
    return (
      <svg className="link-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" fill="currentColor" />
        <path
          d="M12 2.5v2.2M12 19.3v2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M2.5 12h2.2M19.3 12h2.2M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg className="link-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M18.5 14.6A7 7 0 0 1 9.4 5.5a7.4 7.4 0 1 0 9.1 9.1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function newTabLabel(label: string) {
  return `${label} (opens in new tab)`;
}

function externalLinkProps(label: string) {
  return {
    target: "_blank" as const,
    rel: "noopener noreferrer",
    "aria-label": newTabLabel(label),
  };
}

export default function Page() {
  const [theme, setTheme] = useState<Theme>("light");
  const [daysUntil, setDaysUntil] = useState<number | null>(null);

  const themeOptions: { value: Theme; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  useEffect(() => {
    setTheme(getPreferredTheme());
    setDaysUntil(getDaysUntilEvent());

    const id = window.setInterval(() => {
      setDaysUntil(getDaysUntilEvent());
    }, 60 * 60 * 1000);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const pulseStats = buildPulseStats(daysUntil);

  return (
    <div className="page-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header">
        <a className="brand-mark" href="#main-content">
          NodeConf EU 2026
        </a>
        <div className="header-actions">
          <nav className="top-links" aria-label="Primary">
            {navLinks.map((link) => (
              <a key={link.title} href={link.href}>
                <LinkIcon name={link.icon} />
                <span>{link.title}</span>
              </a>
            ))}
          </nav>
          <div className="theme-switch" role="group" aria-label="Theme selector">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`theme-option${theme === option.value ? " is-active" : ""}`}
                aria-pressed={theme === option.value}
                onClick={() => setTheme(option.value)}
              >
                <ThemeIcon theme={option.value} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

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
                className="button button-secondary"
                href="https://forms.gle/g2Pa2dAPPAnNcz1J7"
                {...externalLinkProps("Submit a CFP")}
              >
                Submit a CFP
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
                src="https://static.wixstatic.com/media/e89522_06d47063fdc4457c8fd5b4add7722b59~mv2.png/v1/fill/w_686,h_866,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/e89522_06d47063fdc4457c8fd5b4add7722b59~mv2.png"
                alt="NodeConf EU 2026 poster art"
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
              Tickets, CFP, venue details, and the links you will actually use.
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
              <article key={tier.tier} className="sponsor-tier">
                <div className="tier-intro">
                  <p className="tier-name">{tier.tier}</p>
                  <span>{tier.note}</span>
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
                          <img
                            className={sponsor.logoClassName}
                            src={sponsor.logo}
                            alt=""
                            loading="lazy"
                          />
                        </span>
                        <strong>{sponsor.name}</strong>
                      </a>
                    ))
                  ) : (
                    <div className="sponsor-placeholder">
                      <strong>{tier.tier} partners</strong>
                      <span>Announcement coming soon</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <p className="eyebrow">NodeConf EU 2026</p>
          <address className="footer-copy">
            Hotel Savoia Regency, Via del Pilastro 2, 40127 Bologna BO.
          </address>
        </div>
        <div className="footer-links">
          {footerLinks.map((link) => (
            <a
              key={link.title}
              className="footer-link"
              href={link.href}
              {...externalLinkProps(link.title)}
            >
              <LinkIcon name={link.icon} />
              <span>{link.title}</span>
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
