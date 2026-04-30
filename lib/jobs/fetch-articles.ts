import { load } from 'cheerio';
import { loadSources, upsertArticles } from '@/lib/db/queries';

interface ParsedItem {
  title: string;
  url: string;
  publishedAt?: Date;
}

function parseRss(xml: string): ParsedItem[] {
  const $ = load(xml, { xmlMode: true });
  const items: ParsedItem[] = [];

  // RSS 2.0
  $('item').each((_, el) => {
    const title = $(el).children('title').text().trim();
    const link  = $(el).children('link').text().trim() || $(el).children('guid').text().trim();
    const pubDate = $(el).children('pubDate').text().trim();
    if (title && link) {
      items.push({ title, url: link, publishedAt: pubDate ? new Date(pubDate) : undefined });
    }
  });

  // Atom
  if (items.length === 0) {
    $('entry').each((_, el) => {
      const title = $(el).children('title').text().trim();
      const link  = $(el).children('link').attr('href') ?? $(el).children('link').text().trim();
      const published = $(el).children('published').text().trim() || $(el).children('updated').text().trim();
      if (title && link) {
        items.push({ title, url: link, publishedAt: published ? new Date(published) : undefined });
      }
    });
  }

  return items;
}

export async function fetchAllArticles(): Promise<{ source: string; fetched: number; error?: string }[]> {
  const srcs = await loadSources();
  const results: { source: string; fetched: number; error?: string }[] = [];

  for (const src of srcs) {
    try {
      const res = await fetch(src.feedUrl, {
        headers: { 'User-Agent': 'AiToolsBox/1.0 RSS reader' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const items = parseRss(xml).slice(0, 30); // cap per source

      const inserted = await upsertArticles(
        items.map((it) => ({
          sourceId: src.id,
          title: it.title,
          url: it.url,
          tag: src.name,
          publishedAt: it.publishedAt,
        })),
      );
      results.push({ source: src.name, fetched: inserted });
    } catch (err) {
      results.push({ source: src.name, fetched: 0, error: String(err) });
    }
  }

  return results;
}
