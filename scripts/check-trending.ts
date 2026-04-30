import { db } from '@/lib/db';
import { githubTrending } from '@/lib/db/schema';

(async () => {
  const all = await db.select().from(githubTrending);
  const missing = all.filter((r) => !r.descriptionZh);
  console.log(`total rows: ${all.length}, missing zh: ${missing.length}`);
  for (const r of missing) console.log(`  - [${r.period}] ${r.repo} :: "${r.description}"`);
  console.log('--- 3 sample translated ---');
  for (const r of all.filter((x) => x.descriptionZh).slice(0, 3)) {
    console.log(`  ${r.repo}\n    en: ${r.description}\n    zh: ${r.descriptionZh}`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
