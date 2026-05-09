import { enhanceTrending } from '@/lib/jobs/enhance-trending';

(async () => {
  const period = process.argv[2];
  console.log(`Enhancing GitHub trending insights${period ? ` (${period})` : ''}...`);
  const result = await enhanceTrending(period);
  console.log(`  processed: ${result.processed}, skipped: ${result.skipped}`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
