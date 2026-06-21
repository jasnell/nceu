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
  | "spark"
  | "chain"
  | "network";

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
    title: "YouTube",
    href: "https://www.youtube.com/@nodeconfeu",
    icon: "youtube",
  },
];

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
