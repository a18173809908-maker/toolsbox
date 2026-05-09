import { db } from '@/lib/db';
import { articles, sources } from '@/lib/db/schema';
import { estimateArticleHotness } from '@/lib/article-hotness';
import { desc, eq } from 'drizzle-orm';

const LIMIT = Number(process.argv[2] ?? 300);

(async () => {
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      titleZh: articles.titleZh,
      summary: articles.summary,
      summaryZh: articles.summaryZh,
      tag: articles.tag,
      sourceName: sources.name,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .leftJoin(sources, eq(articles.sourceId, sources.id))
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.publishedAt), desc(articles.fetchedAt))
    .limit(LIMIT);

  let updated = 0;
  for (const row of rows) {
    const hotnessScore = estimateArticleHotness(row);
    await db.update(articles).set({ hotnessScore }).where(eq(articles.id, row.id));
    updated++;
  }

  console.log(`Updated article hotness scores: ${updated}`);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
