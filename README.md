# Vinext Hello World

A simple hello world application built with [vinext](https://github.com/hi-ogawa/vite-plugins/tree/main/packages/vinext) - a Next.js reimplementation on Vite, deployed to Cloudflare Workers.

## Features

- **React 19** with App Router
- **Server Components** support via `@vitejs/plugin-rsc`
- **Cloudflare Workers** deployment via `@cloudflare/vite-plugin`
- **TypeScript** support

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The dev server will start at http://localhost:3000

### Build

```bash
npm run build
```

### Deploy to Cloudflare

```bash
# Deploy to production
npm run deploy

# Or deploy to preview environment
npx vinext deploy --preview
```

## Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration with Cloudflare
└── wrangler.jsonc         # Cloudflare Workers configuration
```

## Accessing Cloudflare Bindings

To use Cloudflare bindings (D1, R2, KV, AI, etc.), import `env` from `cloudflare:workers`:

```tsx
import { env } from "cloudflare:workers";

export default async function Page() {
  const result = await env.DB.prepare("SELECT * FROM posts").all();
  return <div>{JSON.stringify(result)}</div>;
}
```

Then add your bindings to `wrangler.jsonc`:

```jsonc
{
  "d1_databases": [{ "binding": "DB", "database_name": "my-db", "database_id": "..." }],
  "kv_namespaces": [{ "binding": "CACHE", "id": "..." }],
  "r2_buckets": [{ "binding": "BUCKET", "bucket_name": "my-bucket" }]
}
```

Run `wrangler types` to generate TypeScript types for the `env` object.

## Learn More

- [vinext documentation](https://github.com/hi-ogawa/vite-plugins/tree/main/packages/vinext)
- [Vite documentation](https://vitejs.dev/)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
