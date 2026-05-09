import { load as loadHtml } from 'cheerio';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sourceCandidates, sources } from '@/lib/db/schema';

type SeedSource = {
  name: string;
  url: string;
  feedUrl?: string;
  sourceCategory: 'aggregation' | 'vertical_media' | 'community_column' | 'official_source';
  lang: 'zh' | 'en';
  qualityScore: number;
  discoverySource?: string;
};

const AI_RE = /(AI|AIGC|AGI|LLM|GPT|OpenAI|ChatGPT|Claude|DeepSeek|Kimi|Gemini|Sora|Copilot|Agent|人工智能|大模型|多模态|生成式|智能体|开源|模型|推理|训练|AI 工具|AI工具)/i;
const TOOL_RE = /(工具|产品|发布|更新|教程|实战|开源|GitHub|Hugging Face|Agent|Copilot|Sora|Runway|可灵|即梦|DeepSeek|Kimi|ChatGPT|Claude)/i;

export const CURATED_SOURCE_SEEDS: SeedSource[] = [
  { name: '机器之心', url: 'https://www.jiqizhixin.com', feedUrl: 'https://www.jiqizhixin.com/rss', sourceCategory: 'vertical_media', lang: 'zh', qualityScore: 92 },
  { name: '量子位', url: 'https://www.qbitai.com', feedUrl: 'https://www.qbitai.com/feed', sourceCategory: 'vertical_media', lang: 'zh', qualityScore: 90 },
  { name: 'InfoQ 中文 AI', url: 'https://www.infoq.cn', feedUrl: 'https://www.infoq.cn/feed.xml', sourceCategory: 'vertical_media', lang: 'zh', qualityScore: 86 },
  { name: '智东西', url: 'https://zhidx.com', sourceCategory: 'vertical_media', lang: 'zh', qualityScore: 82 },
  { name: '新智元', url: 'https://www.aixinzhijie.com', sourceCategory: 'vertical_media', lang: 'zh', qualityScore: 80 },
  { name: '甲子光年', url: 'https://www.jazzyear.com', sourceCategory: 'vertical_media', lang: 'zh', qualityScore: 78 },
  { name: '爱范儿', url: 'https://www.ifanr.com', sourceCategory: 'vertical_media', lang: 'zh', qualityScore: 74 },
  { name: '极客公园', url: 'https://www.geekpark.net', sourceCategory: 'vertical_media', lang: 'zh', qualityScore: 74 },
  { name: '阿里云开发者', url: 'https://developer.aliyun.com', sourceCategory: 'community_column', lang: 'zh', qualityScore: 78 },
  { name: 'ModelScope 魔搭社区', url: 'https://modelscope.cn', sourceCategory: 'community_column', lang: 'zh', qualityScore: 82 },
  { name: '腾讯云开发者', url: 'https://cloud.tencent.com/developer', sourceCategory: 'community_column', lang: 'zh', qualityScore: 72 },
  { name: '掘金 AI', url: 'https://juejin.cn', sourceCategory: 'community_column', lang: 'zh', qualityScore: 66 },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', feedUrl: 'https://hnrss.org/frontpage', sourceCategory: 'aggregation', lang: 'en', qualityScore: 82 },
  { name: 'GitHub Blog', url: 'https://github.blog', feedUrl: 'https://github.blog/feed/', sourceCategory: 'official_source', lang: 'en', qualityScore: 86 },
  { name: 'Hugging Face Blog', url: 'https://huggingface.co/blog', feedUrl: 'https://huggingface.co/blog/feed.xml', sourceCategory: 'official_source', lang: 'en', qualityScore: 88 },
  { name: 'OpenAI Blog', url: 'https://openai.com/news', feedUrl: 'https://openai.com/news/rss.xml', sourceCategory: 'official_source', lang: 'en', qualityScore: 92 },
  { name: 'Anthropic News', url: 'https://www.anthropic.com/news', sourceCategory: 'official_source', lang: 'en', qualityScore: 90 },
  { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/', sourceCategory: 'official_source', lang: 'en', qualityScore: 88 },
  { name: 'DeepSeek', url: 'https://www.deepseek.com', sourceCategory: 'official_source', lang: 'zh', qualityScore: 88 },
  { name: '月之暗面 Kimi', url: 'https://www.moonshot.cn', sourceCategory: 'official_source', lang: 'zh', qualityScore: 84 },
  { name: '阿里通义', url: 'https://tongyi.aliyun.com', sourceCategory: 'official_source', lang: 'zh', qualityScore: 84 },
  { name: '火山引擎豆包', url: 'https://www.volcengine.com/product/doubao', sourceCategory: 'official_source', lang: 'zh', qualityScore: 82 },
];

function absoluteUrl(base: string, maybeUrl: string) {
  try {
    return new URL(maybeUrl, base).toString();
  } catch {
    return maybeUrl;
  }
}

async function discoverFeedUrl(url: string) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AIBoxPro/1.0 source discovery' },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return undefined;
    const html = await res.text();
    const $ = loadHtml(html);
    const href = $('link[type="application/rss+xml"], link[type="application/atom+xml"]')
      .first()
      .attr('href');
    return href ? absoluteUrl(url, href) : undefined;
  } catch {
    return undefined;
  }
}

async function sampleFeed(feedUrl: string | undefined) {
  if (!feedUrl) return { recentTitles: [] as string[], aiRelatedCount: 0, toolRelatedCount: 0 };
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'AIBoxPro/1.0 source discovery' },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return { recentTitles: [], aiRelatedCount: 0, toolRelatedCount: 0 };
    const xml = await res.text();
    const $ = loadHtml(xml, { xmlMode: true });
    const titles = $('item title, entry title')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean)
      .slice(0, 10);
    return {
      recentTitles: titles,
      aiRelatedCount: titles.filter((title) => AI_RE.test(title)).length,
      toolRelatedCount: titles.filter((title) => TOOL_RE.test(title)).length,
    };
  } catch {
    return { recentTitles: [], aiRelatedCount: 0, toolRelatedCount: 0 };
  }
}

export async function discoverSourceCandidates() {
  let upserted = 0;
  const existingSources = await db.select({ url: sources.url, feedUrl: sources.feedUrl }).from(sources);
  const existingUrls = new Set(existingSources.flatMap((source) => [source.url, source.feedUrl]).filter(Boolean));

  for (const seed of CURATED_SOURCE_SEEDS) {
    if (existingUrls.has(seed.url) || (seed.feedUrl && existingUrls.has(seed.feedUrl))) {
      await db
        .update(sourceCandidates)
        .set({
          status: 'approved',
          reviewedBy: 'system-existing-source',
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(sourceCandidates.url, seed.url));
      continue;
    }

    const feedUrl = seed.feedUrl ?? await discoverFeedUrl(seed.url);
    if (feedUrl && existingUrls.has(feedUrl)) {
      await db
        .update(sourceCandidates)
        .set({
          status: 'approved',
          reviewedBy: 'system-existing-source',
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(sourceCandidates.url, seed.url));
      continue;
    }
    const sample = await sampleFeed(feedUrl);
    const aiRelevanceScore = Math.min(100, sample.aiRelatedCount * 10);
    const toolRelevanceScore = Math.min(100, sample.toolRelatedCount * 10);
    const notes = [
      seed.feedUrl ? '提供已知 RSS。' : feedUrl ? '从首页自动发现 RSS。' : '未发现稳定 RSS，需人工确认抓取方式。',
      sample.recentTitles.length > 0 ? `采样 ${sample.recentTitles.length} 条标题。` : '暂未采样到标题。',
    ];

    await db
      .insert(sourceCandidates)
      .values({
        name: seed.name,
        url: seed.url,
        feedUrl,
        sourceCategory: seed.sourceCategory,
        lang: seed.lang,
        discoverySource: seed.discoverySource ?? 'curated-formal-list',
        qualityScore: seed.qualityScore,
        aiRelevanceScore,
        toolRelevanceScore,
        updateFrequency: sample.recentTitles.length > 0 ? 'active' : 'unknown',
        evidence: {
          recentTitles: sample.recentTitles,
          aiRelatedCount: sample.aiRelatedCount,
          toolRelatedCount: sample.toolRelatedCount,
          notes,
        },
      })
      .onConflictDoUpdate({
        target: sourceCandidates.url,
        set: {
          feedUrl,
          sourceCategory: seed.sourceCategory,
          lang: seed.lang,
          discoverySource: seed.discoverySource ?? 'curated-formal-list',
          qualityScore: seed.qualityScore,
          aiRelevanceScore,
          toolRelevanceScore,
          updateFrequency: sample.recentTitles.length > 0 ? 'active' : 'unknown',
          evidence: {
            recentTitles: sample.recentTitles,
            aiRelatedCount: sample.aiRelatedCount,
            toolRelatedCount: sample.toolRelatedCount,
            notes,
          },
          updatedAt: new Date(),
        },
      });
    upserted++;
  }

  return { upserted };
}
