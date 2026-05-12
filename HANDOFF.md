# Project Handoff

Last updated: 2026-05-12

## Current Status

This project is an AI tools aggregation site built as a Next.js single app.

- Repository: https://github.com/a18173809908-maker/toolsbox
- Production URL: https://toolsbox-six.vercel.app
- Main branch: `main`
- Latest commit: `3bb64a4 fix(home): 修首页两个 BUG`
- Build status: `npm run build` passes
- Lint status: `npm run lint` passes

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
- `lib/db/schema.ts`: current DB schema — includes `toolVerdicts` table added in M1 W1.
- `lib/db/queries.ts`: homepage DB query + live homepage stats aggregation.
- `lib/alternatives.ts`: static topic config for `/alternatives` pages.
- `lib/llm/index.ts`: provider-agnostic chat/translation helper; exports `ModelTier`, `resolveModelName`, `chat({ tier })`.
- `lib/jobs/github-trending.ts`: GitHub Trending scraper.
- `lib/jobs/refresh-trending.ts`: refreshes today/week/month trending rows.
- `lib/jobs/translate-trending.ts`: translates missing GitHub repo descriptions.
- `app/api/cron/refresh-trending/route.ts`: production cron endpoint.
- `.github/workflows/refresh-trending.yml`: hourly scheduled workflow.
- `.github/workflows/ci.yml`: CI workflow (lint + build).
- `scripts/eval-prompt.ts`: prompt quality eval harness — loads prompt + examples, runs LLM + anti-cliche audit, outputs markdown report to `tmp/`.
- `prompts/`: versioned prompt assets (see `prompts/README.md`).
- `docs/dev-plan-2026-05.md`: **active execution spec** — M1/M2/M3 task list, schema designs, CLI signatures, admin route specs. Read this before starting M1 Week 2.
- `docs/aiboxpro_详细版竞品分析与发展路线方案.md`: long-term strategic direction.
- `CLAUDE.md`: Claude Code orientation, collaboration rules.
- `UI/**`: historical design/prototype files. ESLint ignores this directory.

## Environment Variables

Vercel needs:

- `DATABASE_URL`
- `DEEPSEEK_API_KEY`
- `LLM_PROVIDER`
- `LLM_MODEL`
- `LLM_MODEL_PREMIUM` (new — set same as LLM_MODEL for now)
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

Do not commit `.env.local`; it is ignored. `.env.example` documents all required variables and is committed.

## Completed Work

### Infrastructure / DB / Ops

1. Initialized Git and pushed to GitHub.
2. Deployed to Vercel.
3. Cron endpoint: `GET /api/cron/refresh-trending` (protected by `CRON_SECRET`).
4. Hourly GitHub Actions workflow for trending refresh + LLM translation.
5. Connected homepage stats to real DB data (tool count, featured count, etc.).
6. Added CI workflow: lint + build on push to `main` and PRs.

### Sprint 2 (completed before 2026-05-10)

7. `/alternatives` and 5 `/alternatives/[slug]` pages are live.
8. `/compare/[slug]` emits Article, BreadcrumbList, and FAQPage JSON-LD.
9. Sitemap includes alternatives pages.
10. `tool_connectivity` table + seed script + tool detail page rendering.
11. `npm run draft:social -- <comparison-slug>` generates WeChat/Xiaohongshu/Zhihu drafts.
12. Source candidate discovery + review workflow (`/admin/sources`, `npm run discover:sources`).
13. Tool library sorted by hotness; cards show decision cues.
14. `/news` redesigned: single heading, full-width reading cards, hot events sidebar.

### M1 Week 1 — Prompt Engineering Foundation (completed 2026-05-11)

15. **`prompts/` directory** with full structure and `prompts/README.md` (frontmatter spec, version conventions, example format).
16. **5 verdict few-shot samples** — these define the brand voice, do not modify without owner sign-off:
    - `prompts/tool-verdict/examples/cursor.md` (coding / international)
    - `prompts/tool-verdict/examples/trae.md` (coding / domestic, free)
    - `prompts/tool-verdict/examples/kling.md` (video / domestic)
    - `prompts/tool-verdict/examples/runway.md` (video / international, China friction)
    - `prompts/tool-verdict/examples/doubao.md` (general / domestic)
17. **`prompts/tool-verdict/v1.md`** — main verdict prompt (6 voice rules, forbidden words, JSON output schema).
18. **`prompts/audit/anti-cliche.v1.md`** — anti-cliche auditor prompt (R1-R6 + W1-W3 rules, score 0-100, costs -8 per R rule, -6 per W rule).
19. **`lib/db/schema.ts`** — `toolVerdicts` table added (see schema in `docs/dev-plan-2026-05.md` §4.2). `npm run db:push` already run; table exists in Neon.
20. **`lib/llm/index.ts`** — added `ModelTier` type, `resolveModelName(tier)`, `chat({ tier })` param. `getClient(tier)` picks `LLM_MODEL` vs `LLM_MODEL_PREMIUM` env var.
21. **`scripts/eval-prompt.ts`** — eval harness. Usage: `npm run eval:prompt tool-verdict`.
22. **`.env.example`** — documents `LLM_MODEL_PREMIUM` field.
23. **`docs/dev-plan-2026-05.md`** — full 16-section execution spec (schema, CLI, admin routes, M1/M2/M3).

### Bug Fixes (2026-05-11/12)

24. **Bug 1 fixed** (`app/HomePageClient.tsx`): `quickTags` changed from keyword-search strings to filter-param objects (`/tools?pricing=Free`, `/tools?china=accessible`, `/tools?cat=video`, etc.).
25. **Bug 2 fixed** (`app/HomePageClient.tsx`): Added `stripHtmlForDisplay()` to sanitize raw HTML from InfoQ RSS feed stored in `articles.summary`.
26. **Bug 4 fixed** (GitHub Trending showing English): `DEEPSEEK_API_KEY` had expired (401). Key updated by owner. Ran `npm run translate:trending` → 47 rows now have `descriptionZh`.

## Pending / Deferred

- **Bug 3** (Admin automation task monitoring page): Deferred to M1 Week 2. Build alongside the 8 admin routes, reuse list-page style.
- **M1 Week 2** (T2.1–T2.6): See below — this is the next work block.
- **M1.5 Week 3**: Batch draft verdicts for 19 tools (12 video + 7 coding), run admin review.
- **M2 Weeks 4-5**: AI coding category comparisons + event page samples.
- **M3**: Rankings pages, GEO, data freshness, UI cleanup.

## Next Work Block: M1 Week 2 — Content Review Pipeline

Full spec in `docs/dev-plan-2026-05.md` §九 M1 第 2 周. Summary:

### T2.1 — Multi-tool comparison schema extension (0.5 day)

File: `lib/db/schema.ts`, `lib/db/queries.ts`, `app/compare/[slug]/page.tsx`

Add to `comparisons` table:
```ts
toolIds: text('tool_ids').array(),          // for N-tool comparisons (N ≤ 5)
verdictOneLiner: text('verdict_one_liner'), // one-sentence conclusion (GEO)
mentions: jsonb('mentions'),                // [{ name, url }] for JSON-LD
```

Keep `toolAId` / `toolBId`. When reading, prefer `toolIds`, fall back to `[toolAId, toolBId]`.
Update `loadComparisonById` to return `tools: Tool[]`.
Update compare page head to render N-tool icon row.
Existing 10 compare pages must still render correctly (regression test).

### T2.2 — 6 new draft tables + events table (1 day)

Create in `lib/db/schema.ts`:
- `comparisonDrafts`, `sceneDrafts`, `rankingDrafts`, `alternativeDrafts`, `toolFieldDrafts`, `eventVerdicts`
- `events` (main event table, status-flagged)

Every draft table must have the standard fields (see `docs/dev-plan-2026-05.md` §4.3):
`id, slug, sourceData (jsonb), aiDraft (jsonb), promptVersion, llmModel, antiClicheScore, status, reviewedBy, reviewedAt, rejectReason, createdAt, publishedAt`

Add query helpers per table in `lib/db/queries.ts`:
`load<Type>Drafts()`, `load<Type>DraftById(id)`, `publish<Type>Draft(id)`, `reject<Type>Draft(id, reason)`

Run `npm run db:push` after.

### T2.3 — 8 CLI draft commands (2 days)

Add to `package.json`:
```
"draft:verdict": "tsx --env-file=.env.local scripts/draft-verdict.ts",
"draft:event-verdict": "tsx --env-file=.env.local scripts/draft-event-verdict.ts",
"draft:comparison": "tsx --env-file=.env.local scripts/draft-comparison.ts",
"draft:scene": "tsx --env-file=.env.local scripts/draft-scene.ts",
"draft:ranking": "tsx --env-file=.env.local scripts/draft-ranking.ts",
"draft:alternative": "tsx --env-file=.env.local scripts/draft-alternative.ts",
"draft:event": "tsx --env-file=.env.local scripts/draft-event.ts",
"draft:tool-fields": "tsx --env-file=.env.local scripts/draft-tool-fields.ts",
```

Extract shared logic to `lib/draft/runner.ts`:
`runDraft(type, inputData, { promptType, dbInsertFn }): Promise<{ draftId, adminUrl, antiClicheScore }>`

Each script provides only: type-specific data fetch + input formatting. Runner handles: load prompt → call LLM → run audit → write to DB → print admin URL.

Prompt files for non-verdict types can be skeleton v1 at this stage — content quality is not the goal here, pipeline correctness is.

Priority: implement `draft:verdict` first (it uses the already-complete `tool-verdict/v1.md` prompt and `toolVerdicts` table). Verify end-to-end before building the others.

Verification: `npm run draft:verdict cursor` → row appears in `tool_verdicts` with `status='ai_drafted'`, terminal prints `http://localhost:3000/admin/verdicts/<id>`.

### T2.4 — 8 admin routes (1.5 days)

Reuse style from existing `/admin/sources/page.tsx` and `/admin/sources/[id]/page.tsx`.

Routes to create:
```
app/admin/verdicts/page.tsx              app/admin/verdicts/[id]/page.tsx
app/admin/event-verdicts/page.tsx        app/admin/event-verdicts/[id]/page.tsx
app/admin/comparisons/page.tsx           app/admin/comparisons/[id]/page.tsx
app/admin/scenes/page.tsx                app/admin/scenes/[id]/page.tsx
app/admin/rankings/page.tsx              app/admin/rankings/[id]/page.tsx
app/admin/alternatives/page.tsx          app/admin/alternatives/[id]/page.tsx
app/admin/events/page.tsx                app/admin/events/[id]/page.tsx
app/admin/tool-fields/page.tsx           app/admin/tool-fields/[id]/page.tsx
```

List page columns: slug / drafted_at / promptVersion / antiClicheScore (red if < 60) / status / actions.

Detail page layout: left = draft preview rendered as prose; right sticky = Publish button + Reject (with reason textarea).

API routes needed per type:
```
POST /api/admin/verdicts/[id]/publish
POST /api/admin/verdicts/[id]/reject     body: { reason: string }
```
(repeat pattern for all 8 types)

**Bug 3 integration**: add a `/admin/jobs` page that shows the last N cron/script runs (timestamp, type, rows affected, errors). This can read from a lightweight `jobs` table or just tail a log. Reuse the list-page style. See `docs/dev-plan-2026-05.md` §Recommended Next Steps item 10.

### T2.5 — Tighten article drafting filter (0.5 day)

File: `prompts/article-draft/v1.md` (create), `scripts/process-articles.ts` (modify)

Prompt must require all three of:
1. One-sentence event summary (≤ 30 chars)
2. China-specific impact (access / price / registration / Chinese UI change)
3. At least 1 internal asset link (tool / compare / scene)

If any is missing, LLM outputs `{"skip": true, "reason": "..."}`.
`process-articles.ts` must check for `skip: true` and not insert those rows.

### T2.6 — VerdictBlock component (0.5 day)

File: `components/VerdictBlock.tsx` (new), `app/tools/[slug]/page.tsx` (modify)

Props: `verdict: ToolVerdict` (the type exported from `lib/db/schema.ts`)

Visual spec:
- Container background: `#FFFBEB` (light yellow — distinguishes from objective white-bg fields)
- Top label: "本站观点" + `verdictUpdatedAt` date
- If `expiresAt` is past: red banner "本判断可能已过时，最后审核 YYYY-MM"
- `positionToday` badge colors: green for 国际第一梯队/国产第一梯队, yellow for 仍领先/观察中/小众但有差异化, red for 已被超越
- Sections: verdictOneLiner / whoShouldPick list / whoShouldSkip list / vsAlternatives list / caveats

In tool detail page: query `loadVerdictByToolId(toolId)` (already to-be-added to queries.ts in T2.2), render `<VerdictBlock>` below objective fields with visual gap.

Verification: manually insert one `published` verdict row for an existing tool, visit `/tools/<slug>`, confirm VerdictBlock renders.

### M1 Week 2 acceptance criteria

- `npm run db:push` succeeds with all new tables
- `npm run draft:verdict cursor` → row in DB → admin URL works in browser
- All 8 draft commands run without crash (quality is secondary)
- All 8 admin list + detail routes load without error
- Publish/reject API routes work end-to-end
- VerdictBlock renders on at least one tool detail page
- `npm run lint` and `npm run build` pass

## Known Notes / Caveats

- `UI/**` contains older prototypes. Treat as design reference only.
- `lib/data.ts` contains static seed/mock data used by `lib/db/seed.ts`. The live homepage is DB-backed.
- Do NOT run `npm run db:seed` casually — it clears and re-inserts seed rows.
- `scripts/eval-prompt.ts` reads prompts from the worktree's CWD, not the main repo. If running in a worktree, ensure `.env.local` is present (copy from main repo root).
- GitHub Actions CI may fail if repository secrets are incomplete. Verify `DATABASE_URL` exists in GitHub Actions secrets if CI is red.
- Schema now includes: `categories`, `tools`, `github_trending`, `sources`, `articles`, `tool_candidates`, `comparisons`, `tool_connectivity`, `tool_verdicts` (M1 W1).
- After M1 W2 schema push, it will also include: `events`, `comparisonDrafts`, `sceneDrafts`, `rankingDrafts`, `alternativeDrafts`, `toolFieldDrafts`, `eventVerdicts`.
- I9-B (real connectivity measurements) is still a manual data task; deferred.
- Do not revive the removed `/news` filter pill row.
- Do not refactor `components/V2Pro.tsx` broadly unless the task is specifically UI cleanup.

## Useful Commands

```bash
npm run dev
npm run lint
npm run build
npm run db:push
npm run db:studio

# Data pipeline
npm run fetch:trending
npm run translate:trending
npm run enhance:trending -- today
npm run fetch:articles
npm run process:articles
npm run update:article-hotness -- 300
npm run discover:sources

# Drafting (M1 W1 complete; M1 W2 to be implemented)
npm run eval:prompt tool-verdict

# Social / audit
npm run draft:social -- <comparison-slug>
npm run audit:comparisons
```

## Coordination Notes

- Follow `CLAUDE.md`: keep changes surgical, verify with `lint` + `build` after every code change.
- The active execution spec is `docs/dev-plan-2026-05.md`. It takes priority over `docs/phased-roadmap.md` and `docs/current-position.md` when they conflict.
- Before schema changes: read `lib/db/schema.ts` and `lib/db/queries.ts` fully.
- After schema changes: run `npm run db:push` and verify with `npm run build`.
- Do not publish roadmap copy ("稍后会补", "即将上线") in production-facing pages.
- Human reviews and publishes all drafted content via `/admin/*` — do not auto-publish.
- The 5 verdict few-shot examples (`prompts/tool-verdict/examples/*.md`) are the brand voice baseline. Do not modify them without owner sign-off.
