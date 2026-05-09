import { discoverSourceCandidates } from '@/lib/source-discovery';

(async () => {
  console.log('Discovering source candidates...');
  const result = await discoverSourceCandidates();
  console.log(`  upserted: ${result.upserted}`);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
