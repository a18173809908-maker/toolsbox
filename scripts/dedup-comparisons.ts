// 将重复对比页（反向对）标记为 rejected，保留唯一版本。
// 用法：npm run dedup:comparisons
import { db } from '@/lib/db';
import { comparisons } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';

const DUPLICATES = [
  'claude-code-vs-cursor',    // → cursor-vs-claude-code
  'cursor-vs-trae',            // → trae-vs-cursor
  'cursor-vs-github-copilot',  // → github-copilot-vs-cursor
  'jimeng-vs-kling',           // → kling-vs-jimeng
  'sora-vs-runway',            // → runway-vs-sora-cinematic
];

async function main() {
  const result = await db
    .update(comparisons)
    .set({ status: 'rejected', rejectReason: 'duplicate — canonical slug exists' })
    .where(inArray(comparisons.id, DUPLICATES))
    .returning({ id: comparisons.id });

  console.log(`Rejected ${result.length} duplicate comparisons:`);
  result.forEach((r) => console.log(' ', r.id));
}

main().catch((e) => { console.error(e); process.exit(1); });
