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
- `docs/aiboxpro_详细版竞品分析与发展路线方案.md`: active long-term strategic direction and roadmap source.
- `docs/phased-roadmap.md`: multi-phase execution plan derived from the detailed strategic roadmap.
- `docs/current-position.md`: current product positioning and active documentation index.
- `CLAUDE.md`: Claude Code orientation, current project context, and collaboration rules.
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
12. Reset active documentation:
   - Added `docs/current-position.md` as the concise current strategy entry.
   - Updated `docs/README.md` to separate active docs from archive material.
   - Updated `CLAUDE.md` so Claude Code can understand the current positioning and collaboration rules.
   - Archived older sprint plans, old prototype HTML, duplicate baseline data, and temporary review docs under `docs/archive/2026-05-09-doc-reset/`.
13. Promoted the detailed competitive roadmap back to active strategy:
   - `docs/aiboxpro_详细版竞品分析与发展路线方案.md` is now the long-term direction.
   - AI video remains the current execution wedge for validating that strategy.
14. Started Phase 1 AI resources/news enhancement:
   - Added `articles.ai_insights` JSONB field.
   - `process:articles` now generates structured insights for news/resources.
   - `/news` cards and `/news/[id]` detail pages render richer reading aids.
15. Added source candidate discovery/review workflow:
   - Added `source_candidates` table for candidate information sources.
   - Added `npm run discover:sources` to collect formal candidate sources and sample RSS titles.
   - Added `/admin/sources` and `/admin/sources/[id]` for source review.
   - Approving a source adds it to `sources`; rejected candidates stay out of the active fetch pool.

## Known Notes / Caveats

- `UI/**` contains older prototypes and may have lint/runtime issues. Treat it as design reference, not production code.
- Several old markdown/design files may display mojibake in PowerShell due to encoding history. Avoid touching them unless specifically cleaning docs.
- Archived docs are historical reference only; active direction starts from `docs/aiboxpro_详细版竞品分析与发展路线方案.md`, `docs/phased-roadmap.md`, `docs/current-position.md`, and `docs/sprint-3.md`. `docs/manual-tasks.md` is a future manual work pool and is currently paused.
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
npm run enhance:trending -- today
npm run fetch:articles
npm run process:articles
npm run discover:sources
npm run update:article-hotness -- 300
npm run seed:connectivity -- <measurements.json>
npm run draft:social -- <comparison-slug>
```

Be careful with:

```powershell
npm run db:seed
```

It clears and re-inserts seed rows.

## Recommended Next Steps

1. Prioritize automated/productized work only; manual participation is paused for now.
2. Strengthen video alternative pages, especially Runway alternatives for Chinese users.
3. Add doc-based video scenario pages that do not require real manual testing.
4. Improve internal links across tool detail, comparison, alternative, and scenario pages.
5. Keep comparison content tied to official sources and mark untested claims clearly.
6. Keep docs synchronized:
   - `docs/current-position.md`
   - `docs/manual-tasks.md`
   - `docs/sprint-3.md`
   - `CODEX_TASKS.md`
7. Consider adding a `jobs` table before expanding automation, so cron history is visible in the app.

Manual work is currently deferred, including real connectivity measurement, Lab reports, manual review, social distribution, vendor outreach, community operations, and business development.

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
