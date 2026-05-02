import { discoverToolSignals } from '@/lib/jobs/discover-tool-signals';

(async () => {
  const result = await discoverToolSignals();
  console.log(JSON.stringify(result, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
