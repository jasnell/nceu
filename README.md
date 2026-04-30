# NodeConf EU 2026

This repository contains the website for NodeConf EU 2026.

The site is a single-page experience focused on the conference itself: event information, venue details, tickets, CFP, sponsors, and links to the wider NodeConf EU presence.

## Stack

- [vinext](https://github.com/hi-ogawa/vite-plugins/tree/main/packages/vinext) (Next.js App Router on Vite) with React 19
- TypeScript
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) for hosting (via `@cloudflare/vite-plugin` and `vinext deploy`)

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The dev server runs at http://localhost:3000.

## Build And Deploy

```bash
# Production build
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

`vinext deploy` reads `wrangler.jsonc` and deploys via `wrangler`.

## Project Structure

```
.
├── app/
│   ├── globals.css      # tokens, theming, typography, layout
│   ├── layout.tsx       # root layout, metadata, theme bootstrap
│   └── page.tsx         # home page (client component)
├── public/
│   └── favicon.svg
├── worker/
│   └── index.ts         # Cloudflare Worker entry (image optimization + handler)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── wrangler.jsonc
```

Technical and maintenance notes for coding agents live in `AGENTS.md`.
