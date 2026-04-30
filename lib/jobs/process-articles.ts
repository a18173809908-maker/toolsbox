import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { isNull, eq, and } from 'drizzle-orm';
import { chat } from '@/lib/llm';

const BATCH = 10;

interface AiResult {
  titleZh: string;
  summary: string;
  summaryZh: string;
}

async function processOne(title: string): Promise<AiResult | null> {
  const prompt = `You are a bilingual tech editor. Given an English AI/tech news headline, return a JSON object with:
- "titleZh": concise Chinese translation of the title (≤25 chars)
- "summary": English summary in 1-2 sentences (≤120 chars)
- "summaryZh": Chinese translation of the summary (≤60 chars)

Return ONLY valid JSON, no markdown.

Headline: ${title}`;

  try {
    const raw = await chat([{ role: 'user', content: prompt }], { maxTokens: 256 });
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as AiResult;
    if (!parsed.titleZh || !parsed.summary || !parsed.summaryZh) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function processArticles(): Promise<{ processed: number; skipped: number }> {
  // Articles missing translation
  const pending = await db
    .select({ id: articles.id, title: articles.title })
    .from(articles)
    .where(and(eq(articles.status, 'published'), isNull(articles.titleZh)))
    .limit(BATCH);

  let processed = 0;
  let skipped = 0;

  for (const art of pending) {
    const result = await processOne(art.title);
    if (result) {
      await db.update(articles).set({
        titleZh: result.titleZh,
        summary: result.summary,
        summaryZh: result.summaryZh,
      }).where(eq(articles.id, art.id));
      processed++;
    } else {
      skipped++;
    }
  }

  return { processed, skipped };
}
