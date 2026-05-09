# Project Handoff

Last updated: 2026-05-09

## Current Status

This project is an AI tools aggregation site built as a Next.js single app.

- Repository: https://github.com/a18173809908-maker/toolsbox
- Production URL: https://toolsbox-six.vercel.app
- Main branch: `main`
- Latest local/remote commit at handoff: `ede3dd7 feat(I9): add connectivity data layer`
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
- `lib/alternatives.ts`: static topic config for `/alternatives` pages.
- `scripts/seed-connectivity.ts`: imports real connectivity measurements from JSON into `tool_connectivity`.
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
8. Completed Sprint 2 I8/I14/I15:
   - `/alternatives` and 5 `/alternatives/[slug]` pages are live.
   - `/compare/[slug]` emits Article, BreadcrumbList, and FAQPage JSON-LD.
   - Sitemap includes alternatives pages.
   - Homepage search placeholder and admin featured toggle were updated.
9. Completed Sprint 2 I11/I12 documentation:
   - `docs/community-distribution-sop.md`
   - `docs/vendor-outreach-sop.md`
10. Completed Sprint 2 I9-A engineering:
   - Added `tool_connectivity` table and indexes, pushed to Neon.
   - Added `loadConnectivityByToolId`.
   - Tool detail pages render a connectivity table when data exists.
   - `npm run seed:connectivity -- <measurements.json>` imports real measurements only; no fake seed data is bundled.
11. Completed Sprint 2 I10 comparison-page social draft generator:
   - `npm run draft:social -- <comparison-slug>` reads a published comparison.
   - Outputs WeChat, Xiaohongshu, and Zhihu markdown plus PNG cover/cards under `draft-package/<slug>/`.
   - `draft-package/` is gitignored.
   - This does not generate GitHub Trending tutorial drafts.

## Known Notes / Caveats

- `UI/**` contains older prototypes and may have lint/runtime issues. Treat it as design reference, not production code.
- Several old markdown/design files may display mojibake in PowerShell due to encoding history. Avoid touching them unless specifically cleaning docs.
- `lib/data.ts` still contains static seed/mock data used by `lib/db/seed.ts`.
- The active homepage is DB-backed, not static-data-backed.
- GitHub Actions CI may fail if repository secrets are incomplete. If red, first verify `DATABASE_URL` exists in GitHub Actions secrets.
- The schema now includes content and workflow tables beyond the original MVP, including:
  - `categories`
  - `tools`
  - `github_trending`
  - `sources`
  - `articles`
  - `tool_candidates`
  - `comparisons`
  - `tool_connectivity`
- I9-B is still a manual data task: real connectivity measurements are not filled yet. Carrier-specific coverage is no longer required; use `carrier: "general"` for the current single-network baseline.

## Useful Commands

```powershell
npm run dev
npm run lint
npm run build
npm run db:push
npm run db:seed
npm run fetch:trending
npm run translate:trending
npm run seed:connectivity -- <measurements.json>
npm run draft:social -- <comparison-slug>
```

Be careful with:

```powershell
npm run db:seed
```

It clears and re-inserts seed rows.

## Recommended Next Steps

1. Fill I9-B real connectivity data using `npm run seed:connectivity -- <measurements.json>` with one real baseline measurement per core tool. Use `carrier: "general"` unless carrier-specific data is intentionally collected later.
2. Produce the first I7 Lab report with real Methodology Box values.
3. Use I10 for comparison-page social distribution drafts; GitHub Trending tutorial drafts are intentionally out of scope.
4. Keep docs synchronized:
   - `docs/sprint-2.md`
   - `docs/manual-tasks.md`
   - `docs/sprint-3-draft.md`
   - `CODEX_TASKS.md`
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
