import { db } from '@/lib/db';
import { tools } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';

async function main() {
  const rows = await db
    .select()
    .from(tools)
    .where(or(eq(tools.catId, 'video'), eq(tools.catId, 'code')));

  const video = rows.filter((r) => r.catId === 'video');
  const coding = rows.filter((r) => r.catId === 'code');

  console.log(`\nVIDEO tools (${video.length}):`);
  for (const t of video) console.log(`  ${t.id}  ${t.name}`);

  console.log(`\nCODING tools (${coding.length}):`);
  for (const t of coding) console.log(`  ${t.id}  ${t.name}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
