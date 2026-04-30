import { processArticles } from '@/lib/jobs/process-articles';

(async () => {
  console.log('Processing articles (AI translate + summarise)…');
  const result = await processArticles();
  console.log(`  processed: ${result.processed}, skipped: ${result.skipped}`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
