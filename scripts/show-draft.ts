import { db } from '@/lib/db';
import { alternativeDrafts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const rows = await db.select().from(alternativeDrafts)
    .orderBy(alternativeDrafts.createdAt)
    .limit(1);
  if (!rows.length) { console.log('not found'); return; }
  const r = rows[0];
  console.log('score:', r.antiClicheScore);
  console.log('draft:', JSON.stringify(r.aiDraft, null, 2));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
