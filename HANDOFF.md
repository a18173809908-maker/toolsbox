# Project Handoff

Last updated: 2026-05-01

## Current Status

This project is an AI tools aggregation site built as a Next.js single app.

- Repository: https://github.com/a18173809908-maker/toolsbox
- Production URL: https://toolsbox-six.vercel.app
- Main branch: `main`
- Latest local/remote commit at handoff: `e353fd7 Add lint and build CI`
- Build status locally: `npm run build` passes
- Lint status locally: `npm run lint` passes

## Tech Stack

- Next.js `16.2.4`
- React `19.2.4`
- TypeScript
- Drizzle ORM
- Neon Postgres via `@neondatabase/serverless`
- OpenAI-compatible LLM client, currently configured for DeepSeek
- GitHub Actions
- Vercel hosting

## Important Files

- `app/page.tsx`: homepage server entry; loads DB data and renders `V2ProHomepage`.
- `components/V2Pro.tsx`: main current UI implementation.
- `lib/db/schema.ts`: current DB schema.
- `lib/db/queries.ts`: homepage DB query + live homepage stats aggregation.
- `lib/jobs/github-trending.ts`: GitHub Trending scraper.
- `lib/jobs/refresh-trending.ts`: refreshes today/week/month trending rows.
- `lib/jobs/translate-trending.ts`: translates missing GitHub repo descriptions.
- `lib/llm/index.ts`: provider-agnostic chat/translation helper.
- `app/api/cron/refresh-trending/route.ts`: production cron endpoint; refreshes trending then translates.
- `.github/workflows/refresh-trending.yml`: hourly scheduled workflow calling the Vercel cron endpoint.
- `.github/workflows/ci.yml`: CI workflow running `npm ci`, `npm run lint`, and `npm run build`.
- `UI/**`: historical design/prototype files. ESLint ignores this directory.

## Environment Variables

Vercel needs:

- `DATABASE_URL`
- `DEEPSEEK_API_KEY`
- `LLM_PROVIDER`
- `LLM_MODEL`
- `CRON_SECRET`

GitHub Actions secrets need:

- `APP_URL`
- `CRON_SECRET`
- `DATABASE_URL`
- `DEEPSEEK_API_KEY`
- `LLM_PROVIDER`
- `LLM_MODEL`

`APP_URL` should currently be:

```text
https://toolsbox-six.vercel.app
```

Do not commit `.env.local`; it is ignored.

## Completed Work

1. Initialized Git and pushed to GitHub.
2. Deployed to Vercel.
3. Added cron endpoint:
   - `GET /api/cron/refresh-trending`
   - Protected by `Authorization: Bearer <CRON_SECRET>`
   - Runs GitHub Trending refresh and LLM translation.
4. Added hourly GitHub Actions workflow:
   - `.github/workflows/refresh-trending.yml`
   - Confirmed manually in GitHub Actions.
   - Successful sample output included refreshed `today/week/month` rows and translated descriptions.
5. Connected homepage stats to real DB data:
   - tool count
   - featured count
   - category count
   - unique tracked repos
   - today's repo count
   - today's gained stars
   - latest snapshot time
6. Made app lint pass:
   - Excluded `UI/**` prototype directory from ESLint.
   - Moved small render-local components in `components/V2Pro.tsx` to module scope.
7. Added CI workflow:
   - `.github/workflows/ci.yml`
   - Runs lint and build on push to `main` and pull requests.

## Known Notes / Caveats

- `UI/**` contains older prototypes and may have lint/runtime issues. Treat it as design reference, not production code.
- Several old markdown/design files may display mojibake in PowerShell due to encoding history. Avoid touching them unless specifically cleaning docs.
- `lib/data.ts` still contains static seed/mock data used by `lib/db/seed.ts`.
- The active homepage is DB-backed, not static-data-backed.
- GitHub Actions CI may fail if repository secrets are incomplete. If red, first verify `DATABASE_URL` exists in GitHub Actions secrets.
- The existing schema is intentionally MVP-sized:
  - `categories`
  - `tools`
  - `github_trending`
- The larger product plan mentions articles/RSS/users/search/SEO, but these are not implemented yet.

## Useful Commands

```powershell
npm run dev
npm run lint
npm run build
npm run db:push
npm run db:seed
npm run fetch:trending
npm run translate:trending
```

Be careful with:

```powershell
npm run db:seed
```

It clears and re-inserts seed rows.

## Recommended Next Steps

1. Confirm all GitHub Actions secrets are present, especially `DATABASE_URL`, so CI stays green.
2. Add a small health/status endpoint or admin script to inspect:
   - latest trending snapshot time
   - number of rows missing `descriptionZh`
   - last cron result
3. Add SEO baseline:
   - `sitemap.xml`
   - `robots.txt`
   - basic JSON-LD for homepage
   - Open Graph metadata
4. Start content module work:
   - add `sources` and `articles` schema
   - RSS fetcher
   - AI summary/tag/SEO-title pipeline
5. Consider adding a `jobs` table before expanding automation, so cron history is visible in the app.

## Coordination Notes For Claude Code

- Follow `AGENTS.md` / `CLAUDE.md`: keep changes surgical and verify with `lint` + `build`.
- Do not refactor `components/V2Pro.tsx` broadly unless the task is specifically UI cleanup.
- Prefer adding small DB-backed features end-to-end over large speculative architecture changes.
- Before schema changes, inspect `lib/db/schema.ts`, `lib/db/queries.ts`, and scripts that insert rows.
- After code changes, run:

```powershell
npm run lint
npm run build
```

