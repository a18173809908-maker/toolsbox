import { db } from '@/lib/db';
import { articles, sources } from '@/lib/db/schema';
import { isNull, eq, and } from 'drizzle-orm';
import { chat } from '@/lib/llm';

const BATCH = 10;

const TAGS = ['模型发布', '工具更新', '行业动态', '技术研究', '开发者', '产品评测', '国内动态'] as const;
type ArticleTag = (typeof TAGS)[number];

interface EnAiResult {
  titleZh: string;
  summary: string;
  summaryZh: string;
  tag: ArticleTag;
}

interface ZhAiResult {
  summaryZh: string;
  tag: ArticleTag;
}

function extractJson(s: string): string | null {
  const fenced = s.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fenced) return fenced[1];
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) return s.slice(start, end + 1);
  return null;
}

function normalizeTag(tag: string | undefined): ArticleTag {
  return TAGS.includes(tag as ArticleTag) ? (tag as ArticleTag) : '行业动态';
}

async function processEnglish(title: string): Promise<EnAiResult | null> {
  const prompt = `You are a bilingual AI tech editor. Given an English AI/tech news headline, return JSON:
- "titleZh": natural Simplified Chinese title translation, no more than 28 Chinese chars
- "summary": English summary in 1 sentence, no more than 120 chars
- "summaryZh": Simplified Chinese summary in 1 sentence, no more than 60 Chinese chars
- "tag": pick one exactly: ${TAGS.join(', ')}

Return ONLY valid JSON, no markdown.

Headline: ${title}`;

  try {
    const raw = await chat([{ role: 'user', content: prompt }], { maxTokens: 320 });
    const json = extractJson(raw);
    if (!json) return null;
    const parsed = JSON.parse(json) as Partial<EnAiResult>;
    if (!parsed.titleZh || !parsed.summary || !parsed.summaryZh) return null;
    return {
      titleZh: String(parsed.titleZh).trim(),
      summary: String(parsed.summary).trim(),
      summaryZh: String(parsed.summaryZh).trim(),
      tag: normalizeTag(parsed.tag),
    };
  } catch {
    return null;
  }
}

async function processChinese(title: string): Promise<ZhAiResult | null> {
  const prompt = `你是 AI 科技资讯编辑。根据下面的中文标题，返回 JSON：
- "summaryZh": 一句中文摘要，不超过 60 字，直接可读，不要用“本文”开头
- "tag": 只能选一个：${TAGS.join('、')}

只返回 JSON，不要 markdown。

标题：${title}`;

  try {
    const raw = await chat([{ role: 'user', content: prompt }], { maxTokens: 220 });
    const json = extractJson(raw);
    if (!json) return null;
    const parsed = JSON.parse(json) as Partial<ZhAiResult>;
    if (!parsed.summaryZh) return null;
    return {
      summaryZh: String(parsed.summaryZh).trim(),
      tag: normalizeTag(parsed.tag),
    };
  } catch {
    return null;
  }
}

export async function processArticles(): Promise<{ processed: number; skipped: number }> {
  const pending = await db
    .select({
      id: articles.id,
      title: articles.title,
      lang: sources.lang,
    })
    .from(articles)
    .leftJoin(sources, eq(articles.sourceId, sources.id))
    .where(and(eq(articles.status, 'published'), isNull(articles.titleZh)))
    .limit(BATCH);

  let processed = 0;
  let skipped = 0;

  for (const art of pending) {
    if (art.lang === 'zh') {
      const result = await processChinese(art.title);
      if (!result) {
        skipped++;
        continue;
      }
      await db.update(articles).set({
        titleZh: art.title,
        summaryZh: result.summaryZh,
        tag: result.tag,
      }).where(eq(articles.id, art.id));
      processed++;
      continue;
    }

    const result = await processEnglish(art.title);
    if (!result) {
      skipped++;
      continue;
    }
    await db.update(articles).set({
      titleZh: result.titleZh,
      summary: result.summary,
      summaryZh: result.summaryZh,
      tag: result.tag,
    }).where(eq(articles.id, art.id));
    processed++;
  }

  return { processed, skipped };
}
