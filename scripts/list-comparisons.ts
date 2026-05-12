import { db } from '@/lib/db';
import { comparisons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const rows = await db
    .select({ id: comparisons.id, a: comparisons.toolAId, b: comparisons.toolBId })
    .from(comparisons)
    .where(eq(comparisons.status, 'published'));

  rows.sort((x, y) => x.id.localeCompare(y.id)).forEach((r) =>
    console.log(`${r.id}  (${r.a} / ${r.b})`)
  );
}

main().catch(console.error);
