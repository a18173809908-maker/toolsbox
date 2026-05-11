import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { toolCandidates } from '@/lib/db/schema';

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing');
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  const candidates = await db.select().from(toolCandidates);
  console.log(`候选工具总数：${candidates.length}`);

  if (candidates.length > 0) {
    console.log('候选工具示例：');
    candidates.slice(0, 3).forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} (${c.catId})`);
    });
  }
}

main().catch(console.error);
