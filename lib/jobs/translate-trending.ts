import { db } from '@/lib/db';
import { githubTrending } from '@/lib/db/schema';
import { isNull, eq } from 'drizzle-orm';
import { translateBatchToZh } from '@/lib/llm';

const BATCH_SIZE = 10;

export async function translateMissingTrending(): Promise<{ translated: number; skipped: number }> {
  const rows = await db
    .select({ id: githubTrending.id, description: githubTrending.description })
    .from(githubTrending)
    .where(isNull(githubTrending.descriptionZh));

  if (rows.length === 0) return { translated: 0, skipped: 0 };

  // Dedupe by description text — same repo appears in today/week/month
  const uniqDescs = Array.from(new Set(rows.map((r) => r.description)));
  const map = new Map<string, string>();

  for (let i = 0; i < uniqDescs.length; i += BATCH_SIZE) {
    const batch = uniqDescs.slice(i, i + BATCH_SIZE);
    const zhs = await translateBatchToZh(batch);
    batch.forEach((en, j) => map.set(en, zhs[j]));
  }

  let translated = 0;
  for (const r of rows) {
    const zh = map.get(r.description);
    if (!zh) continue;
    await db.update(githubTrending).set({ descriptionZh: zh }).where(eq(githubTrending.id, r.id));
    translated++;
  }

  return { translated, skipped: rows.length - translated };
}
