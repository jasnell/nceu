"use client";

import { SiteFooter, ThemeSwitch, useTheme } from "../shared";
import program from "@/content/program.yaml";

type SessionType = "talk" | "intro" | "break" | "social";

type Session = {
  start: string;
  end?: string;
  type: SessionType;
  title: string;
  speaker?: string;
  speakerId?: string;
  location?: string;
  description?: string;
};

type Day = {
  date: string;
  label: string;
  weekday?: string;
  sessions: Session[];
};

const typeLabels: Record<SessionType, string> = {
  talk: "Talk",
  intro: "Stage",
  break: "Pause",
  social: "Social",
};

const pad = (n: number) => String(n).padStart(2, "0");

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProgramPage() {
  const { theme, setTheme } = useTheme();
  const days = program.days as Day[];
  const talkTotal = days.reduce(
    (n, day) => n + day.sessions.filter((s) => s.type === "talk").length,
    0,
  );

  return (
    <div className="page-shell program-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header">
        <a className="brand-mark" href="/">
          NodeConf EU 2026
        </a>
        <div className="header-actions">
          <nav className="top-links" aria-label="Primary">
            <a href="/speakers">
              <span>Speakers</span>
            </a>
            <a href="/">
              <span>Home</span>
            </a>
          </nav>
          <ThemeSwitch theme={theme} setTheme={setTheme} />
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="run-masthead" aria-labelledby="program-title">
          <p className="kicker">NodeConf EU 2026 · Running order</p>
          <h1 className="run-title" id="program-title">
            {program.title ?? "Program"}
          </h1>
          {program.tagline ? (
            <p className="run-tagline">{program.tagline}</p>
          ) : null}
          {program.intro ? <p className="run-lede">{program.intro}</p> : null}

          <ul className="run-facts">
            <li>
              <b>{days.length}</b>
              <span>days</span>
            </li>
            <li>
              <b>{talkTotal}</b>
              <span>talks</span>
            </li>
            <li>
              <b>1</b>
              <span>track</span>
            </li>
            <li>
              <b>∞</b>
              <span>hallway</span>
            </li>
          </ul>

          <nav className="run-jump" aria-label="Jump to day">
            {days.map((day, i) => (
              <a key={day.date} href={`#day-${i + 1}`}>
                {pad(i + 1)} / {day.label}
              </a>
            ))}
          </nav>
        </section>

        {days.map((day, di) => (
          <section
            key={day.date}
            id={`day-${di + 1}`}
            className="run-day"
            aria-label={`${day.label} schedule`}
          >
            <header className="run-day-head">
              <span className="run-day-index" aria-hidden="true">
                {pad(di + 1)}
              </span>
              <div className="run-day-meta">
                <h2 className="run-day-name">{day.label}</h2>
                <p className="run-day-date">
                  {day.weekday ? `${day.weekday} · ` : ""}
                  {formatDate(day.date)}
                </p>
              </div>
            </header>

            <ol className="run-list">
              {day.sessions.map((session, i) => {
                if (session.type === "social") {
                  return (
                    <li
                      key={`${day.date}-${session.start}-${i}`}
                      className="run-feature"
                    >
                      <div className="ticket">
                        <div className="ticket-main">
                          <p className="ticket-kind">Evening · Social</p>
                          <h3 className="ticket-title">{session.title}</h3>
                          {session.description ? (
                            <p className="ticket-text">{session.description}</p>
                          ) : null}
                        </div>
                        <div className="ticket-stub">
                          <span className="ticket-time">{session.start}</span>
                          {session.location ? (
                            <span className="ticket-loc">{session.location}</span>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                }

                return (
                  <li
                    key={`${day.date}-${session.start}-${i}`}
                    className={`run-row run-row-${session.type}`}
                  >
                    <div className="run-rail">
                      <span className="run-node" aria-hidden="true" />
                      <span className="run-start">{session.start}</span>
                      {session.end ? (
                        <span className="run-finish">{session.end}</span>
                      ) : null}
                    </div>
                    <div className="run-entry">
                      <span className="run-kind">{typeLabels[session.type]}</span>
                      <p className="run-name">{session.title}</p>
                      {session.speaker ? (
                        <p className="run-people">
                          {session.speakerId ? (
                            <a href={`/speakers#${session.speakerId}`}>
                              {session.speaker}
                            </a>
                          ) : (
                            session.speaker
                          )}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </main>

      <SiteFooter />
    </div>
  );
}
