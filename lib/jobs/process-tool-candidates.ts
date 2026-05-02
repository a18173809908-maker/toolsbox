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
  registerMethod?: string[];
  needsOverseasPhone?: boolean;
  needsRealName?: boolean;
  overseasPaymentOnly?: boolean;
  priceCny?: string;
  miniProgram?: string;
  appStoreCn?: boolean;
  publicAccount?: string;
  cnAlternatives?: string[];
  tutorialLinks?: { platform: string; url: string; title: string }[];
}

const NEWS_PATTERNS = [
  /digest/i, /newsletter/i, /\bdaily\b/i, /\bweekly\b/i, /\bmonthly\b/i,
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /issue\s*#?\d+/i,
  /vol\.?\s*\d+/i,
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

function boolOrFalse(value: unknown) {
  return typeof value === 'boolean' ? value : false;
}

async function enrichCandidate(input: { name: string; description?: string }): Promise<ToolAiResult | null> {
  const prompt = `你是面向中国用户的 AI 工具目录编辑。先判断候选是否是具体 AI 产品/工具。
如果它只是新闻、博客文章、榜单、咨询服务、招聘信息，或与 AI 无关，只返回 {"isTool":false}。

如果是有效 AI 工具，返回严格 JSON：
- "isTool": true
- "zh": 一句中文简介，不超过 55 字，说明这个工具能做什么
- "catId": 只能选一个：${CATEGORY_IDS.join(', ')}
- "pricing": 只能是 Free, Freemium, Paid；不确定用 Freemium
- "chinaAccess": 只能是 accessible, vpn-required, blocked, unknown；不确定用 unknown
- "features": 2 到 4 个中文功能点，每个不超过 10 字
- "howToUse": 3 到 4 个步骤，教用户如何开始使用，每步不超过 30 字
- "faqs": 2 到 3 个常见问题，每个对象含 "q" 和 "a"
- "registerMethod": 注册方式数组，例如 ["邮箱"]、["手机号","微信扫码"]；不确定返回 []
- "needsOverseasPhone": 是否需要海外手机号
- "needsRealName": 是否需要实名认证
- "overseasPaymentOnly": 是否仅支持海外信用卡或 PayPal
- "priceCny": 面向中国用户的人民币价格说明；不确定用空字符串
- "miniProgram": 微信小程序名称；没有或不确定用空字符串
- "appStoreCn": 是否上架中国区 App Store
- "publicAccount": 官方微信公众号；没有或不确定用空字符串
- "cnAlternatives": 国产替代工具 slug 数组，最多 3 个；国际对话工具优先推荐 doubao/kimi/deepseek，其他不确定返回 []
- "tutorialLinks": 国内教程资源数组，最多 2 个；不确定返回 []

只返回 JSON，不要 markdown。
工具名：${input.name}
描述：${input.description || input.name}`;

  try {
    const raw = await chat([{ role: 'user', content: prompt }], { temperature: 0.1, maxTokens: 900 });
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
      registerMethod: Array.isArray(parsed.registerMethod) ? parsed.registerMethod.slice(0, 4).map(String) : undefined,
      needsOverseasPhone: boolOrFalse(parsed.needsOverseasPhone),
      needsRealName: boolOrFalse(parsed.needsRealName),
      overseasPaymentOnly: boolOrFalse(parsed.overseasPaymentOnly),
      priceCny: parsed.priceCny ? String(parsed.priceCny).trim() : undefined,
      miniProgram: parsed.miniProgram ? String(parsed.miniProgram).trim() : undefined,
      appStoreCn: boolOrFalse(parsed.appStoreCn),
      publicAccount: parsed.publicAccount ? String(parsed.publicAccount).trim() : undefined,
      cnAlternatives: Array.isArray(parsed.cnAlternatives) ? parsed.cnAlternatives.slice(0, 3).map(String) : undefined,
      tutorialLinks: Array.isArray(parsed.tutorialLinks)
        ? parsed.tutorialLinks.slice(0, 2).filter((t) => t?.platform && t?.url && t?.title).map((t) => ({
          platform: String(t.platform),
          url: String(t.url),
          title: String(t.title),
        }))
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
    if (candidate.hotnessScore !== null && candidate.hotnessScore < 5) {
      await markToolCandidateRejected(candidate.id);
      rejected++;
      continue;
    }

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
        registerMethod: enriched.registerMethod,
        needsOverseasPhone: enriched.needsOverseasPhone,
        needsRealName: enriched.needsRealName,
        overseasPaymentOnly: enriched.overseasPaymentOnly,
        priceCny: enriched.priceCny,
        miniProgram: enriched.miniProgram,
        appStoreCn: enriched.appStoreCn,
        publicAccount: enriched.publicAccount,
        cnAlternatives: enriched.cnAlternatives,
        tutorialLinks: enriched.tutorialLinks,
      });
      processed++;
    } catch {
      await markToolCandidateRejected(candidate.id);
      rejected++;
    }
  }

  return { processed, rejected, skipped };
}
