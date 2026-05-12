import { db } from '@/lib/db';
import { githubTrending } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
async function main() {
  const rows = await db.select({ id: githubTrending.id, repo: githubTrending.repo, period: githubTrending.period, gained: githubTrending.gained }).from(githubTrending).where(eq(githubTrending.period, 'week')).orderBy(desc(githubTrending.gained)).limit(5);
  console.log(JSON.stringify(rows, null, 2));
}
main().catch(e => { console.error(e.message); process.exit(1); });
