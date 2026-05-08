import { neon } from '@neondatabase/serverless';

// 一次性脚本：把所有 status='draft' 的对比页改为 published。
// 由用户明确授权 Claude 代审，故 reviewed_by 标记为 'claude-assisted'，
// 与人工审核 ('admin') 区分，便于后续审计。
async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const now = new Date();
  const result = (await sql`
    UPDATE comparisons SET
      status = 'published',
      published_at = ${now},
      reviewed_by = 'claude-assisted',
      reviewed_at = ${now},
      updated_at = ${now}
    WHERE status = 'draft'
    RETURNING id
  `) as { id: string }[];

  if (result.length === 0) {
    console.log('没有 draft 对比页需要发布');
    return;
  }
  console.log(`✓ 已发布 ${result.length} 篇对比页：`);
  for (const r of result) console.log(`   - https://www.aiboxpro.cn/compare/${r.id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
