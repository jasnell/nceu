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
- Empty sponsor tiers should align visually with populated tiers.

## Validation Expectations

- For UI changes, prefer validating with:
  - `npm run build`
  - browser verification (`npm run dev`) when layout, theming, or accessibility is affected

## Editing Guidance

- Prefer minimal, targeted edits.
- Preserve the existing attendee-facing tone.
- Do not introduce a custom worker entry pattern (`getPlatformProxy`, etc.) for Cloudflare bindings — use `import { env } from "cloudflare:workers"` instead, per the migrate-to-vinext skill.
