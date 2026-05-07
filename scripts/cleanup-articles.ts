/**
 * Hide low-trust article rows without deleting historical records.
 * Run: npm run cleanup:articles
 */
import { db } from '@/lib/db';
import { articles, sources } from '@/lib/db/schema';
import { and, eq, inArray, lt, sql } from 'drizzle-orm';

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
    .where(inArray(articles.id, ids));
  return result.rowCount ?? ids.length;
}

async function main() {
  // 乱码识别覆盖以下模式：
  // 1. U+FFFD 替换字符 �（UTF-8 解码失败的标记）—— 一个就算
  // 2. 锟斤拷 / 锟 系列（GBK 解码失败回到 UTF-8 的典型 mojibake）—— 一个就算
  // 3. 连续 3+ 个 ? 或 < —— 编码错误的另一种表现
  // 4. mojibake â€ / ä¸ 系列（Windows-1252 ↔ UTF-8 误转）
  const mojibakePatterns = sql`
    ${articles.title} LIKE '%' || chr(65533) || '%'
    OR coalesce(${articles.titleZh}, '') LIKE '%' || chr(65533) || '%'
    OR coalesce(${articles.summaryZh}, '') LIKE '%' || chr(65533) || '%'
    OR ${articles.title} LIKE '%锟%'
    OR coalesce(${articles.titleZh}, '') LIKE '%锟%'
    OR coalesce(${articles.summaryZh}, '') LIKE '%锟%'
    OR ${articles.title} ~ '(\\?|<){3,}'
    OR coalesce(${articles.titleZh}, '') ~ '(\\?|<){3,}'
    OR coalesce(${articles.summaryZh}, '') ~ '(\\?|<){3,}'
    OR ${articles.title} LIKE '%â€%'
    OR coalesce(${articles.titleZh}, '') LIKE '%â€%'
    OR ${articles.title} LIKE '%ä¸%'
    OR coalesce(${articles.titleZh}, '') LIKE '%ä¸%'
  `;

  const mojibakeRows = await db
    .select({ id: articles.id })
    .from(articles)
    .where(and(eq(articles.status, 'published'), mojibakePatterns));

  const zhSourceRows = await db
    .select({ id: articles.id, title: articles.title, titleZh: articles.titleZh })
    .from(articles)
    .leftJoin(sources, eq(articles.sourceId, sources.id))
    .where(and(eq(articles.status, 'published'), eq(sources.lang, 'zh')));

  const languageMismatchIds = zhSourceRows
    .filter((row) => isAsciiOnly(row.titleZh || row.title))
    .map((row) => row.id);

  // 白皮书 §2.5 主力用户是中文用户，G4 任务已经关停了英文源（source.active=false）。
  // 所有来自 lang='en' 源的 published 文章都应该 hide，包括早期入库的历史数据。
  // 这一类型独立于"乱码"和"过期"，不会被前两个规则覆盖。
  const enSourceRows = await db
    .select({ id: articles.id })
    .from(articles)
    .leftJoin(sources, eq(articles.sourceId, sources.id))
    .where(and(eq(articles.status, 'published'), eq(sources.lang, 'en')));
  const enSourceIds = enSourceRows.map((row) => row.id);

  const staleRows = await db
    .select({ id: articles.id })
    .from(articles)
    .where(and(eq(articles.status, 'published'), lt(articles.publishedAt, cutoff)));

  const mojibakeIds = mojibakeRows.map((row) => row.id);
  const staleIds = staleRows.map((row) => row.id);
  const allIds = [...new Set([...mojibakeIds, ...languageMismatchIds, ...enSourceIds, ...staleIds])];
  const hidden = await hideByIds(allIds);

  console.log(
    `隐藏 ${hidden} 条（乱码 ${mojibakeIds.length} / 语言错误 ${languageMismatchIds.length} / 英文源 ${enSourceIds.length} / 过期 ${staleIds.length}）`
  );
}

main().catch((error) => {
  console.error('清理资讯失败:', error);
  process.exit(1);
});
