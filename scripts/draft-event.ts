// 起草事件主体 → events 表（status='ai_drafted'）
// 用法：npm run draft:event <slug> [articleId1,articleId2,...]

import { db } from '@/lib/db';
import { articles, events, sources } from '@/lib/db/schema';
import { eq, inArray, desc, and } from 'drizzle-orm';
import { runDraft } from '@/lib/draft/runner';

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('用法：npm run draft:event <slug> [articleId1,articleId2,...]');
    process.exit(1);
  }

  // 可选：指定要聚合的 article IDs（逗号分隔）
  const articleIdsArg = process.argv[3];
  let articleIds: number[] = [];
  let articleRows: { id: number; title: string; titleZh: string | null; url: string; publishedAt: Date | null; sourceName: string | null }[] = [];

  if (articleIdsArg) {
    articleIds = articleIdsArg.split(',').map(Number).filter((n) => !isNaN(n));
    articleRows = await db
      .select({
        id: articles.id,
        title: articles.title,
        titleZh: articles.titleZh,
        url: articles.url,
        publishedAt: articles.publishedAt,
        sourceName: sources.name,
      })
      .from(articles)
      .leftJoin(sources, eq(articles.sourceId, sources.id))
      .where(and(inArray(articles.id, articleIds)));
  } else {
    // 不传 articleIds 时：加载最近文章（人工确认相关性）
    articleRows = await db
      .select({
        id: articles.id,
        title: articles.title,
        titleZh: articles.titleZh,
        url: articles.url,
        publishedAt: articles.publishedAt,
        sourceName: sources.name,
      })
      .from(articles)
      .leftJoin(sources, eq(articles.sourceId, sources.id))
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt))
      .limit(20);
    articleIds = articleRows.map((r) => r.id);
    console.log(`（未指定 article IDs，加载最近 20 条，请确认是否相关）`);
  }

  console.log(`起草 event：${slug}（${articleRows.length} 条资讯）`);

  const inputData = {
    slug,
    articles: articleRows.map((r) => ({
      id: r.id,
      title: r.titleZh || r.title,
      url: r.url,
      publishedAt: r.publishedAt?.toISOString().slice(0, 10),
      source: r.sourceName,
    })),
  };

  await runDraft({
    promptType: 'event-draft',
    inputData,
    adminPath: '/admin/events',
    insertFn: async ({ parsed: draft, rawOutput, promptVersion, llmModel, antiClicheScore }) => {
      const d = (draft ?? {}) as Record<string, unknown>;
      const title = typeof d.title === 'string' ? d.title : slug;
      const summary = typeof d.summary === 'string' ? d.summary : null;
      const body = typeof d.body === 'string' ? d.body : rawOutput;

      const result = await db
        .insert(events)
        .values({
          slug,
          title,
          summary,
          body,
          articleIds,
          promptVersion: promptVersion ?? null,
          llmModel: llmModel ?? null,
          antiClicheScore,
        })
        .returning({ id: events.id });

      return result[0].id;
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
