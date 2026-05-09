import { load } from 'cheerio';
import { db } from '@/lib/db';
import { articles, sources } from '@/lib/db/schema';
import { and, eq, inArray } from 'drizzle-orm';

type FeedItem = {
  title: string;
  url: string;
  description?: string;
};

function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('f');
    return parsed.toString();
  } catch {
    return url;
  }
}

function parseRss(xml: string): FeedItem[] {
  const $ = load(xml, { xmlMode: true });
  const items: FeedItem[] = [];
  $('item').each((_, el) => {
    const title = $(el).children('title').text().trim();
    const url = $(el).children('link').text().trim() || $(el).children('guid').text().trim();
    const description = $(el).children('description').text().trim();
    if (title && url) items.push({ title, url, description });
  });
  return items;
}

function hasMojibake(value: string | null | undefined) {
  if (!value) return false;
  return /[\uFFFD锟]|(骞|鍥|藉|唴|鐨|绉|戞|棰|滃|彂|搴|氱|洰|瀛|竴|粡|妧|満|瀹|炴|嬭|槸|粨|璧)/.test(value);
}

async function main() {
  const sourceRows = await db
    .select()
    .from(sources)
    .where(eq(sources.name, '36氪 AI'))
    .limit(1);
  const source = sourceRows[0];
  if (!source) throw new Error('找不到 36氪 AI source');

  const res = await fetch(source.feedUrl, {
    headers: { 'User-Agent': 'AIBoxPro/1.0 RSS repair' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`36氪 feed 请求失败: HTTP ${res.status}`);

  const xml = new TextDecoder('utf-8').decode(await res.arrayBuffer());
  const feedByUrl = new Map(parseRss(xml).map((item) => [normalizeUrl(item.url), item]));

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      titleZh: articles.titleZh,
      summaryZh: articles.summaryZh,
      url: articles.url,
    })
    .from(articles)
    .where(and(eq(articles.sourceId, source.id), eq(articles.status, 'published')));

  let repaired = 0;
  const hideIds: number[] = [];

  for (const row of rows) {
    if (!hasMojibake(row.title) && !hasMojibake(row.titleZh) && !hasMojibake(row.summaryZh)) continue;

    const feedItem = feedByUrl.get(normalizeUrl(row.url));
    if (feedItem && !hasMojibake(feedItem.title)) {
      await db.update(articles).set({
        title: feedItem.title,
        titleZh: feedItem.title,
      }).where(eq(articles.id, row.id));
      repaired++;
      continue;
    }

    hideIds.push(row.id);
  }

  let hidden = 0;
  if (hideIds.length > 0) {
    const result = await db
      .update(articles)
      .set({ status: 'hidden' })
      .where(inArray(articles.id, hideIds));
    hidden = result.rowCount ?? hideIds.length;
  }

  console.log(`36氪修复完成：修复 ${repaired} 条，隐藏 ${hidden} 条`);
}

main().catch((error) => {
  console.error('修复 36氪资讯失败:', error);
  process.exit(1);
});
