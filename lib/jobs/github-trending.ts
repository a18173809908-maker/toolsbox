import * as cheerio from 'cheerio';
import type { TrendingPeriod } from '@/lib/data';

export type ScrapedRepo = {
  repo: string;
  description: string;
  lang: string;
  stars: number;
  gained: number;
};

const PERIOD_TO_SINCE: Record<TrendingPeriod, string> = {
  today: 'daily',
  week: 'weekly',
  month: 'monthly',
};

function parseInt0(s: string | undefined | null): number {
  if (!s) return 0;
  return parseInt(s.replace(/[,\s]/g, ''), 10) || 0;
}

export async function fetchTrending(period: TrendingPeriod): Promise<ScrapedRepo[]> {
  const url = `https://github.com/trending?since=${PERIOD_TO_SINCE[period]}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`github trending HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const out: ScrapedRepo[] = [];
  const articleCount = $('article.Box-row').length;
  if (articleCount === 0) {
    console.warn(`[github-trending] ${period}: no article.Box-row found, HTML length=${html.length}`);
  }
  $('article.Box-row').each((_, el) => {
    const $el = $(el);
    const href = $el.find('h2 a').attr('href')?.trim();
    if (!href) return;
    const repo = href.replace(/^\//, '');
    if (!repo.includes('/')) return;

    const description = $el.find('p').first().text().trim();
    const lang = $el.find('[itemprop="programmingLanguage"]').first().text().trim() || 'Unknown';
    const starsText = $el.find('a[href$="/stargazers"]').first().text().trim();
    const stars = parseInt0(starsText);
    const gainedText = $el.find('span.float-sm-right').last().text().trim();
    const gainedMatch = gainedText.match(/([\d,]+)\s+stars/);
    const gained = parseInt0(gainedMatch?.[1]);

    out.push({ repo, description, lang, stars, gained });
  });

  return out;
}
