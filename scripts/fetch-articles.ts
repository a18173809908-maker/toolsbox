import { fetchAllArticles } from '@/lib/jobs/fetch-articles';

(async () => {
  console.log('Fetching articles from all active sources…');
  const results = await fetchAllArticles();
  for (const r of results) {
    if (r.error) console.log(`  ✗ ${r.source}: ${r.error}`);
    else console.log(`  ✓ ${r.source}: +${r.fetched} new`);
  }
  const total = results.reduce((s, r) => s + r.fetched, 0);
  console.log(`Total inserted: ${total}`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
