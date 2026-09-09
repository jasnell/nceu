"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export type IconName =
  | "ticket"
  | "mic"
  | "venue"
  | "map"
  | "youtube"
  | "x"
  | "bluesky"
  | "linkedin"
  | "keet"
  | "spark"
  | "chain"
  | "network"
  | "calendar"
  | "speakers"
  | "camera";

const themeStorageKey = "nodeconf-theme";

export function getPreferredTheme(): Theme {
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

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getPreferredTheme());
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  return { theme, setTheme };
}

export function newTabLabel(label: string) {
  return `${label} (opens in new tab)`;
}

export function externalLinkProps(label: string) {
  return {
    target: "_blank" as const,
    rel: "noopener noreferrer",
    "aria-label": newTabLabel(label),
  };
}

export function LinkIcon({ name }: { name: IconName }) {
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
    case "bluesky":
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 10.8C10.9 8.5 8 4.9 5.3 3.5 4 2.8 3 3.1 3 4.7c0 1.6.9 6.5 1.4 7.3.5.8 1.4 1.2 2.9 1-1.5.2-2.8.8-1.1 2.8 1.9 2.1 2.7-.5 3.1-1.9.2-.6.3-1 .7-1 .4 0 .5.4.7 1 .4 1.4 1.2 4 3.1 1.9 1.7-2 .4-2.6-1.1-2.8 1.5.2 2.4-.2 2.9-1 .5-.8 1.4-5.7 1.4-7.3 0-1.6-1-1.9-2.3-1.2C16 4.9 13.1 8.5 12 10.8Z"
            fill="currentColor"
          />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" aria-hidden="true">
          <rect
            x="3.5"
            y="3.5"
            width="17"
            height="17"
            rx="2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M7.2 10v6.5M7.2 7.4v.01M11 16.5V10m0 2.4c0-1.3 1-2.4 2.5-2.4s2.5 1.1 2.5 2.4v4.1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "keet":
      return (
        <svg className={iconClassName} viewBox="0 0 27.7 30" aria-hidden="true">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1.59989 0.00118013C1.5602 0.0148898 1.56231 0.148836 1.56697 0.444077C1.5689 0.56669 1.57128 0.717121 1.57128 0.898313C1.57127 4.04594 4.11492 4.68615 4.11492 4.68615C4.11492 4.68615 1.57127 4.43476 1.57128 5.11295C1.57128 5.79113 3.79427 6.66009 3.79427 6.66009C3.79427 6.66009 0 7.26229 0 7.94048C0 8.1553 0.257181 8.19936 0.720776 8.27879C1.31424 8.38046 2.24597 8.54009 3.40946 9.19009C1.80521 11.3575 0.85702 14.0369 0.85702 16.9369C0.85702 24.1514 6.72527 30 13.9641 30C16.5704 30 18.9991 29.2418 21.0402 27.9347C20.8826 27.7172 20.8243 27.4213 20.9356 27.1258C21.5439 25.5108 21.7958 24.3331 21.7303 23.3085C21.6657 22.2971 21.2884 21.3864 20.5393 20.3112C20.1272 19.7197 19.7153 19.2652 19.3213 18.8593C19.2176 18.7524 19.1127 18.6467 19.0083 18.5414L19.0079 18.541C18.725 18.2557 18.4456 17.9739 18.2011 17.6827C17.8555 17.271 17.5568 16.8165 17.3478 16.2325C17.1398 15.6512 17.0283 14.9632 17.0283 14.0912C17.0283 11.7227 18.6211 9.82324 20.5582 9.03094C21.7644 8.53756 23.1318 8.46403 24.3579 8.97735C21.9616 5.87376 18.1972 3.87377 13.9641 3.87377C13.8176 3.87377 13.6717 3.87617 13.5263 3.88092C4.88053 3.74926 2.46854 0.957164 1.80777 0.192266C1.69465 0.0613284 1.63286 -0.0102049 1.59989 0.00118013ZM12.137 14.938C11.7974 14.8185 11.432 14.7535 11.0513 14.7535C10.7158 14.7535 10.392 14.804 10.0874 14.8979C9.85645 14.969 9.74099 15.0046 9.65233 14.9877C9.57532 14.9731 9.50292 14.9323 9.45058 14.8741C9.39034 14.8072 9.37014 14.7257 9.32974 14.5629C9.26826 14.315 9.23499 14.0501 9.23499 13.7748C9.23499 12.3857 10.0824 11.2595 11.1278 11.2595C12.1732 11.2595 13.0207 12.3857 13.0207 13.7748C13.0207 14.0735 12.9815 14.3601 12.9096 14.6259C12.8654 14.7893 12.8433 14.871 12.7805 14.9371C12.7261 14.9944 12.6513 15.0336 12.5731 15.0458C12.4829 15.0598 12.3676 15.0192 12.137 14.938Z"
            fill="currentColor"
          />
          <path
            d="M20.907 20.058C19.1822 17.5823 17.4756 17.4286 17.4756 14.0913C17.4756 9.77257 23.296 7.07396 26.0413 10.9057C27.22 12.5509 27.616 15.0892 27.616 17.0746C27.616 21.5079 25.3674 25.421 21.9348 27.766C21.6074 27.9897 21.2151 27.652 21.3544 27.2821C22.5873 24.009 22.4634 22.292 20.907 20.058Z"
            fill="currentColor"
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
    case "calendar":
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" aria-hidden="true">
          <rect
            x="4"
            y="5.5"
            width="16"
            height="14"
            rx="1.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M4 9.5h16M8 3.5v3M16 3.5v3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path d="M8 13h2.4M8 16h2.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "speakers":
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M5.5 19.5a6.5 6.5 0 0 1 13 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "camera":
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2L9 5h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="13" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    default:
      return null;
  }
}

export function ThemeIcon({ theme }: { theme: Theme }) {
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

export function ThemeSwitch({
  theme,
  setTheme,
}: {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}) {
  const themeOptions: { value: Theme; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  return (
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
  );
}

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
    title: "Bluesky",
    href: "https://bsky.app/profile/nodeconf.eu",
    icon: "bluesky",
  },
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com/company/nodeconf-eu/",
    icon: "linkedin",
  },
  {
    title: "YouTube",
    href: "https://www.youtube.com/@nodeconfeu",
    icon: "youtube",
  },
  {
    title: "Keet",
    href: "https://keet.io/chat/#gfo56pqko64awqxoiay79tf84hr6mczsgxemazka4npzmty9ud7kei76t7q4websj76zocrzbz6fwuc9kcema31cmds8b8fr4qofkaefr9ybnpzgy698d6xp63nsn1nck6ex88deh7qedkyzyg64mozmdnwhhyedsyrto9ozo6frjraebsbewtrubbtqyya&title=NodeConf.eu",
    icon: "keet",
  },
];

const navLinks: { title: string; href: string; icon: IconName }[] = [
  { title: "Program", href: "/program", icon: "calendar" },
  { title: "Speakers", href: "/speakers", icon: "speakers" },
  { title: "Experience", href: "/#experience", icon: "spark" },
  { title: "Photos", href: "/photos", icon: "camera" },
  { title: "Partners", href: "/#partners", icon: "network" },
];

/**
 * The site-wide navbar. Shared by every page so the header stays identical
 * across the site; the in-page links are root-relative so they also work
 * from the subpages.
 */
export function SiteHeader({
  theme,
  setTheme,
}: {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}) {
  return (
    <header className="site-header">
      <a className="brand-mark" href="/">
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
        <ThemeSwitch theme={theme} setTheme={setTheme} />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="eyebrow">NodeConf EU 2026</p>
        <address className="footer-copy">
          Hotel Savoia Regency, Via del Pilastro 2, 40127 Bologna BO.
        </address>
      </div>
      <div className="footer-links">
        <a className="footer-link" href="/program">
          <LinkIcon name="calendar" />
          <span>Program</span>
        </a>
        <a className="footer-link" href="/speakers">
          <LinkIcon name="speakers" />
          <span>Speakers</span>
        </a>
        <a className="footer-link" href="/code-of-conduct">
          <span>Code of Conduct</span>
        </a>
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
  );
}
