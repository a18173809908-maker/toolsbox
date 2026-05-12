import { db } from '@/lib/db';
import { tools } from '@/lib/db/schema';
import { ilike, or } from 'drizzle-orm';

async function main() {
  const keywords = ['windsurf', 'claude', 'trae', 'copilot', 'continue', 'capcut', 'filmora'];
  const rows = await db.select().from(tools).where(
    or(...keywords.map((k) => ilike(tools.name, `%${k}%`)))
  );
  for (const r of rows) console.log(`${r.id}  ${r.name}  [${r.catId}]`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
