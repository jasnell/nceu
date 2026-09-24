"use client";

import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { TIME_ZONE, days, speakerNames, talkText, type Day, type Session } from "../program-data";
import { liveCta, liveSwitchDate } from "../event";
import { LinkIcon, ThemeIcon, externalLinkProps, socialLinks, useTheme } from "../shared";
import { SponsorLogo, sponsorLogoUrls, sponsorTiers } from "../sponsors";
import {
  type SessionRef,
  type Timeline,
  formatCountdown,
  minutesUntil,
  sessionEndMinutes,
  sessionKey,
  formatClock,
  timeline,
  wallClock,
} from "./schedule";

const STARS_KEY = "nodeconf-app-stars";
const IOS_HINT_KEY = "nodeconf-app-ios-hint-dismissed";
const TICK_MS = 30_000;
// Shared links point at the public program, where #<talkId> opens the abstract.
const SITE_URL = "https://nodeconf.eu";
const HASHTAG = "#NodeConfEU";

type Tab = number | "starred" | "sponsors";

// Logos render at this fraction of their home-page tier height.
const SPONSOR_LOGO_SCALE = 0.6;

const typeLabels: Record<Session["type"], string> = {
  talk: "Talk",
  intro: "Stage",
  break: "Break",
  social: "Social",
};

function sessionPeople(session: Session): { name: string; id?: string }[] {
  const people = session.speaker ? [{ name: session.speaker, id: session.speakerId }] : [];
  for (const id of session.coSpeakerIds ?? []) people.push({ name: speakerNames[id] ?? id, id });
  return people;
}

const isStarrable = (session: Session) => session.type !== "break";

function formatDay(day: Day): string {
  const date = new Date(`${day.date}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return day.weekday ? `${day.weekday} ${date}` : date;
}

// ---- Hooks --------------------------------------------------------------------

/** The current time, ticking every 30 s. `null` until mounted, so SSR stays time-free. */
function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, TICK_MS);
    // Phones suspend timers in the background; catch up when reopened.
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);
  return now;
}

function useStars() {
  const [stars, setStars] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STARS_KEY) ?? "[]");
      if (Array.isArray(saved)) setStars(new Set(saved.filter((s) => typeof s === "string")));
    } catch {
      // Corrupt or unavailable storage: start empty.
    }
  }, []);
  const toggle = useCallback((key: string) => {
    setStars((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        window.localStorage.setItem(STARS_KEY, JSON.stringify([...next]));
      } catch {
        // Private mode: stars last for this visit only.
      }
      return next;
    });
  }, []);
  return { stars, toggle };
}

function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

type InstallPromptEvent = Event & { prompt(): Promise<void> };

/** Chrome/Android's install prompt, or a one-time "Add to Home Screen" hint on iOS Safari. */
function useInstall() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => setPromptEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    try {
      if (isIos && isSafari && !window.localStorage.getItem(IOS_HINT_KEY)) setIosHint(true);
    } catch {
      // No storage, no hint.
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return {
    canPrompt: promptEvent !== null,
    prompt: async () => {
      await promptEvent?.prompt();
      setPromptEvent(null);
    },
    iosHint,
    dismissIosHint: () => {
      setIosHint(false);
      try {
        window.localStorage.setItem(IOS_HINT_KEY, "1");
      } catch {
        // Ignore.
      }
    },
  };
}

function useServiceWorker() {
  useEffect(() => {
    // Dev assets aren't content-hashed, so caching them would serve stale code.
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/app" })
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        // Sponsor logos aren't in the page HTML (the tab renders on demand) and
        // several live on other sites, so hand the worker the list to save.
        // It skips any it already has.
        const urls = sponsorLogoUrls.map((url) => new URL(url, window.location.href).href);
        registration.active?.postMessage({ type: "cache-images", urls });
      })
      .catch((error) => {
        console.warn("Offline support unavailable:", error);
      });
  }, []);
}

// ---- Pieces -------------------------------------------------------------------

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="pocket-star-icon">
      <path
        d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Abstract({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </>
  );
}

function NowNextItem({
  label,
  refs,
  stars,
  onOpen,
}: {
  label: string;
  refs: SessionRef;
  stars: Set<string>;
  onOpen: (ref: SessionRef) => void;
}) {
  const day = days[refs.dayIndex];
  const session = day.sessions[refs.index];
  const people = sessionPeople(session);
  return (
    <button type="button" className="pocket-nn-item" onClick={() => onOpen(refs)}>
      <span className="pocket-nn-label">{label}</span>
      <span className="pocket-nn-title">
        {stars.has(sessionKey(day, session)) ? (
          <span className="pocket-nn-star" aria-label="Starred">
            <StarIcon filled />
          </span>
        ) : null}
        {session.title}
      </span>
      {people.length > 0 ? (
        <span className="pocket-nn-people">{people.map((p) => p.name).join(" & ")}</span>
      ) : null}
    </button>
  );
}

function NowNext({
  now,
  state,
  stars,
  onOpen,
}: {
  now: Date;
  state: Timeline;
  stars: Set<string>;
  onOpen: (ref: SessionRef) => void;
}) {
  if (state.phase === "after") {
    return (
      <section className="pocket-card pocket-nn" aria-label="Event status">
        <p className="pocket-nn-label">That's a wrap</p>
        <p className="pocket-nn-title">Thanks for coming to NodeConf EU 2026!</p>
        <a className="pocket-card-link" href="/photos">
          <LinkIcon name="camera" />
          <span>See the photos</span>
        </a>
      </section>
    );
  }

  const describeNext = (ref: SessionRef) => {
    const day = days[ref.dayIndex];
    const session = day.sessions[ref.index];
    const minutes = minutesUntil(day, session, now, TIME_ZONE);
    const today = wallClock(now, TIME_ZONE).date;
    if (day.date === today) return `Next · ${session.start} · ${formatCountdown(minutes)}`;
    if (state.phase === "before") return `Starts ${formatDay(day)} · ${session.start} · ${formatCountdown(minutes)}`;
    return `${day.weekday ?? day.label} · ${session.start}`;
  };

  // The next starred session, when it isn't already the one shown as next.
  const upcomingStarred = days
    .flatMap((day, dayIndex) => day.sessions.map((session, index) => ({ day, session, dayIndex, index })))
    .find(
      ({ day, session }) =>
        stars.has(sessionKey(day, session)) && minutesUntil(day, session, now, TIME_ZONE) > 0,
    );
  const showStarred =
    upcomingStarred &&
    !(state.next?.dayIndex === upcomingStarred.dayIndex && state.next.index === upcomingStarred.index);

  return (
    <section className="pocket-card pocket-nn" aria-label="Now and next" aria-live="polite">
      {state.current ? (
        <NowNextItem
          label={`Now · until ${formatClock(
            sessionEndMinutes(days[state.current.dayIndex], state.current.index),
          )}`}
          refs={state.current}
          stars={stars}
          onOpen={onOpen}
        />
      ) : null}
      {state.next ? (
        <NowNextItem label={describeNext(state.next)} refs={state.next} stars={stars} onOpen={onOpen} />
      ) : null}
      {showStarred ? (
        <NowNextItem
          label={`Your next star · ${upcomingStarred.session.start}`}
          refs={{ dayIndex: upcomingStarred.dayIndex, index: upcomingStarred.index }}
          stars={stars}
          onOpen={onOpen}
        />
      ) : null}
    </section>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="pocket-share-icon">
      <path
        d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * "Share a shoutout": the native share sheet where there is one (phones),
 * otherwise Bluesky / X / LinkedIn links and a copy button.
 */
function ShareSession({ session, names }: { session: Session; names: string[] }) {
  const [canShare, setCanShare] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => setCanShare(typeof navigator.share === "function"), []);

  const url = session.talkId ? `${SITE_URL}/program#${session.talkId}` : `${SITE_URL}/program`;
  const by = names.length > 0 ? ` by ${names.join(" & ")}` : "";
  const text = `Enjoying “${session.title}”${by} at ${HASHTAG} 2026 in Bologna!`;
  const enc = encodeURIComponent;

  const share = async () => {
    if (canShare) {
      try {
        await navigator.share({ title: session.title, text, url });
        return;
      } catch (error) {
        // Dismissing the sheet is not an error; anything else falls through.
        if ((error as DOMException).name === "AbortError") return;
      }
    }
    setOpen((value) => !value);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the share links still work.
    }
  };

  return (
    <div className="pocket-share">
      <button
        type="button"
        className="pocket-share-button"
        aria-expanded={canShare ? undefined : open}
        onClick={share}
      >
        <ShareIcon />
        Share a shoutout
      </button>
      {open ? (
        <div className="pocket-share-targets" role="group" aria-label="Share on">
          <a
            href={`https://bsky.app/intent/compose?text=${enc(`${text} ${url}`)}`}
            {...externalLinkProps("Share on Bluesky")}
          >
            <LinkIcon name="bluesky" />
            Bluesky
          </a>
          <a href={`https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}`} {...externalLinkProps("Share on X")}>
            <LinkIcon name="x" />X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}
            {...externalLinkProps("Share on LinkedIn")}
          >
            <LinkIcon name="linkedin" />
            LinkedIn
          </a>
          <button type="button" onClick={copy}>
            {copied ? "Copied!" : "Copy text"}
          </button>
        </div>
      ) : null}
      <span className="visually-hidden" role="status">
        {copied ? "Shoutout copied to clipboard" : ""}
      </span>
    </div>
  );
}

function SessionRow({
  day,
  session,
  index,
  isNow,
  isPast,
  open,
  starred,
  onToggleOpen,
  onToggleStar,
}: {
  day: Day;
  session: Session;
  index: number;
  isNow: boolean;
  isPast: boolean;
  open: boolean;
  starred: boolean;
  onToggleOpen: () => void;
  onToggleStar: () => void;
}) {
  const key = sessionKey(day, session);
  const people = sessionPeople(session);
  const abstract = session.talkId ? talkText[session.talkId] : undefined;
  const expandable = Boolean(abstract || session.description || session.location);
  const panelId = `details-${key}`;

  return (
    <li
      id={`session-${key}`}
      className={`pocket-row pocket-row-${session.type}${isNow ? " is-now" : ""}${
        isPast ? " is-past" : ""
      }${open ? " is-open" : ""}`}
      data-index={index}
    >
      <div className="pocket-time">
        <span className="pocket-start">{session.start}</span>
        {session.end ? <span className="pocket-end">{session.end}</span> : null}
      </div>
      <div className="pocket-body">
        <span className="pocket-kind">
          {isNow ? <span className="pocket-now">Now</span> : null}
          {typeLabels[session.type]}
          {session.location ? ` · ${session.location}` : ""}
        </span>
        {expandable ? (
          <button
            type="button"
            className="pocket-title pocket-title-button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggleOpen}
          >
            <span>{session.title}</span>
            <span className="pocket-chevron" aria-hidden="true" />
          </button>
        ) : (
          <p className="pocket-title">{session.title}</p>
        )}
        {people.length > 0 ? (
          <p className="pocket-people">{people.map((p) => p.name).join(" & ")}</p>
        ) : null}
        {expandable ? (
          <div id={panelId} className="pocket-details" hidden={!open}>
            {session.description ? <p>{session.description}</p> : null}
            {abstract ? <Abstract text={abstract} /> : null}
            {people.some((p) => p.id) ? (
              <p className="pocket-details-links">
                {people
                  .filter((p) => p.id)
                  .map((p) => (
                    <a key={p.id} href={`/speakers#${p.id}`}>
                      About {p.name}
                    </a>
                  ))}
              </p>
            ) : null}
            {isStarrable(session) ? (
              <ShareSession session={session} names={people.map((p) => p.name)} />
            ) : null}
          </div>
        ) : null}
      </div>
      {isStarrable(session) ? (
        <button
          type="button"
          className={`pocket-star${starred ? " is-starred" : ""}`}
          aria-pressed={starred}
          aria-label={`Star “${session.title}”`}
          onClick={onToggleStar}
        >
          <StarIcon filled={starred} />
        </button>
      ) : null}
    </li>
  );
}

function Sponsors() {
  const tiers = sponsorTiers.filter((tier) => tier.sponsors.length > 0);
  return (
    <section className="pocket-sponsors" aria-label="Sponsors and partners">
      <p className="pocket-sponsors-intro">
        Thank you to the sponsors and community partners who make NodeConf EU 2026 possible.
      </p>
      {tiers.map((tier) => (
        <div
          key={tier.tier}
          className="pocket-tier"
          style={{ "--logo-h": `${Math.round(tier.logoHeight * SPONSOR_LOGO_SCALE)}px` } as CSSProperties}
        >
          <h2 className="pocket-day-heading">{tier.tier}</h2>
          <ul className={`pocket-sponsor-grid${tier.sponsors.length === 1 ? " is-single" : ""}`}>
            {tier.sponsors.map((sponsor) => (
              <li key={sponsor.name}>
                <a className="pocket-sponsor" href={sponsor.href} {...externalLinkProps(sponsor.name)}>
                  <span className={sponsor.logoFrameClassName}>
                    <SponsorLogo sponsor={sponsor} />
                  </span>
                  <span className="pocket-sponsor-name">{sponsor.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

// ---- App ----------------------------------------------------------------------

export default function AttendeeApp() {
  const { theme, setTheme } = useTheme();
  const now = useNow();
  const { stars, toggle } = useStars();
  const online = useOnline();
  const install = useInstall();
  useServiceWorker();

  const [tab, setTab] = useState<Tab | null>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const state = useMemo(() => (now ? timeline(days, now, TIME_ZONE) : null), [now]);
  const clock = now ? wallClock(now, TIME_ZONE) : null;
  // Until the user picks a tab, follow the clock (today during the event).
  const activeTab: Tab = tab ?? state?.dayIndex ?? 0;

  const openSession = useCallback((ref: SessionRef) => {
    const day = days[ref.dayIndex];
    const key = sessionKey(day, day.sessions[ref.index]);
    setTab(ref.dayIndex);
    setOpenKey(key);
    requestAnimationFrame(() =>
      document.getElementById(`session-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  }, []);

  // On first load during the event, bring the current session into view.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (scrolled || !state) return;
    setScrolled(true);
    const ref = state.current ?? (state.phase === "live" ? state.next : undefined);
    if (!ref || ref.dayIndex !== state.dayIndex) return;
    const day = days[ref.dayIndex];
    document
      .getElementById(`session-${sessionKey(day, day.sessions[ref.index])}`)
      ?.scrollIntoView({ block: "center" });
  }, [state, scrolled]);

  const showLive = now !== null && now >= liveSwitchDate && state?.phase !== "after";

  const renderRows = (day: Day, dayIndex: number, filter?: (s: Session) => boolean) => (
    <ol className="pocket-list">
      {day.sessions.map((session, index) => {
        if (filter && !filter(session)) return null;
        const key = sessionKey(day, session);
        const isNow = state?.current?.dayIndex === dayIndex && state.current.index === index;
        const isPast =
          !isNow &&
          clock !== null &&
          (day.date < clock.date ||
            (day.date === clock.date && sessionEndMinutes(day, index) <= clock.minutes));
        return (
          <SessionRow
            key={`${key}-${index}`}
            day={day}
            session={session}
            index={index}
            isNow={isNow}
            isPast={isPast}
            open={openKey === key}
            starred={stars.has(key)}
            onToggleOpen={() => setOpenKey(openKey === key ? null : key)}
            onToggleStar={() => toggle(key)}
          />
        );
      })}
    </ol>
  );

  const starredDays = days
    .map((day, dayIndex) => ({ day, dayIndex }))
    .filter(({ day }) => day.sessions.some((s) => stars.has(sessionKey(day, s))));

  return (
    <div className="pocket">
      <header className="pocket-bar">
        <a className="pocket-brand" href="/app" aria-label="NodeConf EU 2026 — program">
          <img src="/hexagon.svg" alt="" width={22} height={25} />
          <span>
            NodeConf EU <b>2026</b>
          </span>
        </a>
        <button
          type="button"
          className="pocket-icon-button"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <ThemeIcon theme={theme === "dark" ? "light" : "dark"} />
        </button>
      </header>

      {!online ? (
        <p className="pocket-offline" role="status">
          Offline — showing the saved program.
        </p>
      ) : null}

      <main className="pocket-main" id="main-content">
        {now && state ? <NowNext now={now} state={state} stars={stars} onOpen={openSession} /> : null}

        {showLive || install.canPrompt ? (
          <div className="pocket-actions">
            {showLive ? (
              <a className="pocket-action pocket-action-live" href={liveCta.href} {...externalLinkProps(liveCta.label)}>
                <span className="pocket-live-dot" aria-hidden="true" />
                {liveCta.label}
              </a>
            ) : null}
            {install.canPrompt ? (
              <button type="button" className="pocket-action" onClick={install.prompt}>
                Install app
              </button>
            ) : null}
          </div>
        ) : null}

        {install.iosHint ? (
          <div className="pocket-card pocket-hint" role="note">
            <p>
              Keep the program on your home screen: tap <b>Share</b>, then <b>Add to Home Screen</b>. It
              works offline too.
            </p>
            <button type="button" className="pocket-hint-close" onClick={install.dismissIosHint}>
              Got it
            </button>
          </div>
        ) : null}

        <nav className="pocket-tabs" aria-label="Sections">
          {days.map((day, i) => (
            <button
              key={day.date}
              type="button"
              className="pocket-tab"
              aria-pressed={activeTab === i}
              onClick={() => setTab(i)}
            >
              <span className="pocket-tab-name">{day.label}</span>
              <span className="pocket-tab-date">
                {day.weekday ? day.weekday.slice(0, 3) : ""} {Number(day.date.slice(8))}
              </span>
            </button>
          ))}
          <button
            type="button"
            className="pocket-tab"
            aria-pressed={activeTab === "starred"}
            onClick={() => setTab("starred")}
          >
            <span className="pocket-tab-name">Starred</span>
            <span className="pocket-tab-date">{stars.size || "none"}</span>
          </button>
          <button
            type="button"
            className="pocket-tab"
            aria-pressed={activeTab === "sponsors"}
            onClick={() => setTab("sponsors")}
          >
            <span className="pocket-tab-name">Sponsors</span>
            <span className="pocket-tab-date">
              {sponsorTiers.reduce((n, tier) => n + tier.sponsors.length, 0)}
            </span>
          </button>
        </nav>

        {activeTab === "sponsors" ? (
          <Sponsors />
        ) : activeTab === "starred" ? (
          starredDays.length === 0 ? (
            <p className="pocket-empty">
              Tap the <StarIcon filled={false} /> next to a session to add it here. Stars are saved on this
              device.
            </p>
          ) : (
            starredDays.map(({ day, dayIndex }) => (
              <section key={day.date} aria-label={`${day.label} starred sessions`}>
                <h2 className="pocket-day-heading">
                  {day.label} · {formatDay(day)}
                </h2>
                {renderRows(day, dayIndex, (s) => stars.has(sessionKey(day, s)))}
              </section>
            ))
          )
        ) : (
          <section aria-label={`${days[activeTab].label} schedule`}>
            <h2 className="pocket-day-heading">
              {days[activeTab].label} · {formatDay(days[activeTab])}
            </h2>
            {renderRows(days[activeTab], activeTab)}
          </section>
        )}

        {activeTab !== "sponsors" ? (
          <p className="pocket-footnote">All times are Bologna time (CEST). The program may still change.</p>
        ) : null}
      </main>

      <footer className="pocket-footer">
        <nav className="pocket-social" aria-label="NodeConf EU on social media">
          {socialLinks.map((link) => (
            <a key={link.title} href={link.href} {...externalLinkProps(link.title)}>
              <LinkIcon name={link.icon} />
            </a>
          ))}
        </nav>
        <div className="pocket-footer-links">
          <a href="/program.ics">
            <LinkIcon name="calendar" />
            <span>Add to calendar</span>
          </a>
          <a href="/">Full site</a>
          <a href="/code-of-conduct">Code of Conduct</a>
        </div>
      </footer>
    </div>
  );
}
