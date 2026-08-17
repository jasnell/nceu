# AGENTS.md

Agent-facing notes for the NodeConf EU 2026 website.

## Project Summary

- Repository purpose: single-page website for NodeConf EU 2026.
- Hosted on Cloudflare Workers via `vinext deploy`.

## Stack

- Framework: vinext (Next.js App Router reimplemented on Vite) + React 19.
- Language: TypeScript.
- Deployment: Cloudflare Workers (`@cloudflare/vite-plugin`, `wrangler`).

## Important Files

- `app/page.tsx`: primary page content, content data, icons, and page structure (client component for theme switching and the days-until counter).
- `app/layout.tsx`: root HTML shell, metadata, favicon, and inline theme bootstrap that prevents flash on load.
- `app/globals.css`: tokens, theming, typography, and component/layout styling.
- `vite.config.ts`: vinext + RSC + Cloudflare plugin wiring.
- `wrangler.jsonc`: Cloudflare Worker config.
- `worker/index.ts`: Worker entry handling image optimization and delegating the rest to vinext.
- `scripts/check-content.ts`: validates the content graph (program ↔ speakers ↔ talks references, anchor uniqueness, title drift, schedule times, speaker photos). Runs on `npm run check`, `npm test`, and before every build.
- `test/content.test.ts`: tests for the above, using temporary fixtures that break the graph on purpose.
- `vite-content-plugin.ts`: build-time loader that inlines `*.yaml`/`*.yml` as data and renders `*.md` (YAML frontmatter + `marked` body) to `{ ...frontmatter, html }`. Runs during the build, so no YAML/Markdown parser ships to the worker.
- `content/program.yaml`: the talk schedule, rendered by `app/program/page.tsx`.
- `content/speakers/*.md`: one file per speaker (frontmatter + Markdown bio), rendered by `app/speakers/page.tsx`. Files starting with `_` (e.g. `_template.md`) are ignored; the filename is the speaker id used by `speakerId` in `program.yaml` and in `content/talks/*.md`. Speakers are listed alphabetically by name, and each card links its talks to `/program#<talkId>`.
- Co-presented talks: the extra speakers go in `coSpeakerIds` on both the talk file and its session in `program.yaml` (the checker fails if the two lists differ). The program page reads their names from their speaker files and joins them with `&`; the talk shows up on every listed speaker's card.
- `content/talks/*.md`: one file per talk (frontmatter + Markdown abstract). The filename is the talk id used by `talkId` in `program.yaml`; sessions with a `talkId` expand in place on the program page to reveal the abstract. Abstracts live here only — speaker bios stay biographical so the text is not duplicated across the two pages.

## Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production bundle: `npm run build`
- Local production server: `npm run start`
- Deploy to Cloudflare Workers: `npm run deploy`

## Theming

- Theme is `light` or `dark`, persisted in `localStorage` under `nodeconf-theme`.
- The inline script in `app/layout.tsx` sets `data-theme` on `<html>` before paint to avoid a flash.
- `app/page.tsx` mirrors the resolved theme via state and reapplies the attribute for client-side toggles.

## Design And Content Notes

- The site is intentionally a single page because most conference actions point to external destinations.
- Keep copy attendee-facing, not builder-facing.
- The visual direction lightly references Node.js branding without turning into a clone.
- Light and dark themes are both supported and should remain visually coherent.
- Action icons use brand-aware or intent-aware colors rather than a single accent color.

## Sponsor Section Notes

- Sponsor tiers are data-driven from `sponsorTiers` in `app/page.tsx`.
- Some sponsor logos need dark-mode support via logo frame treatments instead of blanket filters.
- Single-color logos instead set `logoDark` alongside `logo`, which renders both assets and swaps them on the theme (`sponsor-logo-variant-light` / `-dark`).
- Empty sponsor tiers should align visually with populated tiers.

## Validation Expectations

- For content changes (`content/**`), run `npm test`. `npm run check` alone runs
  just the integrity checks; `npm run build` runs them automatically via
  `prebuild`, so a broken `speakerId`/`talkId` fails the build instead of
  silently rendering a session with no abstract or a link to a missing anchor.
- For UI changes, prefer validating with:
  - `npm run build`
  - browser verification (`npm run dev`) when layout, theming, or accessibility is affected

## Editing Guidance

- Prefer minimal, targeted edits.
- Preserve the existing attendee-facing tone.
- Do not introduce a custom worker entry pattern (`getPlatformProxy`, etc.) for Cloudflare bindings — use `import { env } from "cloudflare:workers"` instead, per the migrate-to-vinext skill.
