# EcoQuest — Restore the Planet

An environmental education game built with TanStack Start, React, and Supabase. Explore Forestia and Aquaria, complete quests, and restore the world's ecosystems.

## Development

You need Node.js ≥ 18 and npm.

```sh
git clone <this-repository-url>
cd <repository-name>
cp .env.example .env   # fill in your Supabase credentials
npm install
npm run dev
```

## Environment Variables

See `.env.example` for all required variables. At minimum you need:

- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_PUBLISHABLE_KEY` — your Supabase publishable (anon) API key
- `CRON_SECRET` — a strong random secret used to authenticate scheduled cron requests

## Deployment

This project targets **Vercel** via Nitro. Run `npm run build` and deploy the output, or connect the repository to Vercel for automatic deployments.

To change the deployment target, update the `preset` field in [`vite.config.ts`](./vite.config.ts).

## Database

Schema and RLS policies live in [`supabase/migrations/`](./supabase/migrations/). To apply them to a new Supabase project:

```sh
npx supabase db push
```

## Tech Stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework
- [TanStack Router](https://tanstack.com/router) — type-safe routing
- [Supabase](https://supabase.com) — auth + Postgres database
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- [Phaser 3](https://phaser.io) — game engine
- [TypeScript](https://www.typescriptlang.org) — type safety
