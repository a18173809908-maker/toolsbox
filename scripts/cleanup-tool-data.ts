/**
 * 清理工具库中误抓的新闻文章条目，并禁用产出噪音数据的工具源。
 * 运行：npm run cleanup:tool-data
 */
import { db } from '@/lib/db';
import { tools, toolCandidates, sources } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { looksLikeToolNoise } from '@/lib/tool-noise';

async function main() {
  const apply = process.argv.includes('--apply');
  console.log('─── 1. 预览将被删除的工具条目 ───');
  const rows = await db.select({ id: tools.id, name: tools.name, url: tools.url }).from(tools);
  const toDelete = rows.filter(looksLikeToolNoise);

  if (toDelete.length === 0) {
    console.log('  没有需要删除的条目');
  } else {
    toDelete.forEach((t) => console.log(`  ${apply ? '删除' : '将删除'}: [${t.id}] ${t.name}`));
  }

  console.log(`\n─── 2. ${apply ? '删除' : '预览'} tools 表中 ${toDelete.length} 条噪音数据 ───`);
  if (apply && toDelete.length > 0) {
    const result = await db.delete(tools).where(inArray(tools.id, toDelete.map((t) => t.id)));
    console.log(`  已删除 ${result.rowCount ?? toDelete.length} 条`);
  }

  console.log('\n─── 3. 清理 tool_candidates 表中同类数据 ───');
  const candidateRows = await db
    .select({ id: toolCandidates.id, name: toolCandidates.name, url: toolCandidates.url })
    .from(toolCandidates);
  const candidatesToDelete = candidateRows.filter(looksLikeToolNoise);
  if (apply && candidatesToDelete.length > 0) {
    const candidateResult = await db
      .delete(toolCandidates)
      .where(inArray(toolCandidates.id, candidatesToDelete.map((t) => t.id)));
    console.log(`  已删除 ${candidateResult.rowCount ?? candidatesToDelete.length} 条候选数据`);
  } else {
    console.log(`  ${apply ? '已删除' : '将删除'} ${candidatesToDelete.length} 条候选数据`);
  }

  console.log('\n─── 4. 禁用工具发现源（暂停抓取，避免继续产生噪音）───');
  if (apply) {
    const disableResult = await db
      .update(sources)
      .set({ active: false })
      .where(eq(sources.type, 'tool'));
    console.log(`  已禁用 ${disableResult.rowCount ?? 0} 个工具源`);
  } else {
    console.log('  预览模式未禁用；如需执行请加 --apply');
  }

  console.log('\n─── 完成 ───');
  console.log(apply ? '工具库已清理干净。工具源已暂停，待找到高质量来源后手动重新启用。' : '当前为预览模式，未写入数据库。');

  process.exit(0);
}

main().catch((err) => {
  console.error('清理失败:', err);
  process.exit(1);
});
