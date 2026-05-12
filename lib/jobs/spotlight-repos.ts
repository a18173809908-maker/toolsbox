/**
 * GitHub Repo Spotlight pipeline
 *
 * Weekly: take top 3 repos from github_trending (period='week'),
 * fetch GitHub README + optional YouTube/Serper results,
 * synthesise a Chinese article via LLM, insert into repo_spotlights as ai_drafted.
 *
 * Env vars:
 *   YOUTUBE_API_KEY  — optional, YouTube Data API v3
 *   SERPER_API_KEY   — optional, Serper.dev web search
 */

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { githubTrending, repoSpotlights } from '@/lib/db/schema';
import { chat } from '@/lib/llm';

const TOP_N = 3;

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Returns 'YYYY-WW' ISO week string for a given date */
function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function extractJson(s: string): string | null {
  const fenced = s.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fenced) return fenced[1];
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) return s.slice(start, end + 1);
  return null;
}

// ─── data fetchers ─────────────────────────────────────────────────────────

async function fetchGithubReadme(repo: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/readme`, {
      headers: { Accept: 'application/vnd.github.raw+json', 'User-Agent': 'aiboxpro-bot/1.0' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    // Trim to first 4000 chars to avoid huge prompts
    return text.slice(0, 4000);
  } catch {
    return null;
  }
}

type YoutubeResult = { title: string; description: string; videoId: string };

async function fetchYoutubeResults(query: string): Promise<YoutubeResult[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '5');
    url.searchParams.set('relevanceLanguage', 'zh');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('key', key);
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return [];
    const data = await res.json() as { items?: { id: { videoId: string }; snippet: { title: string; description: string } }[] };
    return (data.items ?? []).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description.slice(0, 200),
    }));
  } catch {
    return [];
  }
}

type SearchResult = { title: string; snippet: string; url: string };

async function fetchSerperResults(query: string): Promise<SearchResult[]> {
  const key = process.env.SERPER_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 5, hl: 'zh-cn' }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { organic?: { title: string; snippet: string; link: string }[] };
    return (data.organic ?? []).slice(0, 5).map((r) => ({
      title: r.title,
      snippet: r.snippet?.slice(0, 200) ?? '',
      url: r.link,
    }));
  } catch {
    return [];
  }
}

// ─── synthesis ────────────────────────────────────────────────────────────────

type SpotlightDraft = {
  titleZh: string;
  body: string;
};

async function synthesizeSpotlight(
  repo: string,
  trendingRow: {
    description: string;
    descriptionZh: string | null;
    gained: number;
    stars: number;
    lang: string;
    aiInsights: Record<string, unknown> | null;
  },
  readme: string | null,
  youtubeResults: YoutubeResult[],
  searchResults: SearchResult[],
): Promise<SpotlightDraft | null> {
  const [, repoName] = repo.split('/');

  const ytSection = youtubeResults.length > 0
    ? `\n## YouTube 相关视频标题（参考社区视角）\n` +
      youtubeResults.map((v) => `- ${v.title}: ${v.description}`).join('\n')
    : '';

  const searchSection = searchResults.length > 0
    ? `\n## 网络讨论摘要（参考）\n` +
      searchResults.map((r) => `- ${r.title}: ${r.snippet}`).join('\n')
    : '';

  const insightsSection = trendingRow.aiInsights
    ? `\n## 已有 AI 分析\n${JSON.stringify(trendingRow.aiInsights, null, 2)}`
    : '';

  const readmeSection = readme ? `\n## README（前4000字）\n${readme}` : '';

  const prompt = `你是一位为中文 AI 工具社区写作的编辑。请为 GitHub 热门项目写一篇结构清晰的中文 Spotlight 文章（Markdown 格式）。

**核心要求**：
- 只介绍这个仓库本身能做什么、用来干什么，不要虚构功能
- 用具体用法和场景，不要空泛的"改变未来"等表述
- 如果有 YouTube/社区讨论内容，提炼出真实的使用场景，注明"来自社区讨论"
- 不要生成虚假的性能数据或使用数量
- 如果不确定某事，说"根据描述"或省略

**输出 JSON 格式**（只返回 JSON，不要 markdown 包装）：
{
  "titleZh": "中文标题，不超过30字，点明项目做什么",
  "body": "完整 Markdown 文章内容"
}

**Markdown 文章结构**：
# {titleZh}

> 一句话简介

## 这是什么

（2-3段，说清楚项目解决什么问题，核心功能是什么）

## 能用来做什么

（2-4个具体使用场景，带示例或命令行示例，来自 README）

## 社区怎么用

（如果有 YouTube/搜索结果，总结真实使用场景；没有则省略此节）

## 国内开发者参考

（访问限制、替代方案、与国内工具对比，实事求是）

## 快速上手

（从 README 提取安装/启动命令，1-5行代码）

---

**项目信息**：
Repo: ${repo}
Stars: ${trendingRow.stars.toLocaleString()}，本周新增: ${trendingRow.gained.toLocaleString()}
语言: ${trendingRow.lang}
英文描述: ${trendingRow.description}
中文描述: ${trendingRow.descriptionZh ?? '无'}
${insightsSection}${readmeSection}${ytSection}${searchSection}`;

  try {
    const raw = await chat([{ role: 'user', content: prompt }], { maxTokens: 2000, tier: 'premium' });
    const jsonStr = extractJson(raw);
    if (!jsonStr) return null;
    const parsed = JSON.parse(jsonStr) as Partial<SpotlightDraft>;
    if (!parsed.titleZh || !parsed.body) return null;
    return {
      titleZh: String(parsed.titleZh).trim().slice(0, 60),
      body: String(parsed.body).trim(),
    };
  } catch {
    return null;
  }
}

// ─── main job ─────────────────────────────────────────────────────────────────

export async function generateRepoSpotlights(): Promise<{
  generated: number;
  skipped: number;
  errors: string[];
}> {
  const currentWeek = isoWeek(new Date());

  // Get top N weekly repos
  const topRepos = await db
    .select()
    .from(githubTrending)
    .where(eq(githubTrending.period, 'week'))
    .orderBy(desc(githubTrending.gained))
    .limit(TOP_N);

  if (topRepos.length === 0) return { generated: 0, skipped: 0, errors: ['No weekly trending repos found'] };

  let generated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < topRepos.length; i++) {
    const row = topRepos[i];

    // Check if spotlight already exists for this week + repo
    const existing = await db
      .select({ id: repoSpotlights.id })
      .from(repoSpotlights)
      .where(and(eq(repoSpotlights.snapshotWeek, currentWeek), eq(repoSpotlights.repo, row.repo)))
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    // Fetch enrichment data in parallel
    const searchQuery = `${row.repo.split('/')[1]} github tutorial how to use`;
    const [readme, youtubeResults, searchResults] = await Promise.all([
      fetchGithubReadme(row.repo),
      fetchYoutubeResults(searchQuery),
      fetchSerperResults(searchQuery),
    ]);

    const draft = await synthesizeSpotlight(
      row.repo,
      {
        description: row.description,
        descriptionZh: row.descriptionZh,
        gained: row.gained,
        stars: row.stars,
        lang: row.lang,
        aiInsights: row.aiInsights as Record<string, unknown> | null,
      },
      readme,
      youtubeResults,
      searchResults,
    );

    if (!draft) {
      errors.push(`Failed to synthesize spotlight for ${row.repo}`);
      continue;
    }

    await db.insert(repoSpotlights).values({
      trendingId: row.id,
      repo: row.repo,
      snapshotWeek: currentWeek,
      rankInWeek: i + 1,
      youtubeResults: youtubeResults.length > 0 ? youtubeResults : null,
      searchResults: searchResults.length > 0 ? searchResults : null,
      titleZh: draft.titleZh,
      body: draft.body,
      status: 'ai_drafted',
    });

    generated++;
  }

  return { generated, skipped, errors };
}
