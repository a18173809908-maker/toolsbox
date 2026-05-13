import { config } from 'dotenv';
config({ path: '.env.local' });

import { refreshAllTrending } from '@/lib/jobs/refresh-trending';

(async () => {
  console.log('refreshing GitHub trending…');
  const r = await refreshAllTrending();
  for (const row of r) {
    if (row.error) console.log(`  ✗ ${row.period}: ${row.error}`);
    else console.log(`  ✓ ${row.period}: ${row.upserted} repos`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
