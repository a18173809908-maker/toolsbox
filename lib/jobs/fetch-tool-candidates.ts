import { load } from 'cheerio';
import { loadSources, upsertToolCandidates } from '@/lib/db/queries';

interface ParsedToolItem {
  name: string;
  url: string;
  description?: string;
}

function parseToolFeed(xml: string): ParsedToolItem[] {
  const $ = load(xml, { xmlMode: true });
  const items: ParsedToolItem[] = [];

  $('item').each((_, el) => {
    const name = $(el).children('title').text().trim();
    const url = $(el).children('link').text().trim() || $(el).children('guid').text().trim();
    const description = $(el).children('description').text().replace(/\s+/g, ' ').trim();
    if (name && url) items.push({ name, url, description: description || undefined });
  });

  if (items.length === 0) {
    $('entry').each((_, el) => {
      const name = $(el).children('title').text().trim();
      const url = $(el).children('link').attr('href') ?? $(el).children('link').text().trim();
      const description = ($(el).children('summary').text() || $(el).children('content').text())
        .replace(/\s+/g, ' ')
        .trim();
      if (name && url) items.push({ name, url, description: description || undefined });
    });
  }

  return items;
}

export async function fetchToolCandidates(): Promise<{ source: string; fetched: number; error?: string }[]> {
  const srcs = await loadSources('tool');
  const results: { source: string; fetched: number; error?: string }[] = [];

  for (const src of srcs) {
    try {
      const res = await fetch(src.feedUrl, {
        headers: { 'User-Agent': 'AiToolsBox/1.0 tool discovery' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const items = parseToolFeed(xml).slice(0, 30);
      const inserted = await upsertToolCandidates(
        items.map((item) => ({
          ...item,
          sourceName: src.name,
        })),
      );
      results.push({ source: src.name, fetched: inserted });
    } catch (err) {
      results.push({ source: src.name, fetched: 0, error: String(err) });
    }
  }

  return results;
}
