import { load } from 'cheerio';
import { db } from '@/lib/db';
import { sources } from '@/lib/db/schema';
import { loadSources, upsertToolCandidates } from '@/lib/db/queries';

const BASE = 'https://ai-bot.cn';
const SITEMAP = `${BASE}/sitemap.xml`;
const ROBOTS = `${BASE}/robots.txt`;
const UA = 'AIBoxPro-Crawler/1.0 (https://aiboxpro.cn; respectful)';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 200;

type Result = {
  source: string;
  fetched: number;
  skipped: number;
  failed: number;
  stopped?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function respectfulFetch(url: string) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(30_000),
  });
  if (res.status === 429 || res.status === 503) {
    await sleep(3_000);
  }
  return res;
}

function parseRobots(robots: string) {
  const disallows: string[] = [];
  let applies = false;

  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.split('#')[0].trim();
    if (!line) continue;
    const [key, ...rest] = line.split(':');
    const value = rest.join(':').trim();
    if (/^user-agent$/i.test(key)) {
      applies = value === '*' || UA.toLowerCase().includes(value.toLowerCase());
      continue;
    }
    if (applies && /^disallow$/i.test(key) && value) {
      disallows.push(value);
    }
  }

  return (url: string) => {
    const path = new URL(url).pathname;
    return disallows.some((rule) => rule !== '/' && path.startsWith(rule));
  };
}

function parseSitemap(xml: string) {
  const $ = load(xml, { xmlMode: true });
  return $('loc')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((url) => /^https:\/\/ai-bot\.cn\/sites\/\d+\.html$/.test(url));
}

function cleanName(name: string) {
  return name.trim().replace(/\s+/g, ' ').slice(0, 80);
}

function externalUrl(url: string | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith('ai-bot.cn')) return null;
    parsed.searchParams.delete('utm_source');
    parsed.searchParams.delete('utm_medium');
    parsed.searchParams.delete('utm_campaign');
    parsed.searchParams.delete('utm_content');
    parsed.searchParams.delete('utm_term');
    return parsed.toString();
  } catch {
    return null;
  }
}

function parseToolPage(html: string) {
  const $ = load(html);
  const name = cleanName($('.site-name').first().text() || $('h1').first().text());
  const url = externalUrl($('.site-go-url a[href]').first().attr('href'));
  const category = $('.btn-cat').first().text().trim();
  const likesText = $('.like-count').first().text().trim();
  const likes = Number.parseInt(likesText.replace(/[^\d]/g, ''), 10);

  if (!name || !url) return null;

  return {
    name,
    url,
    description: category ? `${name} - ${category}` : name,
    sourceName: 'ai-bot.cn',
    sourceType: 'aibot',
    votes: Number.isFinite(likes) ? likes : 0,
    aibotLikes: Number.isFinite(likes) ? likes : 0,
    hotnessScore: Number.isFinite(likes) ? Math.round(likes * 0.5) : undefined,
  };
}

async function ensureAibotSource() {
  await db
    .insert(sources)
    .values({
      name: 'ai-bot.cn sitemap',
      url: BASE,
      feedUrl: SITEMAP,
      type: 'aibot',
      lang: 'zh',
      active: true,
    })
    .onConflictDoNothing();
}

export async function fetchAibotSitemapCandidates(limit = DEFAULT_LIMIT): Promise<Result> {
  await ensureAibotSource();
  const active = await loadSources('aibot');
  if (active.length === 0) {
    return { source: 'ai-bot.cn', fetched: 0, skipped: 0, failed: 0, stopped: 'source inactive' };
  }

  const capped = Math.min(Math.max(limit, 1), MAX_LIMIT);
  const robotsRes = await respectfulFetch(ROBOTS);
  if (!robotsRes.ok) throw new Error(`robots.txt HTTP ${robotsRes.status}`);
  const isDisallowed = parseRobots(await robotsRes.text());
  if (isDisallowed(SITEMAP)) {
    return { source: 'ai-bot.cn', fetched: 0, skipped: 0, failed: 0, stopped: 'sitemap disallowed by robots.txt' };
  }

  const sitemapRes = await respectfulFetch(SITEMAP);
  if (!sitemapRes.ok) throw new Error(`sitemap HTTP ${sitemapRes.status}`);
  const urls = parseSitemap(await sitemapRes.text()).filter((url) => !isDisallowed(url)).slice(0, capped);

  let fetched = 0;
  let skipped = 0;
  let failed = 0;
  let consecutiveFailures = 0;

  for (const url of urls) {
    await sleep(1_000);
    try {
      const res = await respectfulFetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const candidate = parseToolPage(await res.text());
      if (!candidate) {
        skipped++;
        continue;
      }
      fetched += await upsertToolCandidates([candidate]);
      consecutiveFailures = 0;
    } catch {
      failed++;
      consecutiveFailures++;
      if (consecutiveFailures >= 5) {
        return { source: 'ai-bot.cn', fetched, skipped, failed, stopped: '5 consecutive failures' };
      }
    }
  }

  return { source: 'ai-bot.cn', fetched, skipped, failed };
}

export { UA as AIBOT_USER_AGENT };
