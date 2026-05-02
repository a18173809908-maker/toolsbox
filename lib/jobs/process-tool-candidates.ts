import { loadAllToolIds, loadPendingToolCandidates, markToolCandidateRejected, publishToolCandidate } from '@/lib/db/queries';
import { chat } from '@/lib/llm';

const BATCH = 6;
const CATEGORY_IDS = [
  'chatbot', 'image', 'video', 'audio', 'code', 'writing', 'productivity',
  'design', 'marketing', 'education', 'research', '3d', 'data', 'agent',
] as const;

type CategoryId = (typeof CATEGORY_IDS)[number];

interface ToolAiResult {
  isTool?: boolean;
  zh: string;
  catId: CategoryId;
  pricing: 'Free' | 'Freemium' | 'Paid';
  chinaAccess: 'accessible' | 'vpn-required' | 'blocked' | 'unknown';
  features?: string[];
  howToUse?: string[];
  faqs?: { q: string; a: string }[];
}

// Patterns that indicate an RSS item is a news article, not a tool
const NEWS_PATTERNS = [
  /digest/i, /newsletter/i, /\bdaily\b/i, /\bweekly\b/i, /\bmonthly\b/i,
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /issue\s*#?\d+/i,   // "Issue #42"
  /vol\.?\s*\d+/i,    // "Vol. 3"
  /roundup/i, /recap/i, /\bwrap[\s-]?up\b/i,
];

function looksLikeNews(name: string): boolean {
  return NEWS_PATTERNS.some((p) => p.test(name));
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'tool';
}

function extractJson(s: string): string | null {
  const fenced = s.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fenced) return fenced[1];
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) return s.slice(start, end + 1);
  return null;
}

async function enrichCandidate(input: { name: string; description?: string }): Promise<ToolAiResult | null> {
  const prompt = `你是中国用户视角的 AI 工具目录编辑。先判断候选是否是具体 AI 产品/工具。
如果它只是新闻、博客文章、榜单、咨询服务、招聘信息，或与 AI 无关，只返回 {"isTool":false}。
如果是有效 AI 工具，返回严格 JSON：
- "isTool": true
- "zh": 一句中文简介，不超过 55 字，说明这个工具能做什么
- "catId": 只能选一个：${CATEGORY_IDS.join(', ')}
- "pricing": 只能是 Free, Freemium, Paid；不确定用 Freemium
- "chinaAccess": 只能是 accessible, vpn-required, blocked, unknown；不确定用 unknown
- "features": 2 到 4 个中文功能点，每个不超过 10 字
- "howToUse": 3 到 4 个步骤，教用户如何开始使用，每步不超过 30 字
- "faqs": 2 到 3 个常见问题，每个对象含 "q"（问题）和 "a"（简短回答）

只返回 JSON，不要 markdown。

工具名：${input.name}
描述：${input.description || input.name}`;

  try {
    const raw = await chat([{ role: 'user', content: prompt }], { temperature: 0.1, maxTokens: 600 });
    const json = extractJson(raw);
    if (!json) return null;
    const parsed = JSON.parse(json) as ToolAiResult;
    if (parsed.isTool === false) return null;
    if (!parsed.zh || !CATEGORY_IDS.includes(parsed.catId) || !parsed.pricing || !parsed.chinaAccess) {
      return null;
    }
    return {
      zh: parsed.zh,
      catId: parsed.catId,
      pricing: parsed.pricing,
      chinaAccess: parsed.chinaAccess,
      features: Array.isArray(parsed.features) ? parsed.features.slice(0, 4).map(String) : undefined,
      howToUse: Array.isArray(parsed.howToUse) ? parsed.howToUse.slice(0, 4).map(String) : undefined,
      faqs: Array.isArray(parsed.faqs)
        ? parsed.faqs.slice(0, 3).filter((f) => f?.q && f?.a).map((f) => ({ q: String(f.q), a: String(f.a) }))
        : undefined,
    };
  } catch {
    return null;
  }
}

export async function processToolCandidates(): Promise<{ processed: number; rejected: number; skipped: number }> {
  const pending = await loadPendingToolCandidates(BATCH);
  const existingIds = new Set(await loadAllToolIds());
  let processed = 0;
  let rejected = 0;
  let skipped = 0;

  for (const candidate of pending) {
    // Reject news articles masquerading as tools
    if (looksLikeNews(candidate.name)) {
      await markToolCandidateRejected(candidate.id);
      rejected++;
      continue;
    }

    const enriched = await enrichCandidate({ name: candidate.name, description: candidate.description ?? undefined });
    if (!enriched) {
      skipped++;
      continue;
    }

    const baseSlug = slugify(candidate.name);
    const slug = existingIds.has(baseSlug) ? `${baseSlug}-${candidate.id}` : baseSlug;
    existingIds.add(slug);

    try {
      await publishToolCandidate(candidate.id, {
        slug,
        name: candidate.name.slice(0, 80),
        en: (candidate.description || candidate.name).slice(0, 240),
        zh: enriched.zh,
        catId: enriched.catId,
        pricing: enriched.pricing,
        url: candidate.url,
        chinaAccess: enriched.chinaAccess,
        features: enriched.features,
        howToUse: enriched.howToUse,
        faqs: enriched.faqs,
      });
      processed++;
    } catch {
      await markToolCandidateRejected(candidate.id);
      rejected++;
    }
  }

  return { processed, rejected, skipped };
}
