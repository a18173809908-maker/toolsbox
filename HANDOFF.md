# Project Handoff

Last updated: 2026-05-13

## Current Status

AIBoxPro — 面向中文用户的 AI 工具选择与决策平台。

- Repository: https://github.com/a18173809908-maker/toolsbox
- Production URL: https://www.aiboxpro.cn
- Main branch: `main`
- Latest commit: `8da484b Show Chinese desc and whyTrending reason on homepage GitHub trending cards`
- Build status: `npm run build` passes
- Lint status: `npm run lint` passes

## Tech Stack

- Next.js 15 App Router, React 19, TypeScript
- Drizzle ORM + Neon Postgres (`@neondatabase/serverless`)
- DeepSeek LLM via OpenAI-compatible client (`lib/llm/index.ts`)
- Vercel hosting + Vercel Cron
- `youtube-transcript` npm package (no API key needed, extracts captions)
- YouTube Data API v3 (requires `YOUTUBE_API_KEY`, for video search)

## Platform Structure (4 pillars)

| Pillar | Route | Data source |
|--------|-------|-------------|
| 工具库 | `/tools`, `/tools/[slug]` | `tools` DB table |
| AI 资讯 | `/news` | `articles` table, fetched via RSS |
| GitHub 热门 | `/trending`, `/trending/[...slug]` | `github_trending` table |
| 动态 | `/spotlight` | `tool_updates` + `repo_spotlights` tables (unified feed) |

Navigation: 首页 / 工具 / AI 资讯 / GitHub / 动态

## Environment Variables

Vercel (production):
```
DATABASE_URL
DEEPSEEK_API_KEY
LLM_PROVIDER=deepseek
LLM_MODEL=deepseek-chat
LLM_MODEL_PREMIUM=deepseek-chat
CRON_SECRET
YOUTUBE_API_KEY          ← YouTube Data API v3 key
ADMIN_PASSWORD           ← admin panel password (cookie auth)
BAIDU_TRANSLATE_APP_ID   ← optional, Baidu translate
BAIDU_TRANSLATE_APP_KEY  ← optional, Baidu translate
```

Do not commit `.env.local`. See `.env.example` for the full list.

## DB Schema (current tables)

```
categories
tools
github_trending          ← period/repo/description/descriptionZh/aiInsights(jsonb)/stars/gained
sources
articles
tool_candidates
comparisons
tool_connectivity
tool_verdicts
repo_spotlights          ← GitHub repo deep-dives (spotlight pipeline)
tool_updates             ← YouTube-sourced AI tool update articles
```

After any schema change: `npm run db:push`

## Key Files

```
app/page.tsx                         — Homepage server entry
app/HomePageClient.tsx               — Homepage UI (client component)
app/spotlight/page.tsx               — 动态 unified feed (tool_updates + repo_spotlights)
app/updates/[id]/page.tsx            — Tool update article detail
app/spotlight/[id]/page.tsx          — GitHub spotlight detail
app/trending/page.tsx                — GitHub trending list
app/news/page.tsx                    — AI 资讯

lib/db/schema.ts                     — Full DB schema
lib/db/queries.ts                    — All DB query helpers
lib/data.ts                          — Static types + fallback data (RepoItem etc.)
lib/llm/index.ts                     — LLM client (chat, translate helpers)
lib/tokens.ts                        — Design tokens (v2Tokens)

lib/jobs/fetch-tool-updates.ts       — YouTube search → transcript → LLM → tool_updates
lib/jobs/spotlight-repos.ts          — GitHub trending → README → LLM → repo_spotlights
lib/jobs/refresh-trending.ts         — Refresh github_trending rows
lib/jobs/translate-trending.ts       — Translate github_trending descriptions to ZH
lib/jobs/enhance-trending.ts         — LLM aiInsights for github_trending rows
lib/jobs/fetch-articles.ts           — RSS article fetch
lib/jobs/process-articles.ts         — LLM article processing

components/SiteHeader.tsx            — Nav (首页/工具/AI资讯/GitHub/动态)

app/admin/tool-updates/page.tsx      — Admin: review tool update drafts
app/admin/tool-updates/[id]/page.tsx — Admin: publish/reject a tool update
app/admin/spotlights/page.tsx        — Admin: review spotlight drafts
app/admin/spotlights/[id]/page.tsx   — Admin: publish/reject a spotlight

app/api/cron/tool-updates/route.ts   — Cron: run fetch-tool-updates job
app/api/cron/repo-spotlight/route.ts — Cron: run spotlight-repos job
app/api/cron/debug-youtube/route.ts  — Debug: test YouTube API (temporary, delete after done)
app/api/admin/tool-updates/[id]/publish/route.ts
app/api/admin/tool-updates/[id]/reject/route.ts
app/api/admin/spotlights/[id]/publish/route.ts
app/api/admin/spotlights/[id]/reject/route.ts

middleware.ts                        — Admin auth (cookie-based, ADMIN_PASSWORD env)
vercel.json                          — Vercel cron schedules
```

## Cron Schedule

```json
/api/cron/refresh-trending    → 0 1 * * *   (daily 01:00)
/api/cron/refresh-articles    → 0 2 * * *   (daily 02:00)
/api/cron/refresh-tools       → 0 3 * * *   (daily 03:00)
/api/cron/aibot-sitemap       → 0 4 * * 1   (weekly Mon 04:00)
/api/cron/notify-review       → 0 1 * * *   (daily 01:00)
/api/cron/repo-spotlight      → 0 6 * * 1   (weekly Mon 06:00)
/api/cron/tool-updates        → 0 7 * * *   (daily 07:00)
```

All cron routes are protected by `Authorization: Bearer <CRON_SECRET>`.

## Content Pipeline: 动态 (Tool Updates)

Flow: YouTube Data API v3 → extract transcript (`youtube-transcript`) → DeepSeek LLM → insert `tool_updates` (status=`ai_drafted`) → admin review → publish

Tracked tools: Cursor / Claude / ChatGPT / Gemini / Codex / GitHub Copilot / Midjourney / Sora / Runway / Kling AI / Trae / Windsurf / Bolt / v0 / Perplexity / Kimi / DeepSeek / 豆包

Parameters:
- `MAX_TOOLS_PER_RUN = 5` (top 5 by video count this week)
- `MAX_VIDEOS_PER_TOOL = 2`
- Search window: last 7 days, ordered by viewCount, `relevanceLanguage: en`
- Dedup key: `snapshotWeek + sourceUrl`
- Transcript fallback: en → en-US → no lang → falls back to video description if all fail

**Known issue**: YouTube Data API v3 has 10,000 units/day quota. Each search costs 100 units → 100 searches/day max. After heavy testing the quota was exceeded; resets daily at midnight Pacific Time. The cron runs at 07:00 UTC daily which is fine in steady state.

## Content Pipeline: GitHub Spotlight

Flow: `github_trending` (period=week, top 3) → GitHub README API → optional YouTube/Serper enrichment → DeepSeek LLM → insert `repo_spotlights` (status=`ai_drafted`) → admin review → publish

Runs weekly (Monday 06:00 UTC).

## Admin Panel

URL: `/admin` (protected by `ADMIN_PASSWORD` cookie)
Login: `/admin/login`

Available admin sections:
- `/admin/tool-updates` — review YouTube-sourced AI tool articles
- `/admin/spotlights` — review GitHub spotlight deep-dives
- `/admin/sources` — article source candidates
- `/admin/jobs` — job run history

Publish flow: ai_drafted → (admin clicks Publish) → status=`published`, `publishedAt` set → appears in `/spotlight` feed.

## Completed Work (this session, 2026-05-12/13)

1. **Platform repositioned** to 4-pillar structure; old sections (场景指南, 工具榜单, 对比, AI事件, 仓库精选 as separate nav) removed.
2. **Navigation** simplified to 5 items: 首页 / 工具 / AI 资讯 / GitHub / 动态.
3. **Homepage** hero and CTA copy updated to user-facing language; irrelevant sections removed; GitHub trending cards now show Chinese description + "上榜理由".
4. **`lib/jobs/fetch-tool-updates.ts`** — full YouTube → transcript → LLM pipeline built.
5. **`lib/jobs/spotlight-repos.ts`** — GitHub spotlight pipeline built.
6. **DB schema** — added `tool_updates` and `repo_spotlights` tables; pushed to Neon.
7. **`app/spotlight/page.tsx`** — redesigned as unified feed combining tool_updates + repo_spotlights, sorted by publishedAt.
8. **`app/updates/[id]/page.tsx`** — new public detail page for tool update articles.
9. **Admin pages** for tool-updates and spotlights with publish/reject workflow.
10. **`lib/rankings.ts`** — fixed syntax error (two new rankings were placed outside the array closing bracket).
11. **YouTube API debugging** — moved debug endpoint to `/api/cron/debug-youtube` (outside admin middleware), confirmed API key works, quota was exceeded from test runs (recovers daily).
12. **Error logging** — `searchYouTube` now logs the specific API error reason (e.g. `quotaExceeded`) to Vercel logs instead of silently returning `[]`.
13. **`RepoItem` type** — added `whyTrending` field; passed through `loadHomepageData`; displayed on homepage trending cards.

## Pending / Next Steps

### High priority

1. **First tool-updates content batch**: YouTube quota resets daily. The next cron run (daily 07:00 UTC) should generate the first articles automatically. Check Vercel logs / admin panel after that run.

2. **Delete debug endpoint** after confirming pipeline works end-to-end:
   - File: `app/api/cron/debug-youtube/route.ts`

3. **`repo_spotlights` first batch**: trigger `/api/cron/repo-spotlight` manually (or wait for Monday cron) to generate the first GitHub spotlight articles.

4. **Admin review + publish**: once both pipelines produce drafts, review and publish from admin panel to populate the `/spotlight` feed.

### Medium priority

5. **`/news` hot events sidebar**: currently shows generic labels. Should show concrete event titles (high-hotness articles from last 3 days), not category labels like "模型发布".

6. **Tool detail pages** (`/tools/[slug]`): strengthen with Runway alternatives for Chinese users; add video scenario pages.

7. **Internal linking**: improve auto-linking across tool pages, comparison pages, alternatives, and spotlight articles.

8. **`YOUTUBE_API_KEY` in `.env.local`**: not set locally. Add it for local development testing (get from Google Cloud Console, project `aiboxpro`).

### Deferred (from previous sprint, still valid)

9. **VerdictBlock component** (`components/VerdictBlock.tsx`) + tool detail page integration. Schema (`tool_verdicts`) already exists; component and admin routes not yet built.

10. **M1 Week 2 draft pipeline** (comparisonDrafts, sceneDrafts, etc.) — see original HANDOFF for spec. Lower priority than content pipelines above.

## Useful Commands

```bash
npm run dev
npm run lint
npm run build
npm run db:push
npm run db:studio

# Trending pipeline
npm run fetch:trending
npm run translate:trending
npm run enhance:trending -- today
npm run enhance:trending -- week

# Article pipeline
npm run fetch:articles
npm run process:articles

# Manual cron triggers (use CRON_SECRET from .env.local)
curl -H "Authorization: Bearer <CRON_SECRET>" https://www.aiboxpro.cn/api/cron/tool-updates
curl -H "Authorization: Bearer <CRON_SECRET>" https://www.aiboxpro.cn/api/cron/repo-spotlight
curl -H "Authorization: Bearer <CRON_SECRET>" https://www.aiboxpro.cn/api/cron/debug-youtube
```

## Coordination Notes

- Follow `CLAUDE.md`: keep changes surgical, verify with `lint` + `build` after every code change.
- Do NOT run `npm run db:seed` casually — it clears and re-inserts seed rows.
- `middleware.ts` intercepts `/admin/:path*` and `/api/admin/:path*`. New API routes that use `CRON_SECRET` auth should live under `/api/cron/`, not `/api/admin/`.
- Human reviews and publishes all drafted content — do not auto-publish.
- Do not publish roadmap copy ("稍后会补", "即将上线") in production-facing pages.
- `lib/data.ts` static data is only used as a fallback when DB is unavailable.
- The 5 verdict few-shot examples (`prompts/tool-verdict/examples/*.md`) define brand voice — do not modify without owner sign-off.
- `UI/**` contains older prototypes, treat as design reference only.
