import { neon } from '@neondatabase/serverless';

// 一次性脚本：把"未经审核就 approve"的 10 篇对比页改回 draft，
// 让它们重新进入 /admin/comparisons 审核队列。
const TARGETS = [
  'claude-code-vs-codex',
  'claude-code-vs-cursor',
  'cursor-vs-github-copilot',
  'cursor-vs-trae',
  'cursor-vs-windsurf',
  'deepseek-vs-chatgpt',
  'deepseek-vs-kimi',
  'doubao-vs-kimi',
  'kimi-vs-wenxin',
  'trae-vs-github-copilot',
];

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const now = new Date();
  const result = (await sql`
    UPDATE comparisons SET
      status = 'draft',
      published_at = NULL,
      reviewed_by = NULL,
      reviewed_at = NULL,
      updated_at = ${now}
    WHERE id = ANY(${TARGETS})
    RETURNING id
  `) as { id: string }[];

  console.log(`✓ 已将 ${result.length} 篇对比页改回 draft：`);
  for (const r of result) console.log(`   - ${r.id}`);
  console.log(`\n请到 https://www.aiboxpro.cn/admin/comparisons 逐篇审核`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
