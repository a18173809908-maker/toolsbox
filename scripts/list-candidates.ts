import { db } from '../lib/db/index';
import { toolCandidates } from '../lib/db/schema';

async function main() {
  const candidates = await db.select().from(toolCandidates).limit(10);
  console.log('候选工具数据（前10条）：');
  console.log(JSON.stringify(candidates, null, 2));
  console.log(`\n候选工具总数：${candidates.length}`);
}

main().catch(console.error);
