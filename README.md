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

## Photos

Conference photos are stored in the `nodeconf-eu-photos` R2 bucket and appear on `/photos` within about a minute of upload, with no deploy. Each day's album needs a `content/photos/<date>/_album.md`.

One-time setup (bucket owner):

1. Create the bucket in Western Europe: `npx wrangler r2 bucket create nodeconf-eu-photos --location weur`. Location hints only apply the first time a bucket name is created, so if it ever has to move region, use a new name.
2. In the dashboard, go to **R2 → Manage API Tokens → Create API token**, choose **Object Read & Write**, and scope it to `nodeconf-eu-photos` only.
3. Give the photographer the **Access Key ID** and **Secret Access Key**. Revoke the token after the event.

Uploading (photographer; needs Node 22.18+, and nothing else from this repo is required besides `scripts/upload-photos.ts`):

```bash
export R2_ACCESS_KEY_ID=…        # or put both in a .env file in the current directory
export R2_SECRET_ACCESS_KEY=…
node scripts/upload-photos.ts 2026-09-29 ~/Export/day-one/      # re-runs skip finished files
node scripts/upload-photos.ts --delete 2026-09-29 DSC_0042.jpg  # remove a photo
```

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

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct. Please read [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) before participating.
