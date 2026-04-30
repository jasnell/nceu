# AGENTS.md

Agent-facing notes for the NodeConf EU 2026 website.

## Project Summary

- Repository purpose: single-page website for NodeConf EU 2026.
- Repository name: `nodeconfeu-2026`.
- Production path base: `/nodeconfeu-2026/`.

## Stack

- Framework: React 19.
- Build tool: Vite 8.
- Language: JavaScript with JSX.
- Linting: ESLint.
- Deployment: GitHub Pages via GitHub Actions.

## Important Files

- `src/App.jsx`: primary page content, content data, icons, and page structure.
- `src/App.css`: component and layout styling.
- `src/index.css`: global tokens, theming, typography, and shared behavior.
- `vite.config.js`: includes the GitHub Pages base path.
- `.github/workflows/deploy-pages.yml`: GitHub Pages deployment workflow.

## Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production bundle: `npm run build`
- Run lint: `npm run lint`
- Preview production build: `npm run preview`

## Deployment Notes

- Vite base path is configured for the GitHub Pages repo path: `/nodeconfeu-2026/`.
- The GitHub Actions workflow deploys on pushes to `main` and on manual dispatch.
- GitHub Pages must be configured in the repository settings to use `GitHub Actions` as the source.

## Design And Content Notes

- The site is intentionally a single page because most conference actions point to external destinations.
- Keep copy attendee-facing, not builder-facing.
- The visual direction lightly references Node.js branding without turning into a clone.
- Light and dark themes are both supported and should remain visually coherent.
- Action icons use brand-aware or intent-aware colors rather than a single accent color.

## Sponsor Section Notes

- Sponsor tiers are data-driven from `sponsorTiers` in `src/App.jsx`.
- Some sponsor logos need dark-mode support via logo frame treatments instead of blanket filters.
- Empty sponsor tiers should align visually with populated tiers.

## Validation Expectations

- For UI changes, prefer validating with:
  - `npm run build`
  - `npm run lint`
  - browser verification when layout, theming, or accessibility is affected

## Editing Guidance

- Prefer minimal, targeted edits.
- Preserve the existing attendee-facing tone.
- After making changes, commit and push them unless the user explicitly asks not to push.
- Do not remove the GitHub Pages deployment configuration unless the repository target changes.