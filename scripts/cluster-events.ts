/**
 * 事件聚类脚本（T5.1）
 * 从近期文章中提取相关文章组，用 AI 生成事件主体。
 *
 * 用法：
 *   npx tsx scripts/cluster-events.ts
 *   npx tsx scripts/cluster-events.ts --days 7   # 最近 7 天（默认 3 天）
 *   npx tsx scripts/cluster-events.ts --ids 1,2,3  # 手动指定文章 ID
 *
 * 流程：
 *   1. 读取最近 N 天的已发布文章（hotnessScore >= 40）
 *   2. 用 AI 把标题聚类成事件组（去重，每组 ≥ 2 篇）
 *   3. 对每个事件组调用 event-draft prompt 生成事件主体
 *   4. 写入 events 表（status='ai_drafted'），前往 /admin/events 审核
 */

import { db } from '@/lib/db';
import { articles, events } from '@/lib/db/schema';
import { and, eq, gte, desc, inArray } from 'drizzle-orm';
import { runDraft } from '@/lib/draft/runner';
import { chat } from '@/lib/llm';

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function parseArgs() {
  const args = process.argv.slice(2);
  let days = 3;
  let manualIds: number[] | null = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--days' && args[i + 1]) days = parseInt(args[i + 1], 10);
    if (args[i] === '--ids' && args[i + 1]) manualIds = args[i + 1].split(',').map(Number);
  }
  return { days, manualIds };
}

async function clusterTitles(articleList: { id: number; title: string; titleZh: string | null }[]) {
  const prompt = `你是 AIBoxPro 的编辑，下面是最近若干篇 AI 资讯的标题列表。
请把属于同一个事件/话题的文章归为一组。

规则：
- 每组至少 2 篇，最多 8 篇
- 只有真正相关（同一个工具的同一次更新/同一个事件）才放一组
- 无法归组的文章忽略
- 输出 JSON，每组给一个简短英文 slug（kebab-case，全小写，如 cursor-1-0-release）

输入：
${JSON.stringify(articleList.map((a) => ({ id: a.id, title: a.titleZh || a.title })), null, 2)}

输出格式（严格 JSON）：
{
  "clusters": [
    { "slug": "event-slug", "articleIds": [1, 2, 3] },
    { "slug": "another-event", "articleIds": [4, 5] }
  ]
}`;

  const raw = await chat([{ role: 'user', content: prompt }], { temperature: 0.3, maxTokens: 800, tier: 'standard' });
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('no json');
    const parsed = JSON.parse(raw.slice(start, end + 1)) as { clusters: { slug: string; articleIds: number[] }[] };
    return parsed.clusters ?? [];
  } catch {
    console.warn('  ⚠ 聚类输出解析失败，跳过');
    return [];
  }
}

async function main() {
  const { days, manualIds } = parseArgs();

  // 1. 加载文章
  let articleList;
  if (manualIds) {
    articleList = await db.select({ id: articles.id, title: articles.title, titleZh: articles.titleZh, summary: articles.summary, summaryZh: articles.summaryZh, url: articles.url })
      .from(articles)
      .where(inArray(articles.id, manualIds));
    console.log(`📄 手动指定 ${articleList.length} 篇文章`);
  } else {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    articleList = await db.select({ id: articles.id, title: articles.title, titleZh: articles.titleZh, summary: articles.summary, summaryZh: articles.summaryZh, url: articles.url })
      .from(articles)
      .where(and(eq(articles.status, 'published'), gte(articles.publishedAt, since)))
      .orderBy(desc(articles.hotnessScore))
      .limit(60);
    console.log(`📄 最近 ${days} 天找到 ${articleList.length} 篇文章`);
  }

  if (articleList.length < 2) {
    console.log('文章数不足，退出');
    return;
  }

  // 2. 聚类
  console.log('\n🔍 AI 聚类中...');
  const clusters = await clusterTitles(articleList);
  console.log(`  → 识别出 ${clusters.length} 个事件组`);

  if (clusters.length === 0) {
    console.log('没有可聚合的事件组，退出');
    return;
  }

  // 3. 检查已存在的 slug
  const existingSlugs = new Set(
    (await db.select({ slug: events.slug }).from(events)).map((r) => r.slug)
  );

  const results: { slug: string; ok: boolean; error?: string }[] = [];

  for (const cluster of clusters) {
    if (existingSlugs.has(cluster.slug)) {
      console.log(`\n⏭  已存在: ${cluster.slug}`);
      results.push({ slug: cluster.slug, ok: true });
      continue;
    }

    console.log(`\n──────────────────────────────────────────────`);
    console.log(`事件组: ${cluster.slug} (${cluster.articleIds.length} 篇文章)`);

    try {
      const relatedArticles = articleList.filter((a) => cluster.articleIds.includes(a.id));

      const inputData = {
        slug: cluster.slug,
        articles: relatedArticles.map((a) => ({
          id: a.id,
          title: a.titleZh || a.title,
          summary: a.summaryZh || a.summary,
          url: a.url,
        })),
      };

      await runDraft({
        promptType: 'event-draft',
        inputData,
        adminPath: '/admin/events',
        insertFn: async ({ parsed, rawOutput, promptVersion, llmModel, antiClicheScore }) => {
          const d = parsed ?? {};
          const title = typeof d.title === 'string' ? d.title : rawOutput.slice(0, 40).replace(/\n/g, ' ');
          const summary = typeof d.summary === 'string' ? d.summary : null;
          const body = typeof d.body === 'string' ? d.body : null;

          const row = await db.insert(events).values({
            slug: cluster.slug,
            title,
            summary,
            body,
            articleIds: cluster.articleIds,
            promptVersion,
            llmModel,
            antiClicheScore,
            status: 'ai_drafted',
          }).returning({ id: events.id });
          return row[0].id;
        },
      });

      results.push({ slug: cluster.slug, ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ 失败: ${msg}`);
      results.push({ slug: cluster.slug, ok: false, error: msg.slice(0, 100) });
    }

    await sleep(2000);
  }

  // 汇总
  console.log('\n\n══════════════════════════════════════════════');
  console.log('聚类完成\n');
  const ok = results.filter((r) => r.ok);
  const fail = results.filter((r) => !r.ok);
  console.log(`✓ 成功: ${ok.length}  ✗ 失败: ${fail.length}`);
  if (fail.length) {
    console.log('\n失败列表:');
    for (const f of fail) console.log(`  ${f.slug}: ${f.error}`);
  }
  console.log('\n→ 前往 /admin/events 审核');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
