import { db } from '@/lib/db';
import { githubTrending } from '@/lib/db/schema';
import { upsertToolCandidates } from '@/lib/db/queries';
import { desc, eq } from 'drizzle-orm';

type DiscoveryResult = {
  source: string;
  fetched: number;
  error?: string;
};

type HnHit = {
  title?: string;
  url?: string;
  objectID?: string;
  points?: number;
};

const AI_RE = /\b(ai|agent|llm|gpt|claude|openai|model|copilot|rag|machine learning|neural)\b/i;
const GH_EXCLUDED_LANGS = new Set(['HTML', 'CSS', 'Shell']);

function cleanTitle(title: string) {
  const candidate = title
    .replace(/^Show HN:\s*/i, '')
    .replace(/^Launch HN:\s*/i, '')
    .trim();

  const rawName = candidate.split(/\s*(?:[:|]|[–—]| - )\s*/u)[0]?.trim() ?? '';
  if (!rawName || rawName.length > 30) return null;
  if (!/^[A-Za-z0-9._-]{1,30}$/.test(rawName)) return null;

  return rawName;
}

function hnUrl(hit: HnHit) {
  if (hit.url) return hit.url;
  return hit.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : '';
}

export async function fetchHackerNewsToolCandidates(limit = 20): Promise<DiscoveryResult> {
  try {
    const query = encodeURIComponent('(Show HN OR Launch HN) AI');
    const res = await fetch(`https://hn.algolia.com/api/v1/search_by_date?query=${query}&tags=story&hitsPerPage=${limit}`, {
      headers: { 'User-Agent': 'AiToolsBox/1.0 tool discovery' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { hits?: HnHit[] };
    const candidates = (data.hits ?? [])
      .filter((hit) => hit.title && AI_RE.test(hit.title))
      .map((hit) => {
        const name = cleanTitle(hit.title!);
        const url = hnUrl(hit);
        if (!name || !url) return null;

        return {
          name,
          url,
          description: `${hit.title}${hit.points ? ` - ${hit.points} HN points` : ''}`,
          sourceName: 'Hacker News AI',
          sourceType: 'hn',
          votes: hit.points ?? 0,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const inserted = await upsertToolCandidates(candidates);
    return { source: 'Hacker News AI', fetched: inserted };
  } catch (err) {
    return { source: 'Hacker News AI', fetched: 0, error: String(err) };
  }
}

export async function fetchGithubTrendingToolCandidates(limit = 20): Promise<DiscoveryResult> {
  try {
    const rows = await db
      .select()
      .from(githubTrending)
      .where(eq(githubTrending.period, 'week'))
      .orderBy(desc(githubTrending.gained))
      .limit(limit);

    const candidates = rows
      .filter((repo) => {
        const haystack = `${repo.repo} ${repo.description} ${repo.descriptionZh ?? ''}`;
        return AI_RE.test(haystack) && !GH_EXCLUDED_LANGS.has(repo.lang);
      })
      .map((repo) => {
        const name = repo.repo.split('/').pop() ?? repo.repo;
        return {
          name,
          url: `https://github.com/${repo.repo}`,
          description: `${repo.description} - GitHub +${repo.gained.toLocaleString()} stars/week - ${repo.lang}`,
          sourceName: 'GitHub Trending AI',
          sourceType: 'github',
          votes: repo.gained,
        };
      });

    const inserted = await upsertToolCandidates(candidates);
    return { source: 'GitHub Trending AI', fetched: inserted };
  } catch (err) {
    return { source: 'GitHub Trending AI', fetched: 0, error: String(err) };
  }
}

export async function discoverToolSignals(): Promise<DiscoveryResult[]> {
  return Promise.all([
    fetchHackerNewsToolCandidates(),
    fetchGithubTrendingToolCandidates(),
  ]);
}
