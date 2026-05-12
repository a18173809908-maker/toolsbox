import { db } from '@/lib/db';
import { articles, sources, tools } from '@/lib/db/schema';
import { isNull, eq, and, or, desc } from 'drizzle-orm';
import { chat } from '@/lib/llm';
import { estimateArticleHotness } from '@/lib/article-hotness';
import { ARTICLE_CATEGORIES, normalizeArticleCategory, type ArticleCategory } from '@/lib/article-categories';

const BATCH = 10;

const TAGS = ARTICLE_CATEGORIES;
type ArticleTag = ArticleCategory;

interface EnAiResult {
  skip?: boolean;
  skipReason?: string;
  titleZh: string;
  summary: string;
  summaryZh: string;
  tag: ArticleTag;
  aiInsights: ArticleInsights;
}

interface ZhAiResult {
  skip?: boolean;
  skipReason?: string;
  summaryZh: string;
  tag: ArticleTag;
  aiInsights: ArticleInsights;
}

type ArticleInsights = {
  oneSentenceSummary: string;
  keyPoints: string[];
  whyItMatters: string;
  chinaImpact: string;
  whoShouldCare: string[];
  relatedToolNames: string[];
  relatedTools?: { id?: string; name: string; reason?: string }[];
};

type ToolBrief = {
  id: string;
  name: string;
  zh: string;
  en: string;
};

function extractJson(s: string): string | null {
  const fenced = s.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fenced) return fenced[1];
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) return s.slice(start, end + 1);
  return null;
}

function normalizeTag(tag: string | undefined): ArticleTag {
  return normalizeArticleCategory(tag);
}

function asStringArray(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) return fallback;
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 5);
}

function normalizeInsights(value: Partial<ArticleInsights> | undefined): ArticleInsights | null {
  if (!value?.oneSentenceSummary || !value.whyItMatters) return null;
  return {
    oneSentenceSummary: String(value.oneSentenceSummary).trim().slice(0, 90),
    keyPoints: asStringArray(value.keyPoints).slice(0, 4),
    whyItMatters: String(value.whyItMatters).trim().slice(0, 180),
    chinaImpact: String(value.chinaImpact ?? '暂无明确国内用户影响。').trim().slice(0, 180),
    whoShouldCare: asStringArray(value.whoShouldCare, ['AI 工具关注者']).slice(0, 4),
    relatedToolNames: asStringArray(value.relatedToolNames).slice(0, 6),
  };
}

function attachRelatedTools(insights: ArticleInsights, catalog: ToolBrief[], text: string): ArticleInsights {
  const haystack = text.toLowerCase();
  const wanted = new Set(insights.relatedToolNames.map((name) => name.toLowerCase()));
  const matched = catalog
    .filter((tool) => {
      const names = [tool.id, tool.name, tool.zh, tool.en].filter(Boolean).map((name) => name.toLowerCase());
      return names.some((name) => haystack.includes(name) || wanted.has(name));
    })
    .slice(0, 5)
    .map((tool) => ({ id: tool.id, name: tool.name, reason: '文章涉及该工具或同类能力。' }));

  if (matched.length === 0) return insights;
  return {
    ...insights,
    relatedTools: matched,
    relatedToolNames: Array.from(new Set([...insights.relatedToolNames, ...matched.map((tool) => tool.name)])).slice(0, 6),
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateArticleWithRetry(id: number, data: Partial<typeof articles.$inferInsert>, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      await db.update(articles).set(data).where(eq(articles.id, id));
      return true;
    } catch {
      if (i === attempts - 1) return false;
      await sleep(750 * (i + 1));
    }
  }
  return false;
}

async function processEnglish(title: string, summary: string | null, catalog: ToolBrief[]): Promise<EnAiResult | null> {
  const prompt = `You are a bilingual AI tech editor. Given an English AI/tech news headline, return JSON.

First decide: is this article substantive enough for AI tool users (not pure company finance, sports, or unrelated tech)? If not, return {"skip":true,"skipReason":"<one sentence>"}.

Otherwise return:
- "skip": false
- "titleZh": natural Simplified Chinese title translation, no more than 28 Chinese chars
- "summary": English summary in 1 sentence, no more than 120 chars
- "summaryZh": Simplified Chinese summary in 1 sentence, no more than 60 Chinese chars
- "tag": pick one exactly: ${TAGS.join(', ')}
- "aiInsights": {
  "oneSentenceSummary": one clear Simplified Chinese sentence, no more than 38 Chinese chars
  "keyPoints": 3 concise Simplified Chinese bullet strings, each no more than 32 Chinese chars
  "whyItMatters": why this matters for AI tool users, no more than 90 Chinese chars
  "chinaImpact": impact or limitation for Chinese users, no more than 90 Chinese chars
  "whoShouldCare": 2-4 user groups in Simplified Chinese
  "relatedToolNames": AI product/tool names mentioned or strongly related, max 5
}

Return ONLY valid JSON, no markdown.

Headline: ${title}
Existing summary: ${summary ?? 'N/A'}`;

  try {
    const raw = await chat([{ role: 'user', content: prompt }], { maxTokens: 700 });
    const json = extractJson(raw);
    if (!json) return null;
    const parsed = JSON.parse(json) as Partial<EnAiResult>;
    if (parsed.skip === true) return null;
    const aiInsights = normalizeInsights(parsed.aiInsights);
    if (!parsed.titleZh || !parsed.summary || !parsed.summaryZh || !aiInsights) return null;
    return {
      titleZh: String(parsed.titleZh).trim(),
      summary: String(parsed.summary).trim(),
      summaryZh: String(parsed.summaryZh).trim(),
      tag: normalizeTag(parsed.tag),
      aiInsights: attachRelatedTools(aiInsights, catalog, `${title} ${summary ?? ''}`),
    };
  } catch {
    return null;
  }
}

async function processChinese(title: string, summary: string | null, catalog: ToolBrief[]): Promise<ZhAiResult | null> {
  const prompt = `你是 AI 科技资讯编辑。根据下面的中文标题，返回 JSON。

首先判断：这篇文章对 AI 工具用户是否有实质价值（不是纯公司财报、体育、或与 AI 无关的科技内容）？
如果不值得处理，返回 {“skip”:true,”skipReason”:”<一句说明>”}。

否则返回：
- “skip”: false
- “summaryZh”: 一句中文摘要，不超过 60 字，直接可读，不要用”本文”开头
- “tag”: 只能选一个：${TAGS.join('、')}
- “aiInsights”: {
  “oneSentenceSummary”: 一句中文摘要，不超过 38 字
  “keyPoints”: 3 条中文要点，每条不超过 32 字
  “whyItMatters”: 为什么这件事值得 AI 工具用户关注，不超过 90 字
  “chinaImpact”: 对中文/国内用户的影响或限制，不超过 90 字
  “whoShouldCare”: 2-4 个适合关注的人群
  “relatedToolNames”: 文中提到或强相关的 AI 工具/产品名，最多 5 个
}

只返回 JSON，不要 markdown。
标题：${title}
已有摘要：${summary ?? '无'}`;

  try {
    const raw = await chat([{ role: 'user', content: prompt }], { maxTokens: 650 });
    const json = extractJson(raw);
    if (!json) return null;
    const parsed = JSON.parse(json) as Partial<ZhAiResult>;
    if (parsed.skip === true) return null;
    const aiInsights = normalizeInsights(parsed.aiInsights);
    if (!parsed.summaryZh || !aiInsights) return null;
    return {
      summaryZh: String(parsed.summaryZh).trim(),
      tag: normalizeTag(parsed.tag),
      aiInsights: attachRelatedTools(aiInsights, catalog, `${title} ${summary ?? ''}`),
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
      titleZh: articles.titleZh,
      summary: articles.summary,
      summaryZh: articles.summaryZh,
      tag: articles.tag,
      sourceName: sources.name,
      lang: sources.lang,
    })
    .from(articles)
    .leftJoin(sources, eq(articles.sourceId, sources.id))
    .where(and(eq(articles.status, 'published'), or(isNull(articles.titleZh), isNull(articles.aiInsights))))
    .orderBy(desc(articles.publishedAt), desc(articles.fetchedAt))
    .limit(BATCH);

  const catalog = await db
    .select({
      id: tools.id,
      name: tools.name,
      zh: tools.zh,
      en: tools.en,
    })
    .from(tools);

  let processed = 0;
  let skipped = 0;

  for (const art of pending) {
    if (art.lang === 'zh') {
      const result = await processChinese(art.title, art.summary, catalog);
      if (!result) {
        skipped++;
        continue;
      }
      const updated = await updateArticleWithRetry(art.id, {
        titleZh: art.titleZh ?? art.title,
        summaryZh: result.summaryZh,
        aiInsights: result.aiInsights,
        tag: result.tag,
        hotnessScore: estimateArticleHotness({
          title: art.title,
          titleZh: art.titleZh ?? art.title,
          summary: art.summary,
          summaryZh: result.summaryZh,
          tag: result.tag,
          sourceName: art.sourceName,
        }),
      });
      if (updated) processed++;
      else skipped++;
      continue;
    }

    const result = await processEnglish(art.title, art.summary, catalog);
    if (!result) {
      skipped++;
      continue;
    }
    const updated = await updateArticleWithRetry(art.id, {
      titleZh: art.titleZh ?? result.titleZh,
      summary: art.summary ?? result.summary,
      summaryZh: result.summaryZh,
      aiInsights: result.aiInsights,
      tag: result.tag,
      hotnessScore: estimateArticleHotness({
        title: art.title,
        titleZh: art.titleZh ?? result.titleZh,
        summary: art.summary ?? result.summary,
        summaryZh: result.summaryZh,
        tag: result.tag,
        sourceName: art.sourceName,
      }),
    });
    if (updated) processed++;
    else skipped++;
  }

  return { processed, skipped };
}
