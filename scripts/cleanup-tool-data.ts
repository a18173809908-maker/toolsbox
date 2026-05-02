/**
 * 清理工具库中误抓的新闻文章条目，并禁用产出噪音数据的工具源。
 * 运行：npm run cleanup:tool-data
 */
import { db } from '@/lib/db';
import { tools, toolCandidates, sources } from '@/lib/db/schema';
import { or, ilike, eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// 匹配新闻文章的关键词（与 process-tool-candidates.ts 保持一致）
const NEWS_KEYWORDS = [
  '%Digest%', '%Newsletter%', '%Roundup%', '%Recap%',
  '%Monday%', '%Tuesday%', '%Wednesday%', '%Thursday%',
  '%Friday%', '%Saturday%', '%Sunday%',
  '%Issue #%', '%Vol.%', '%Wrap-up%', '%Wrap Up%',
];

function buildConditions() {
  return NEWS_KEYWORDS.map((kw) => ilike(tools.name, kw));
}

function buildCandidateConditions() {
  return NEWS_KEYWORDS.map((kw) => ilike(toolCandidates.name, kw));
}

async function main() {
  console.log('─── 1. 预览将被删除的工具条目 ───');
  const toDelete = await db
    .select({ id: tools.id, name: tools.name })
    .from(tools)
    .where(or(...buildConditions()));

  if (toDelete.length === 0) {
    console.log('  没有需要删除的条目');
  } else {
    toDelete.forEach((t) => console.log(`  删除: [${t.id}] ${t.name}`));
  }

  console.log(`\n─── 2. 删除 tools 表中 ${toDelete.length} 条噪音数据 ───`);
  if (toDelete.length > 0) {
    const result = await db.delete(tools).where(or(...buildConditions()));
    console.log(`  已删除 ${result.rowCount ?? toDelete.length} 条`);
  }

  console.log('\n─── 3. 清理 tool_candidates 表中同类数据 ───');
  const candidateResult = await db
    .delete(toolCandidates)
    .where(or(...buildCandidateConditions()));
  console.log(`  已删除 ${candidateResult.rowCount ?? 0} 条候选数据`);

  console.log('\n─── 4. 禁用工具发现源（暂停抓取，避免继续产生噪音）───');
  const disableResult = await db
    .update(sources)
    .set({ active: false })
    .where(eq(sources.type, 'tool'));
  console.log(`  已禁用 ${disableResult.rowCount ?? 0} 个工具源`);

  console.log('\n─── 完成 ───');
  console.log('工具库已清理干净。工具源已暂停，待找到高质量来源后手动重新启用。');

  process.exit(0);
}

main().catch((err) => {
  console.error('清理失败:', err);
  process.exit(1);
});
