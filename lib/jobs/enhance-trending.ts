import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { githubTrending } from '@/lib/db/schema';
import { chat } from '@/lib/llm';

const BATCH = 12;

type TrendingInsights = {
  oneSentenceSummary: string;
  useCase: string;
  keyPoints: string[];
  whyTrending: string;
  audience: string[];
  projectType: string;
  maturity: string;
  chinaValue: string;
};

const PROJECT_TYPES = ['AI Agent', '开发工具', '模型/推理', '数据/基础设施', 'UI/应用', '研究项目', '其他'] as const;
const MATURITY = ['实验项目', '可试用', '生产可用', '企业级'] as const;

function extractJson(s: string): string | null {
  const fenced = s.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fenced) return fenced[1];
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) return s.slice(start, end + 1);
  return null;
}

function asStringArray(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) return fallback;
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 4);
}

function normalizeInsights(value: Partial<TrendingInsights> | undefined): TrendingInsights | null {
  if (!value?.oneSentenceSummary || !value.useCase || !value.whyTrending) return null;
  const projectType = PROJECT_TYPES.includes(value.projectType as (typeof PROJECT_TYPES)[number])
    ? String(value.projectType)
    : '其他';
  const maturity = MATURITY.includes(value.maturity as (typeof MATURITY)[number])
    ? String(value.maturity)
    : '可试用';

  return {
    oneSentenceSummary: String(value.oneSentenceSummary).trim().slice(0, 80),
    useCase: String(value.useCase).trim().slice(0, 120),
    keyPoints: asStringArray(value.keyPoints).slice(0, 3),
    whyTrending: String(value.whyTrending).trim().slice(0, 140),
    audience: asStringArray(value.audience, ['开发者']).slice(0, 3),
    projectType,
    maturity,
    chinaValue: String(value.chinaValue ?? '可作为同类开源项目或工具选型参考。').trim().slice(0, 140),
  };
}

async function buildInsights(row: {
  repo: string;
  description: string;
  descriptionZh: string | null;
  lang: string;
  stars: number;
  gained: number;
  period: string;
}): Promise<TrendingInsights | null> {
  const prompt = `你是 AI 开源趋势编辑。根据 GitHub Trending 项目信息，返回 JSON：
- "oneSentenceSummary": 一句中文说明这个项目解决什么问题，不超过 38 字
- "useCase": 适合什么使用场景，不超过 60 字
- "keyPoints": 3 条中文亮点，每条不超过 28 字
- "whyTrending": 为什么最近可能受关注，不超过 70 字；只能基于项目描述、语言、stars 增长做谨慎推断
- "audience": 2-3 个适合关注的人群
- "projectType": 只能选一个：${PROJECT_TYPES.join('、')}
- "maturity": 只能选一个：${MATURITY.join('、')}
- "chinaValue": 对中文/国内开发者的参考价值，不超过 70 字

只返回 JSON，不要 markdown。不要编造没有给出的事实。

Repo: ${row.repo}
English description: ${row.description}
Chinese description: ${row.descriptionZh ?? '无'}
Language: ${row.lang}
Stars: ${row.stars}
Gained stars (${row.period}): ${row.gained}`;

  try {
    const raw = await chat([{ role: 'user', content: prompt }], { maxTokens: 700 });
    const json = extractJson(raw);
    if (!json) return null;
    return normalizeInsights(JSON.parse(json) as Partial<TrendingInsights>);
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateTrendingWithRetry(id: number, insights: TrendingInsights, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      await db.update(githubTrending).set({ aiInsights: insights }).where(eq(githubTrending.id, id));
      return true;
    } catch {
      if (i === attempts - 1) return false;
      await sleep(750 * (i + 1));
    }
  }
  return false;
}

export async function enhanceTrending(period?: string): Promise<{ processed: number; skipped: number }> {
  const safePeriod = period && ['today', 'week', 'month'].includes(period) ? period : undefined;
  const where = safePeriod
    ? and(isNull(githubTrending.aiInsights), eq(githubTrending.period, safePeriod))
    : isNull(githubTrending.aiInsights);

  const rows = await db
    .select({
      id: githubTrending.id,
      repo: githubTrending.repo,
      description: githubTrending.description,
      descriptionZh: githubTrending.descriptionZh,
      lang: githubTrending.lang,
      stars: githubTrending.stars,
      gained: githubTrending.gained,
      period: githubTrending.period,
      snapshotDate: githubTrending.snapshotDate,
    })
    .from(githubTrending)
    .where(where)
    .orderBy(desc(githubTrending.snapshotDate), desc(githubTrending.gained))
    .limit(BATCH);

  let processed = 0;
  let skipped = 0;

  for (const row of rows) {
    const insights = await buildInsights(row);
    if (!insights) {
      skipped++;
      continue;
    }
    const updated = await updateTrendingWithRetry(row.id, insights);
    if (updated) processed++;
    else skipped++;
  }

  return { processed, skipped };
}
