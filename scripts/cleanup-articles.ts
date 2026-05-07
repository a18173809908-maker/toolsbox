/**
 * Hide low-trust article rows without deleting historical records.
 * Run: npm run cleanup:articles
 */
import { db } from '@/lib/db';
import { articles, sources } from '@/lib/db/schema';
import { and, eq, lt, or, sql } from 'drizzle-orm';

const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - 180);

function isAsciiOnly(value: string | null) {
  if (!value) return false;
  return /^[\x00-\x7F\s.,:;!?'"()\-–—|/\\[\]{}&%$#@+*=<>0-9A-Za-z]+$/.test(value.trim());
}

async function hideByIds(ids: number[]) {
  if (ids.length === 0) return 0;
  const result = await db
    .update(articles)
    .set({ status: 'hidden' })
    .where(sql`${articles.id} = any(${ids})`);
  return result.rowCount ?? ids.length;
}

async function main() {
  const mojibakeRows = await db
    .select({ id: articles.id })
    .from(articles)
    .where(
      and(
        eq(articles.status, 'published'),
        or(
          sql`${articles.title} ~ '(<|\\?){3,}'`,
          sql`${articles.titleZh} ~ '(<|\\?){3,}'`,
          sql`${articles.summaryZh} ~ '(<|\\?){3,}'`
        )
      )
    );

  const zhSourceRows = await db
    .select({ id: articles.id, title: articles.title, titleZh: articles.titleZh })
    .from(articles)
    .leftJoin(sources, eq(articles.sourceId, sources.id))
    .where(and(eq(articles.status, 'published'), eq(sources.lang, 'zh')));

  const languageMismatchIds = zhSourceRows
    .filter((row) => isAsciiOnly(row.titleZh || row.title))
    .map((row) => row.id);

  const staleRows = await db
    .select({ id: articles.id })
    .from(articles)
    .where(and(eq(articles.status, 'published'), lt(articles.publishedAt, cutoff)));

  const mojibakeIds = mojibakeRows.map((row) => row.id);
  const staleIds = staleRows.map((row) => row.id);
  const allIds = [...new Set([...mojibakeIds, ...languageMismatchIds, ...staleIds])];
  const hidden = await hideByIds(allIds);

  console.log(
    `隐藏 ${hidden} 条（乱码 ${mojibakeIds.length} / 语言错误 ${languageMismatchIds.length} / 过期 ${staleIds.length}）`
  );
}

main().catch((error) => {
  console.error('清理资讯失败:', error);
  process.exit(1);
});
