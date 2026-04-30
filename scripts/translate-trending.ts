import { translateMissingTrending } from '@/lib/jobs/translate-trending';

(async () => {
  console.log('translating missing zh descriptions…');
  const r = await translateMissingTrending();
  console.log(`✓ translated ${r.translated} rows (skipped ${r.skipped})`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
