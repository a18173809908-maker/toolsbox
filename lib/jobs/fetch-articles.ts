import { load } from 'cheerio';
import { loadSources, upsertArticles } from '@/lib/db/queries';

interface ParsedItem {
  title: string;
  url: string;
  description?: string;
  categories?: string[];
  publishedAt?: Date;
}

const AI_NEWS_RE = /(AI|AIGC|AGI|LLM|GPT|OpenAI|ChatGPT|Claude|DeepSeek|Kimi|Gemini|Sora|Copilot|Agent|人工智能|大模型|多模态|生成式|智能体|机器人|自动驾驶|算力|芯片|推理|训练|深度学习|机器学习|神经网络)/i;
const AI_NATIVE_FEEDS = new Set([
  'https://www.jiqizhixin.com/rss',
  'https://www.qbitai.com/feed',
]);

function parseRss(xml: string): ParsedItem[] {
  const $ = load(xml, { xmlMode: true });
  const items: ParsedItem[] = [];

  // RSS 2.0
  $('item').each((_, el) => {
    const title = $(el).children('title').text().trim();
    const link  = $(el).children('link').text().trim() || $(el).children('guid').text().trim();
    const pubDate = $(el).children('pubDate').text().trim();
    const description = $(el).children('description').text().trim();
    const categories = $(el).children('category').map((_, cat) => $(cat).text().trim()).get();
    if (title && link) {
      items.push({ title, url: link, description, categories, publishedAt: pubDate ? new Date(pubDate) : undefined });
    }
  });

  // Atom
  if (items.length === 0) {
    $('entry').each((_, el) => {
      const title = $(el).children('title').text().trim();
      const link  = $(el).children('link').attr('href') ?? $(el).children('link').text().trim();
      const published = $(el).children('published').text().trim() || $(el).children('updated').text().trim();
      const description = $(el).children('summary').text().trim() || $(el).children('content').text().trim();
      const categories = $(el).children('category').map((_, cat) => $(cat).attr('term') ?? $(cat).text().trim()).get();
      if (title && link) {
        items.push({ title, url: link, description, categories, publishedAt: published ? new Date(published) : undefined });
      }
    });
  }

  return items;
}

function decodeFeed(buffer: ArrayBuffer, contentType: string | null) {
  const bytes = new Uint8Array(buffer);
  const declared = contentType?.match(/charset=([^;]+)/i)?.[1]?.trim().toLowerCase();
  const firstPass = new TextDecoder(declared || 'utf-8').decode(bytes);
  const xmlDeclared = firstPass.match(/<\?xml[^>]+encoding=["']([^"']+)["']/i)?.[1]?.toLowerCase();
  const charset = xmlDeclared || declared;

  if (charset === 'utf-8' || charset === 'utf8') {
    return firstPass;
  }

  if (charset && charset !== 'utf-8' && charset !== 'utf8') {
    try {
      return new TextDecoder(charset).decode(bytes);
    } catch {
      return firstPass;
    }
  }

  const replacementCount = (firstPass.match(/\uFFFD/g) ?? []).length;
  if (replacementCount > 3) {
    try {
      return new TextDecoder('gb18030').decode(bytes);
    } catch {
      return firstPass;
    }
  }

  return firstPass;
}

function shouldKeepItem(src: { lang: string; feedUrl: string }, item: ParsedItem) {
  if (src.lang !== 'zh' || AI_NATIVE_FEEDS.has(src.feedUrl)) return true;
  const haystack = [item.title, item.description, ...(item.categories ?? [])].filter(Boolean).join(' ');
  return AI_NEWS_RE.test(haystack);
}

export async function fetchAllArticles(): Promise<{ source: string; fetched: number; error?: string }[]> {
  const srcs = await loadSources();
  const results: { source: string; fetched: number; error?: string }[] = [];

  for (const src of srcs) {
    try {
      const res = await fetch(src.feedUrl, {
        headers: { 'User-Agent': 'AIBoxPro/1.0 RSS reader' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = decodeFeed(await res.arrayBuffer(), res.headers.get('content-type'));
      const items = parseRss(xml).filter((it) => shouldKeepItem(src, it)).slice(0, 30); // cap per source

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
